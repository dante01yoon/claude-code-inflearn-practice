#!/bin/bash
# PreToolUse 훅: rm -rf 와 .env 파일 읽기를 막는다.
# exit 2 + stderr 메시지 = 도구 실행 차단 (메시지는 Claude에게 전달됨)

input=$(cat)
tool=$(jq -r '.tool_name' <<<"$input")

# .env, .env.local 등은 막고 .env.example / .env.sample 은 허용
is_env_path() {
  grep -Eq '(^|[^A-Za-z0-9_])\.env(\.[A-Za-z0-9_-]+)?($|[^A-Za-z0-9_.])' <<<"$1" &&
    ! grep -Eq '\.env\.(example|sample|template)' <<<"$1"
}

case "$tool" in
  Bash)
    cmd=$(jq -r '.tool_input.command // ""' <<<"$input")
    # rm 뒤에 -r 과 -f 가 모두 붙은 경우 (-rf, -fr, -Rf, -r -f, --recursive --force 등)
    if grep -Eq '(^|[;&|[:space:]])(sudo[[:space:]]+)?rm[[:space:]]' <<<"$cmd"; then
      flags=$(grep -Eo '(^|[;&|[:space:]])(sudo[[:space:]]+)?rm([[:space:]]+-[^[:space:]]+)+' <<<"$cmd")
      if grep -Eq -- '-[A-Za-z]*[rR]|--recursive' <<<"$flags" && grep -Eq -- '-[A-Za-z]*f|--force' <<<"$flags"; then
        echo "차단됨: rm -rf 는 이 프로젝트에서 금지되어 있습니다. 지울 파일을 하나씩 지정하거나 사용자에게 직접 실행을 요청하세요." >&2
        exit 2
      fi
    fi
    if is_env_path "$cmd"; then
      echo "차단됨: .env 파일은 비밀값이 들어 있어 읽거나 다룰 수 없습니다. 필요하면 사용자에게 물어보세요." >&2
      exit 2
    fi
    ;;
  Read|Grep)
    path=$(jq -r '.tool_input.file_path // .tool_input.path // ""' <<<"$input")
    if is_env_path "$(basename "$path")"; then
      echo "차단됨: .env 파일은 비밀값이 들어 있어 읽을 수 없습니다. 필요하면 사용자에게 물어보세요." >&2
      exit 2
    fi
    ;;
esac
exit 0

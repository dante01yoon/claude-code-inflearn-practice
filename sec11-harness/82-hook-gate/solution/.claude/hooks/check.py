#!/usr/bin/env python3
"""검증 훅: 파일을 고치면 문법 → 타입 → 테스트를 돌린다.

두 군데에서 불린다.
- PostToolUse(Edit·Write·MultiEdit 뒤): 고친 파일 하나를 바로 검사한다.
- Stop(`--stop`, 답을 끝낼 때): sed·셸 리다이렉트처럼 도구를 거치지 않고 바뀐 파일도
  잡도록, git 기준으로 바뀐 파일(HEAD와 다르거나 새로 생긴 파일)을 모아 한 번 더 검사한다.
  이미 같은 내용으로 통과한 파일은 건너뛴다(.claude/check-state.json에 해시를 남김).

통과하면 아무것도 출력하지 않는다(exit 0, 클로드 컨텍스트에 안 들어감).
실패하면 무엇이 깨졌는지 stderr에 쓰고 exit 2 — 클로드가 그 내용을 받아 고친다.
Stop에서는 같은 세션에서 연달아 MAX_STOP_BLOCKS번까지만 막는다(끝없이 안 끝나는 것 방지).

- 문법: .mjs·.js → node --check, .html → 안의 <script type="module">을 node --check,
        .json → json 파싱, .py → py_compile
- 타입: .ts·.mjs·.js → mcp-server의 tsc(루트 stats.mjs·subway-csv.mjs도 거기서 import됨)
- 테스트: .mjs·.js·.ts·.json·.csv → node --test(루트 npm test와 같음)
"""

import hashlib
import json
import os
import re
import subprocess
import sys

MAX_LINES = 40  # 실패 출력은 끝부분만 넘긴다
MAX_STOP_BLOCKS = 3  # Stop 훅이 연달아 막는 최대 횟수
TYPE_EXTS = (".ts", ".mjs", ".js")
TEST_EXTS = (".mjs", ".js", ".ts", ".json", ".csv")

e = json.load(sys.stdin)
root = os.environ.get("CLAUDE_PROJECT_DIR") or e.get("cwd", "")
state_path = os.path.join(root, ".claude", "check-state.json")


def skipped(path):
    """프로젝트 밖, 의존성, 워크트리, .env, 없는 파일은 검사하지 않는다."""
    rel = os.path.relpath(path, root)
    if rel.startswith("..") or re.match(r"(.*/)?(node_modules|\.claude/worktrees)/", rel):
        return True
    return os.path.basename(path).startswith(".env") or not os.path.isfile(path)


def run(cmd, cwd=root, stdin=None):
    """명령을 돌려 (성공 여부, 출력 끝부분)을 돌려준다."""
    p = subprocess.run(cmd, cwd=cwd, input=stdin, capture_output=True, text=True, timeout=120)
    out = (p.stdout + p.stderr).strip().splitlines()
    out = [l for l in out if not re.match(r"\s+at ", l)]  # 스택 줄은 뺀다
    return p.returncode == 0, "\n".join(out[-MAX_LINES:])


def ext_of(path):
    return os.path.splitext(path)[1].lower()


def check_syntax(path):
    ext, rel = ext_of(path), os.path.relpath(path, root)
    if ext in (".mjs", ".js"):
        return run(["node", "--check", path])
    if ext == ".html":
        html = open(path, encoding="utf-8").read()
        for m in re.finditer(r'<script type="module">(.*?)</script>', html, re.S):
            line = html.count("\n", 0, m.start(1)) + 1
            # 줄 번호가 html과 같도록 앞을 빈 줄로 채운다
            ok, out = run(["node", "--check", "--input-type=module", "-"],
                          stdin="\n" * (line - 1) + m.group(1))
            if not ok:
                return False, out.replace("[stdin]", rel)
        return True, ""
    if ext == ".json":
        try:
            json.load(open(path, encoding="utf-8"))
        except ValueError as err:
            return False, f"{rel}: {err}"
        return True, ""
    if ext == ".py":
        return run([sys.executable, "-m", "py_compile", path])
    return True, ""


def check_types():
    tsc = os.path.join(root, "mcp-server", "node_modules", ".bin", "tsc")
    if not os.path.exists(tsc):  # mcp-server 의존성을 안 깔았으면 건너뜀
        return True, ""
    return run([tsc, "-p", "."], cwd=os.path.join(root, "mcp-server"))


def check_tests():
    return run(["node", "--test", "--test-reporter=dot"])


def check_files(paths):
    """파일들을 검사해 실패하면 (검사 이름, 출력), 모두 통과하면 None을 돌려준다."""
    exts = {ext_of(p) for p in paths}
    checks = [(f"{os.path.relpath(p, root)} 문법", lambda p=p: check_syntax(p)) for p in paths]
    if exts & set(TYPE_EXTS):
        checks.append(("타입", check_types))
    if exts & set(TEST_EXTS):
        checks.append(("테스트", check_tests))
    for name, check in checks:
        try:
            ok, out = check()
        except subprocess.TimeoutExpired:
            ok, out = False, "시간 초과(120초)"
        if not ok:
            return name, out
    return None


def load_state():
    try:
        return json.load(open(state_path, encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def save_state(state):
    with open(state_path, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=1)


def digest(path):
    return hashlib.sha1(open(path, "rb").read()).hexdigest()


def remember_passed(state, paths):
    verified = state.setdefault("verified", {})
    for p in paths:
        verified[os.path.relpath(p, root)] = digest(p)


def changed_files():
    """git 기준으로 바뀐 파일: HEAD와 다른 추적 파일 + 무시되지 않은 새 파일."""
    names = set()
    for cmd in (["git", "diff", "--name-only", "HEAD"],
                ["git", "ls-files", "--others", "--exclude-standard"]):
        p = subprocess.run(cmd, cwd=root, capture_output=True, text=True)
        names.update(l for l in p.stdout.splitlines() if l)
    paths = (os.path.join(root, n) for n in sorted(names))
    return [p for p in paths if not skipped(p)]


def on_edit():
    path = (e.get("tool_input") or {}).get("file_path", "")
    if not path:
        return
    path = os.path.abspath(path)
    if skipped(path):
        return
    failed = check_files([path])
    if failed:
        name, out = failed
        rel = os.path.relpath(path, root)
        print(f"[검증 훅] {rel} 수정 후 {name} 검사 실패:\n{out}", file=sys.stderr)
        sys.exit(2)
    state = load_state()
    remember_passed(state, [path])
    save_state(state)


def on_stop():
    state = load_state()
    verified = state.get("verified", {})
    todo = [p for p in changed_files() if verified.get(os.path.relpath(p, root)) != digest(p)]
    if not todo:
        return
    failed = check_files(todo)
    session = e.get("session_id", "")
    if not failed:
        remember_passed(state, todo)
        state.pop("blocks", None)
        save_state(state)
        return
    blocks = state.get("blocks", {})
    count = blocks.get(session, 0) if e.get("stop_hook_active") else 0
    if count >= MAX_STOP_BLOCKS:  # 여러 번 막아도 안 고쳐지면 사용자에게 넘긴다
        state.pop("blocks", None)
        save_state(state)
        return
    state["blocks"] = {session: count + 1}
    save_state(state)
    name, out = failed
    rels = ", ".join(os.path.relpath(p, root) for p in todo)
    print(f"[검증 훅] 답을 끝내기 전 바뀐 파일({rels}) 다시 검사 — {name} 검사 실패:\n{out}",
          file=sys.stderr)
    sys.exit(2)


if "--stop" in sys.argv:
    on_stop()
else:
    on_edit()

# 섹션 3 · 25강 🆕 Mods로 나만의 기능 만들기 (/plugin-authoring)

Mods = 내 작업대(화면)에 붙이는 위젯. 클로드 코드 안에서 도는 자바스크립트 플러그인으로, **화면에 직접 그릴 수 있는 건 mod뿐**입니다(설정 훅·스킬·MCP는 못 그림). 그릴 곳: 오른쪽 패널, 프롬프트 위 영역, 상태 줄, 토스트. 슬래시 명령 추가, 도구 호출 가로채기(`tool.call`)도 가능. 터미널 v2.1.287 이상, 기본 켜짐.

## 이번 수업에서 입력한 것 (그대로)

```text
claude
/plugin-authoring 프롬프트 위에 이 프로젝트의 스킬·에이전트·훅 개수를 보여 주는 mod 만들어 줘
   → "Enable hot reloading for this session?" → 2. Enable for this session
이 mod를 프로젝트 .claude/skills 안으로 옮겨서 다음에 열 때도 뜨게 해 줘
/exit
claude                 # 프롬프트 위: 스킬 2 · 에이전트 1 · 훅 3
/plugin                # 1 mod active · project-counts
```

- `/plugin-authoring` 안내서가 영어라 이번 답은 영어로 나옴 (26강에서 CLAUDE.md에 한국어 규칙 추가)
- 처음 만든 mod는 `~/.claude/dev-mods/<세션>/`(이 세션에서만, 일정 기간 뒤 삭제). 처음 붙은 직후엔 `스킬 0 · 에이전트 0 · 훅 0`으로 보였다가 턴이 끝나며 다시 셈
- 옮길 때 클로드가 `rm -rf`를 쓰려다 **24강 차단 훅에 막혀** 파일을 하나씩 지움
- 프로젝트의 `.claude/skills/<이름>/.claude-plugin/plugin.json`은 이 폴더에서 시작할 때마다 자동으로 불러옴(공식 문서 plugins/loading, 폴더를 믿은 뒤)

결과: `solution/.claude/skills/project-counts/` (`.claude-plugin/plugin.json`, `hooks/hooks.json`, `hooks/register.tsx`, `tests/`, `types/`)

## 쓸 만한 mod (공식 샘플)
- token-weather — 컨텍스트 사용량을 일기예보처럼
- blast-radius — `rm -rf`·강제 푸시를 붙잡고 무엇이 바뀌는지 보여 준 뒤 버튼으로 확인
- replay-theater — 직전 턴의 파일 수정을 단계별로 재생

## 주의
- mod는 내 권한으로 파일·네트워크에 접근 → 처음 여는 폴더는 믿기 전엔 어떤 mod도 안 불러옴
- 남의 mod는 `claude plugin validate`로 먼저 확인
- [Mods overview](https://code.claude.com/docs/en/plugins/mods/overview) · [Create a mod](https://code.claude.com/docs/en/plugins/mods/create) · [Interface](https://code.claude.com/docs/en/plugins/mods/interface)

## 연습 과제
이 mod에 `/counts` 명령 추가 — 개수를 토스트(`$.ui.toast`)로 띄우기

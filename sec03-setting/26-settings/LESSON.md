# 섹션 3 · 26강 설정 파일 계층(사용자·프로젝트·로컬)과 팀 공유, /statusline

| 층 (위가 이김) | 파일 | 누가 |
|---|---|---|
| 관리 설정 | managed-settings.json 등 | 조직 |
| 명령줄 | `--settings` | 이번 세션 |
| 로컬 프로젝트 | `.claude/settings.local.json` | 이 프로젝트의 나 (git 제외) |
| 공유 프로젝트 | `.claude/settings.json` | 팀 (git) |
| 사용자 | `~/.claude/settings.json` | 내 컴퓨터의 모든 프로젝트 |

예외: `permissions.allow` 같은 **목록은 합쳐지고**, 어느 층이든 **deny가 있으면** 다른 층의 allow로 못 풂.

## 이번 수업에서 입력한 것 (그대로)

```bash
cat ~/.claude/settings.json          # (녹화용 컴퓨터) 두 줄뿐
cat .claude/settings.local.json      # MCP 켠 기록 + 22강 skillOverrides
claude
```

```text
/statusline 모델이랑 폴더 이름, 컨텍스트 퍼센트 보여 줘
이 상태 줄을 프로젝트 설정으로 옮겨 줘. 내 사용자 설정에서는 빼고
SETTING-PLAN에서 CLAUDE.md에 둘 규칙만 골라 이 폴더 CLAUDE.md로 짧게 만들어 줘
팀이랑 같이 쓸 수 있게 .gitignore도 만들어 줘
/exit
claude
/status                              # Setting sources: User settings, Shared project settings, Project local settings
```

- `/statusline`은 내장 `statusline-setup` 서브에이전트가 **사용자 설정(`~/.claude/settings.json`)**에 저장 → 템플릿에 넣으려고 프로젝트 `.claude/settings.json`으로 옮김. 상태 줄: `Opus 5.5 | my-setting | Context: 4%` (토큰을 쓰지 않음)
- CLAUDE.md: 대답(한국어로 짧게, 큰 작업 전 구조 확인, 라이브러리는 context7) · 웹 페이지(index.html 한 파일, 375px, localStorage, aria-label) · 데이터(data/ 원본 보호). 클로드가 "data 수정 금지는 권한 deny도 필요"라고 짚음 → 29강 미션
- .gitignore: `.claude/settings.local.json`, `CLAUDE.local.md`, `.env`, `.env.*`, `.playwright-mcp/` …
- `/status`는 어느 층을 읽었는지만 보여 주고, 값이 어느 층에서 왔는지는 안 알려 줌 (녹화에서는 계정 정보 가림)

| 팀이 함께 (git) | 나만 (이 프로젝트) | 나만 (모든 프로젝트) |
|---|---|---|
| CLAUDE.md, .claude/settings.json, .claude/skills·agents·hooks, .mcp.json | .claude/settings.local.json, CLAUDE.local.md | ~/.claude/settings.json, ~/.claude/CLAUDE.md |

- [Settings precedence](https://code.claude.com/docs/en/settings#settings-precedence) · [Status line](https://code.claude.com/docs/en/statusline) · [.claude directory](https://code.claude.com/docs/en/claude-directory)

## 연습 과제
상태 줄에 git 브랜치·세션 비용 더하기(공식 문서 예시 스크립트), `/status`의 Setting sources 확인

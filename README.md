# 클로드 코드 실전 — 강의 실습 파일

인프런 강의 「클로드 코드 실전 — 설치부터 하네스까지」에서 **실제로 촬영할 때 입력한 프롬프트와 클로드 코드가 만든 파일**을 모아 둔 저장소입니다.
클로드 코드의 결과는 같은 프롬프트라도 매번 조금씩 다릅니다. 내 결과가 영상과 다르면 이 저장소의 파일에서 이어서 진행하세요.

- 촬영 환경: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 2026-10
- 수업마다 `LESSON.md`(입력한 명령·프롬프트 원문, 공식 문서 링크), `start/`(시작 상태), `solution/`(녹화 끝 상태)이 있습니다.
- 프롬프트는 짧은 평소 말투로 먼저 시도하고, 결과가 빗나가면 그때 자세한 프롬프트로 다시 씁니다. 두 버전을 모두 남겨 둡니다.
- 인증키가 들어 있는 `.env`는 올리지 않습니다. `.env.example`을 `.env`로 복사해 내 키를 넣어 쓰세요.

## 섹션 0. 시작하기

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec00-start/01-preview](sec00-start/01-preview/) | 강의에서 만드는 결과물과 강의 지도, 어디서부터 들으면 되는지 | 결과물 미리 보기와 강의 지도 |
| [sec00-start/02-materials](sec00-start/02-materials/) | 이 저장소 받기(`git clone`·ZIP)·폴더 구조, `git pull`로 최신 자료 받기, 버전 기준과 클로드 코드 업데이트 | 실습 자료·정답 저장소, 버전 기준과 업데이트 |
| [sec00-start/03-plans-usage](sec00-start/03-plans-usage/) | Pro·Max 요금제, `/usage`·`/context`, 세 가지 부탁의 토큰을 재는 `usage_check.py` | 요금제·사용량 감 잡기 |

## 섹션 0-1. 처음이라면: 클로드 코드 기초 (무료 1시간 강의를 본 분은 건너뛰어도 됩니다)

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec00-1-basics/04-what-is-claude-code](sec00-1-basics/04-what-is-claude-code/) | 도구를 끈 클로드(`--tools ""`) vs 평소 클로드로 같은 가계부 합계 부탁, 모델·도구·하네스 | 클로드 코드란 |
| [sec00-1-basics/05-terminal-basics](sec00-1-basics/05-terminal-basics/) | `pwd`·`ls`·`cd`·`mkdir`·`cat`·Tab·↑·`clear`, macOS·Windows 명령 비교표 | 터미널이 처음인 분을 위한 10분 |
| [sec00-1-basics/06-install-login](sec00-1-basics/06-install-login/) | 설치 명령(macOS·Linux·Windows), `command not found` 해결, `claude doctor`, 로그인 | 설치와 로그인 |
| [sec00-1-basics/07-vscode](sec00-1-basics/07-vscode/) | VS Code 내장 터미널에서 `claude` 실행, `/desktop` | VS Code와 내장 터미널 |
| [sec00-1-basics/08-first-run-tour](sec00-1-basics/08-first-run-tour/) | 폴더 믿기, 입력창·모드 표시, `?`·`Shift+Tab`·`/`·`!`·`@` | 첫 실행과 화면 둘러보기 |
| [sec00-1-basics/09-first-request](sec00-1-basics/09-first-request/) | 카페 메뉴 페이지: 짧은 프롬프트 → 자세한 프롬프트, 브라우저로 결과 확인 | 첫 부탁 해 보기 |
| [sec00-1-basics/10-sessions](sec00-1-basics/10-sessions/) | `--continue`, `--resume`, `/rename`, 새로운 세션과의 차이 | 세션 이어 가기 |
| [sec00-1-basics/11-permissions](sec00-1-basics/11-permissions/) | Manual 모드 권한 질문 허락·거절, Esc로 멈추고 다시 지시 | 권한 질문에 답하는 법 |
| [sec00-1-basics/12-mission-0](sec00-1-basics/12-mission-0/) | 미션 0: 폴더를 만들고 첫 웹 페이지 만들기 + 정답 | 미션 0 |

## 섹션 1. 핵심 기능 다지기

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec01-core/01-harness-map](sec01-core/01-harness-map/) | 하네스 여섯 칸(컨텍스트·도구·권한·검증·격리·자동화)과 강의 섹션 지도, `/context`·`/permissions`·`/mcp`·`/hooks`, 역별 승하차 표 → 시간대 그래프 | 하네스 지도 |
| [sec01-core/02-plan-mode](sec01-core/02-plan-mode/) | `Shift+Tab` 계획 모드, 공식 워크플로(살펴보기→계획→구현→커밋), 계획서 승인 선택지, 3D 기둥 + 시간 슬라이더. 📏 계획 모드를 쓸 때 vs 안 쓸 때 3회씩(`measure_plan.py`) | 계획 모드와 공식 워크플로 |
| [sec01-core/03-auto-mode](sec01-core/03-auto-mode/) | manual vs auto 모드, 분류기가 막는 것, `/fewer-permission-prompts`. 📏 권한 질문 횟수 manual·허용 목록·auto 비교(`measure_prompts.py`) | auto 모드 제대로 알기 |
| [sec01-core/04-permission-rules](sec01-core/04-permission-rules/) | `.claude/settings.json`의 allow·ask·deny(`.env` 읽기 금지, `git push` 확인), 적용 순서, `/sandbox` | 권한 규칙 allow/ask/deny와 샌드박스 |
| [sec01-core/05-model-effort](sec01-core/05-model-effort/) | `/model` 별칭, `opusplan`, `/effort`, `ultrathink`, `/fast` 실습. 모델·생각 깊이·비용을 보여 주는 상태 줄 설정, 생각 깊이 4단계 비교 스크립트(`effort_check.py`) | 모델·생각 깊이 고르기 |
| [sec01-core/06-opus-vs-opusplan-vs-sonnet](sec01-core/06-opus-vs-opusplan-vs-sonnet/) | 같은 가계부 페이지를 Opus만·opusplan·Sonnet만으로 만들고 시간·토큰·비용을 재는 `measure.py`, 결과 페이지 9개와 `results.json` | 📏 Opus만 vs opusplan vs Sonnet만 |
| [sec01-core/07-claude-md](sec01-core/07-claude-md/) | `/init`, 폴더별 `CLAUDE.md`, `.claude/rules`(paths), AGENTS.md. 📏 CLAUDE.md 있을 때 vs 없을 때 규칙 지킨 횟수(`measure_claudemd.py`) | CLAUDE.md 잘 쓰기 |
| [sec01-core/08-context](sec01-core/08-context/) | `/context`, `/btw`, `/rewind`, `/compact`·`/autocompact`, `/clear`, 단계마다 토큰 수 | 컨텍스트 관리 |
| [sec01-core/09-git-code-review](sec01-core/09-git-code-review/) | 동료 브랜치(`make-teammate-branch.sh`) 설명받기 → `/code-review` → 고치기 → main에 합치기, 그리고 실제 GitHub 저장소 [seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d)에서 push 확인 → PR → `/code-review 1` → 머지 | Git·GitHub와 /code-review |
| [sec01-core/10-mission-1](sec01-core/10-mission-1/) | 미션 1: 역 카드를 누르면 3D 화면이 그 역으로 — CLAUDE.md 규칙·계획 모드·auto·`/code-review`·브랜치 합치기 + 정답·채점표 | 미션 1 |

## 섹션 2. MCP 기본

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec02-mcp/15-what-is-mcp](sec02-mcp/15-what-is-mcp/) | MCP = 만능 USB 허브, `claude mcp add/list/get/remove`, 클로드 코드 문서 서버로 첫 연결, 범위 local·project(`.mcp.json` + 승인)·user | MCP란 — 연결 구조와 범위 |
| [sec02-mcp/16-must-have-mcp](sec02-mcp/16-must-have-mcp/) | Context7로 deck.gl 문서 찾아 3D 지도(`map.html`), Playwright 스크린샷, 깃허브는 MCP 대신 `gh`, 🆕 `claude mcp login` | 꼭 쓰는 MCP |
| [sec02-mcp/17-mcp-context](sec02-mcp/17-mcp-context/) | 📏 MCP가 시작 컨텍스트를 얼마나 쓰나(`mcp_context_check.py`, 도구 검색 켬/끔), `/context`, `/mcp`에서 서버 끄기 | 도구가 많아질 때 컨텍스트 관리 |
| [sec02-mcp/18-mission-2](sec02-mcp/18-mission-2/) | 미션 2: 기둥 위 한글 역 이름 + 08시 vs 18시 비교(`compare.html`), 짧은 프롬프트 → 자세한 프롬프트 두 버전 + 정답 | 미션 2 |

## 섹션 3. [프로젝트 1] 나만의 클로드 코드 세팅 만들기

완성 템플릿: **[dante01yoon/claude-code-starter-setting](https://github.com/dante01yoon/claude-code-starter-setting)** (GitHub 템플릿 저장소 — Use this template)

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec03-setting/19-design](sec03-setting/19-design/) | 반복하는 말·일 찾기 → `SETTING-PLAN.md`(CLAUDE.md·스킬·서브에이전트·훅·MCP 중 어디에 둘지) | 내 세팅 설계 |
| [sec03-setting/20-commands-skills](sec03-setting/20-commands-skills/) | 커스텀 명령과 스킬의 차이·합치기, `/web-page` 스킬, `$ARGUMENTS` | 커스텀 명령과 스킬 |
| [sec03-setting/21-skill-design](sec03-setting/21-skill-design/) | 설명 한 줄, `scripts/`·`reference/`, 자가 수정 체크리스트 — `seoul-data` 스킬(서울 열린데이터광장) | 스킬 설계 |
| [sec03-setting/22-skill-doctor](sec03-setting/22-skill-doctor/) | 🆕 `/skill-doctor`로 스킬별 비용·사용 빈도 보기, `skillOverrides`로 끄기 (📏 `/context` 6.0k → 4.7k 토큰) | /skill-doctor |
| [sec03-setting/23-subagents](sec03-setting/23-subagents/) | `.claude/agents/reviewer.md`(역할·도구 제한·모델), 🆕 `/subtask` | 서브에이전트 |
| [sec03-setting/24-hooks](sec03-setting/24-hooks/) | 수정 후 prettier, 위험 명령 차단(exit 2), 🆕 PreModelSwitch 확인 | 훅 |
| [sec03-setting/25-mods](sec03-setting/25-mods/) | 🆕 `/plugin-authoring`으로 프롬프트 위 "스킬·에이전트·훅" 개수 mod → `.claude/skills/`로 옮겨 매번 로드 | Mods |
| [sec03-setting/26-settings](sec03-setting/26-settings/) | 설정 계층(관리 > CLI > 로컬 > 프로젝트 > 사용자), 팀 공유 vs 로컬, `.gitignore`, `/statusline` | 설정 계층·팀 공유 |
| [sec03-setting/27-measure-split](sec03-setting/27-measure-split/) | 📏 혼자 vs 서브에이전트 나눔 3회씩(`measure_split.py`, `results.json`) — 시간 같음, 비용 +20%, 메인 대화 토큰 −84% | 서브에이전트 나눔 vs 혼자 |
| [sec03-setting/28-github-template](sec03-setting/28-github-template/) | 세팅만 골라 템플릿 폴더 → `gh repo create --public` → `gh repo edit --template` | GitHub 템플릿 |
| [sec03-setting/28-1-with-vs-without](sec03-setting/28-1-with-vs-without/) | 📏 같은 한 줄 부탁을 세팅 있음/없음 3회씩 — 결과물 위치·화면 확인의 일관성 비교 | 세팅 있을 때 vs 없을 때 |
| [sec03-setting/29-mission-3](sec03-setting/29-mission-3/) | 미션 3: screen-checker 서브에이전트 + data deny 규칙(`Edit(/data/**)`) → `/web-page`로 확인 → 템플릿 push + 정답·채점표 | 미션 3 |

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

## 섹션 3. [프로젝트 1] 나만의 클로드 코드 세팅 — 스킬·서브에이전트·훅·Mods

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

## 섹션 4. [프로젝트 2] 「서울 라이브 3D」 ① 지하철 24시 — 몇 시에 타면 덜 붐빌까

앱 저장소: **[dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d)** (섹션 4 작업 = [PR #2](https://github.com/dante01yoon/seoul-live-3d/pull/2)). 수업 폴더의 `solution/`에는 그 수업에서 바뀌거나 새로 생긴 파일만 들어 있습니다. 데이터: 서울 열린데이터광장(공공누리 제1유형), 공개 `sample` 키.

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec04-subway-3d/30-public-data](sec04-subway-3d/30-public-data/) | 파일 vs 오픈 API, sample 키 5행 한계, 승하차(OA-12252)·역사마스터(OA-21232) CSV 받기, 역 위치 점 지도, 인증키 보관 4단계 | 공공데이터 고르기 |
| [sec04-subway-3d/31-prd-roadmap](sec04-subway-3d/31-prd-roadmap/) | PRD·ROADMAP 함께 쓰기 — 클로드가 데이터로 질문을 고침(하루 최솟값 → 시간 창), 짧은 프롬프트 → 자세한 프롬프트(docs/PRD.md) | PRD와 ROADMAP |
| [sec04-subway-3d/32-design](sec04-subway-3d/32-design/) | 🆕 `/design` 시안 캔버스(보드 4장) → `subway.html` 화면 틀 | /design 시안 먼저 |
| [sec04-subway-3d/33-tasks](sec04-subway-3d/33-tasks/) | 작업 쪼개기, `CLAUDE_CODE_ENABLE_TODO_TOOLS=1`과 `Ctrl+T` 체크리스트, 조각마다 커밋 | 작업 쪼개기와 진행 관리 |
| [sec04-subway-3d/34-cleaning](sec04-subway-3d/34-cleaning/) | 역 이름 매핑 11곳(이름 바뀐 역 3곳), 같은 이름 다른 역(양평), 노선 순서·꺾임 검사, 점검 지도 | 데이터 수집·정제 |
| [sec04-subway-3d/35-timelapse](sec04-subway-3d/35-timelapse/) | deck.gl ColumnLayer 529역 24시간 타임랩스, 짧은 → 자세한 프롬프트(굵기·색·시점·직접 찍어 확인) | MVP 3D 타임랩스 |
| [sec04-subway-3d/36-quiet-hour](sec04-subway-3d/36-quiet-hour/) | 역 검색, 답 카드(시간 창 안 가장 한가한 때 + 피크 대비 %), 하루 띠, 시간대 그래프 | 내 역 그래프와 추천 |
| [sec04-subway-3d/37-realtime](sec04-subway-3d/37-realtime/) | 실시간 열차 위치 — `server.mjs` 프록시(키는 서버에만, 20초 캐시), 자체 공격 테스트 | 실시간 열차 · 서버 경유 |
| [sec04-subway-3d/38-playwright](sec04-subway-3d/38-playwright/) | Playwright MCP(프로젝트 범위)로 넓은 화면·375px 스크린샷과 동작 확인 → 고치고 다시 확인 | 화면 검증 |
| [sec04-subway-3d/39-deploy](sec04-subway-3d/39-deploy/) | Vercel 미리보기 배포(`api/trains.js`, `vercel.json`, `.vercelignore`), 환경 변수, 🆕 Artifacts 소개 페이지 | 배포와 비밀 관리 |
| [sec04-subway-3d/40-measure-verify](sec04-subway-3d/40-measure-verify/) | 📏 검증 시킬 때 vs 안 시킬 때 3회씩 × 2실험(`measure/`) — 버그 0 vs 0, 화면 기능에서 시간 1.9배·비용 1.8배 | 검증 시킬 때 vs 안 시킬 때 |
| [sec04-subway-3d/41-mission-4](sec04-subway-3d/41-mission-4/) | 미션 4: 지금 시간대 혼잡 TOP 5 + Playwright 확인 + push·PR, 정답·채점표 | 미션 4 |

## 섹션 5. [프로젝트 3] 「서울 라이브 3D」 ② 지금 어디가 붐비나 — 인증·DB를 붙여 풀스택으로

앱 저장소: **[dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d)** (섹션 5 작업 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). Supabase는 계정 없이 **로컬**(`npx supabase start`, 도커)로 씁니다. 데이터: 서울 실시간 도시데이터(공공누리 제1유형), 공개 `sample` 키(광화문·덕수궁 1곳). 테스트 사용자는 `supabase/seed.sql`의 로컬 시험용 계정입니다.

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec05-fullstack/42-supabase-start](sec05-fullstack/42-supabase-start/) | DB = 앱의 기억, 인증 = 명찰, RLS, publishable vs secret 키, 로컬 Supabase 띄우기(포트 충돌 해결)·Studio | Supabase 시작 |
| [sec05-fullstack/43-citydata-layer](sec05-fullstack/43-citydata-layer/) | 실시간 도시데이터 121곳 레이어 — 영역 zip 다각형, 인구 높이·혼잡도 색·12시간 예측 슬라이더, `/api/citydata` 서버 경유 | 121곳 레이어 |
| [sec05-fullstack/44-supabase-mcp](sec05-fullstack/44-supabase-mcp/) | 로컬 Supabase MCP(`/mcp`, 계정 없이) — list_tables·apply_migration·get_advisors, 마이그레이션 파일 | Supabase MCP로 테이블 설계 |
| [sec05-fullstack/45-snapshots](sec05-fullstack/45-snapshots/) | 5분 수집기(`npm run collect -- --watch`), 장소별 24시간 그래프, 5분 실행 방법 3가지(Vercel Hobby 크론은 하루 1번) | 5분마다 스냅샷 쌓기 |
| [sec05-fullstack/46-login-favorites](sec05-fullstack/46-login-favorites/) | 이메일 6자리 코드 로그인, 장소·내 역 즐겨찾기와 붐빔 알림, 클로드의 질문 3개, seed 테스트 사용자 | 로그인과 사용자별 데이터 |
| [sec05-fullstack/47-admin](sec05-fullstack/47-admin/) | 관리자 화면(수집 상태·호출/실패·사용자), `admin_users`·`admin_dashboard()`, 권한 시험에서 찾은 DB 재시작 문제 | 관리자 화면 |
| [sec05-fullstack/48-tests-first](sec05-fullstack/48-tests-first/) | 같은 장소 알림 1시간 쉬는 시간 — 테스트 먼저 → 실패 → 통과, 빨간불 직접 검증 | 테스트 먼저 쓰고 고치기 |
| [sec05-fullstack/49-debug-monitor](sec05-fullstack/49-debug-monitor/) | 🆕 Monitor로 서버 로그 지켜보기, DB를 끄고 장애 재현 → 원인 → 친절한 안내 → 복구 확인, `/rewind` | 오류 디버깅 |
| [sec05-fullstack/50-deploy-ops](sec05-fullstack/50-deploy-ops/) | Vercel 미리보기 배포(DB 없는 배포는 안내만), 공개될 뻔한 파일(`node_modules`·seed) 막기, 운영 점검 4가지 | 배포와 운영 점검 |
| [sec05-fullstack/51-measure-effort](sec05-fullstack/51-measure-effort/) | 📏 effort 5단계 × 2번(`measure/`) — 품질 모두 10/10, max는 시간 22배·비용 11배, high부터 자체 테스트 | effort 단계별 시간과 품질 |
| [sec05-fullstack/52-mission-5](sec05-fullstack/52-mission-5/) | 미션 5: 역 답 카드에 가까운 장소의 지금 혼잡도 — 채점표·정답 풀이 | 미션 5 |

## 섹션 6. MCP 서버 직접 만들기 — 「서울 데이터」 MCP 서버

앱 저장소: **[dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d)** (섹션 6 작업 = 브랜치 `sec06-mcp`, main 병합 `7bc358e`). 시작 상태는 [sec06-mcp-server/start](sec06-mcp-server/start/). 공식 TypeScript SDK(v1 `@modelcontextprotocol/sdk` 1.32.1 — v2 `@modelcontextprotocol/server`도 공식), 데이터: 서울 열린데이터광장(공공누리 제1유형) 공개 `sample` 키.

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec06-mcp-server/53-mcp-server-structure](sec06-mcp-server/53-mcp-server-structure/) | 호스트·클라이언트·서버, JSON-RPC, 도구·리소스, stdio vs Streamable HTTP(stdout 규칙·127.0.0.1·Origin), 역 승하차 도구 + 역 목록 리소스, `claude mcp add --scope project`, curl로 `tools/list`, MCP Inspector | MCP 서버 구조 |
| [sec06-mcp-server/54-api-tools](sec06-mcp-server/54-api-tools/) | 서울 API(CardSubwayTime·citydata_ppltn)를 도구로 감싸기, 키는 `${SEOUL_OPENAPI_KEY:-sample}`·결과에서 지우기, 광화문 12시간 예측 HTML | 공공데이터 API를 MCP 도구로 |
| [sec06-mcp-server/55-use-in-project](sec06-mcp-server/55-use-in-project/) | `.mcp.json` 커밋으로 팀 공유, 앱 답 카드를 8월 API로 검산, 실제 칸 확인 후 장소 패널 연령대 막대 | 프로젝트에서 내 MCP 서버 쓰기 |
| [sec06-mcp-server/56-mission-6](sec06-mcp-server/56-mission-6/) | 미션 6: 따릉이 `bikeList` 도구 추가 — 채점표·정답 풀이·Inspector 확인 | 미션 6 |

## 섹션 7. 스킬·플러그인·Mods로 팀에 배포

마켓플레이스 저장소: **[dante01yoon/claude-code-practice-marketplace](https://github.com/dante01yoon/claude-code-practice-marketplace)** (web-kit 0.1.0 · starter-setting 0.2.0). 팀원 장면은 클로드 코드 설정이 빈 별도 계정 폴더에서 녹화했습니다.

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec07-plugins/57-plugin-structure](sec07-plugins/57-plugin-structure/) | 플러그인 = 묶음 상품, `plugin.json`·skills·agents·hooks·`.mcp.json`, web-kit 플러그인 만들기, `claude plugin validate`, `--plugin-dir`로 카페 주문 페이지 | 플러그인 구조 |
| [sec07-plugins/58-team-marketplace](sec07-plugins/58-team-marketplace/) | `marketplace.json`(name·owner·plugins), GitHub 공개 저장소로 올리기, 팀원 `marketplace add` → `install`, 설치 범위 user·project·local | 팀 마켓플레이스 만들고 설치하기 |
| [sec07-plugins/59-plugin-eval](sec07-plugins/59-plugin-eval/) | 🆕 `claude plugin eval` — 채점 케이스(prompt.md + graders), 넣기/빼기 비교. 📏 WITH 1.00 vs W/OUT 0.86, 시간 93초 vs 61초, $0.31 vs $0.20 | 플러그인을 넣기 전/후로 채점 |
| [sec07-plugins/60-setting-plugin](sec07-plugins/60-setting-plugin/) | 섹션 3 세팅 전체 → starter-setting 플러그인(CLAUDE.md·상태 줄·권한은 setup 스킬로), 팀 프로젝트 `extraKnownMarketplaces`+`enabledPlugins`로 새 팀원 자동 설치 | 내 세팅을 플러그인으로 |
| [sec07-plugins/61-mission-7](sec07-plugins/61-mission-7/) | 미션 7: dark-mode 스킬 + 채점 케이스 + 0.2.0 → 팀원 `marketplace update` + `/reload-plugins` — 채점표·정답 풀이 | 미션 7 |

## 섹션 8. 장시간 자율 작업 — 맡겨 두고 확인하기

앱 저장소: **[dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d)** (섹션 8 작업 = 브랜치 `sec08-auto`, main 병합 `800c2eb`). 시작 상태는 [sec08-autonomous/start](sec08-autonomous/start/). Claude Code 2.1.296 · auto 권한 모드. agent view(백그라운드 세션)는 research preview(2026-10 기준).

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec08-autonomous/62-you-should-know](sec08-autonomous/62-you-should-know/) | 섹션 지도(야간 근무조), 빌트인 mod You should know 켜기 `/plugin enable cc-plugin-you-should-know@builtin`, 역 찾기 초성 검색, 긴 작업에서 뜬 Heads up 노트 | 옆에서 지켜보는 mod "You should know" |
| [sec08-autonomous/63-goal](sec08-autonomous/63-goal/) | `/goal` = 완료 조건을 적은 작업 지시서, 작은 모델 판정(Stop hook), 짧은 조건 → 끝 상태·확인·지킬 것·턴 제한으로 다시, 두 역 비교 그래프 | `/goal` |
| [sec08-autonomous/64-workflows](sec08-autonomous/64-workflows/) | dynamic workflows·`ultracode`, `/workflows` 진행 화면, 서버 파일 키 누출 점검(30개 에이전트·약 92만 토큰) | dynamic workflows와 ultracode |
| [sec08-autonomous/65-background](sec08-autonomous/65-background/) | `claude --bg`, `claude agents`(엿보기·들어가기), `/fork`, 워크트리 격리와 합치기, 비교 주소 공유 `?compare=` | 백그라운드 세션과 agent view |
| [sec08-autonomous/66-remote-control](sec08-autonomous/66-remote-control/) | `/remote-control 이름`, 상태 창(QR·연결 끊기), 보안(나가는 HTTPS만), 휴대폰에서 되는 명령 | Remote Control |
| [sec08-autonomous/67-mission-8](sec08-autonomous/67-mission-8/) | 미션 8: 백그라운드 세션에 `/goal` 걸어 피크 이름표 겹침 고치기 → agent view → 합치기 — 채점표·정답 풀이 | 미션 8 |

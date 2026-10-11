# SETTING-PLAN — 자주 하는 말·일을 어디에 둘까

`prompts/지금까지-쓴-프롬프트.md`(56줄)를 분석한 결과를 바탕으로, 반복되는 말과 일을 클로드 코드 설정 다섯 곳에 나눠 둡니다.

## 어디에 두는지 고르는 기준

| 둘 곳 | 이럴 때 | 동작 방식 |
|---|---|---|
| **CLAUDE.md** | 항상 지켜야 하는 습관·취향·프로젝트 규칙 | 세션마다 자동으로 읽힘 (클로드가 *참고*함) |
| **스킬** | 순서가 정해진 반복 작업 | `/이름`으로 부르거나, 상황이 맞으면 클로드가 알아서 꺼내 씀 |
| **서브에이전트** | 결과만 필요하고 과정은 길어서 대화를 어지럽히는 일 | 별도 컨텍스트에서 일하고 요약만 돌려줌 |
| **훅** | 클로드가 잊으면 안 되는 일, *반드시* 매번 일어나야 하는 일 | 하네스가 자동 실행 (클로드 판단과 무관) |
| **권한** | 해도 되는 것 / 물어봐야 하는 것 / 절대 안 되는 것 | allow · ask · deny로 강제 |

## 정리표

| # | 자주 하는 말·일 (근거) | 둘 곳 | 파일 위치 | 넣을 내용 |
|---|---|---|---|---|
| 1 | 대답은 한국어로, "짧게", "세 가지만" | CLAUDE.md | `~/.claude/CLAUDE.md` (전체 공통) | 한국어로 답한다. 설명은 짧게, 바뀐 부분 위주로 한다 |
| 2 | "index.html 한 파일로 만들어 줘" (15회) | CLAUDE.md | `~/.claude/CLAUDE.md` | 웹 페이지는 따로 말이 없으면 `index.html` 한 파일(CSS·JS 포함)로 만든다 |
| 3 | "휴대폰에서도 보기 좋게", "새로고침해도 기록이 남게" | CLAUDE.md | `~/.claude/CLAUDE.md` | 모바일 대응은 기본. 사용자가 입력한 데이터는 localStorage에 저장한다 |
| 4 | 버튼 aria-label, 375px에서도 안 깨지게 | CLAUDE.md (경로별 규칙) | `.claude/rules/html.md` (`paths: **/*.html`) | HTML을 고칠 때만 적용되는 접근성·반응형 규칙 |
| 5 | 노선 공식 색, 천 단위 쉼표, `#역이름` 주소 | CLAUDE.md | 지하철 프로젝트 `CLAUDE.md` | 그 프로젝트에만 해당하는 규칙 |
| 6 | "data 폴더는 원본이라 고치면 안 됨" | CLAUDE.md **+ 권한** | `data/CLAUDE.md` + `deny: Edit(data/**)`, `Write(data/**)` | 이유는 CLAUDE.md에 적고, 실제로 막는 건 권한으로 한다 |
| 7 | "먼저 살펴봐 줘", "폴더에 뭐 있는지 먼저 확인하고" | CLAUDE.md | `~/.claude/CLAUDE.md` | 큰 작업 전에는 구조와 데이터 모양부터 보고 계획을 짧게 말한다 |
| 8 | "context7로 ○○ 문서 보고 ~" | CLAUDE.md | `~/.claude/CLAUDE.md` | 외부 라이브러리(deck.gl 등)를 쓸 때는 context7로 최신 문서를 먼저 확인한다 |
| 9 | "playwright로 스크린샷 찍어 줘", "08시·18시 찍어서 비교" | 서브에이전트 | `.claude/agents/screen-checker.md` | Playwright로 페이지를 열어 상태별로 찍고 compare.html로 나란히 붙인 뒤 문제점만 보고한다. 스크린샷 과정이 메인 대화를 채우지 않게 한다 |
| 10 | "커밋하고 main에 합쳐 줘", "찾은 문제 고쳐 줘" | 스킬 | `.claude/skills/ship/SKILL.md` → `/ship` | ① main과 차이 확인 → ② `/code-review` → ③ 문제 고치기 → ④ 브랜치에 커밋 → ⑤ main에 합치기. push는 하지 않는다 |
| 11 | 요구사항을 `-` 목록으로 정리해 페이지 요청 | 스킬 | `.claude/skills/web-page/SKILL.md` → `/web-page` | 이름·내용·동작·모바일을 체크리스트로 받아 index.html을 만들고, 끝나면 screen-checker로 확인한다 |
| 12 | "테스트랑 데이터 검사 돌려 줘" | 훅 | `.claude/settings.json` → `PostToolUse` (`Edit\|Write`) | 파일을 고칠 때마다 테스트와 데이터 검사를 자동으로 돌린다. 실패하면 클로드에게 결과를 알려 준다 |
| 13 | ".env 파일은 절대 못 읽게" | 권한 | `.claude/settings.json` → `deny: Read(.env*)` | 무조건 차단한다 |
| 14 | "git push 할 때는 꼭 나한테 물어보게" | 권한 | `ask: Bash(git push:*)` | 매번 확인을 받는다 |
| 15 | 커밋·브랜치·diff를 자주 씀 | 권한 | `allow: Bash(git status:*)`, `Bash(git diff:*)`, `Bash(git add:*)`, `Bash(git commit:*)`, `Bash(git switch:*)`, `Bash(git merge:*)` | 자주 쓰는 안전한 명령은 묻지 않는다 (`/fewer-permission-prompts`로 보충) |
| 16 | context7·playwright MCP를 자주 씀 | 권한 | `allow: mcp__context7__*`, `mcp__playwright__*` | 도구를 쓸 때마다 묻지 않는다 |

## 두지 않을 것

| 말 | 이유 |
|---|---|
| "카페 메뉴 페이지", "등산 소개 페이지" 같은 내용 자체 | 한 번만 하는 일이라 그때그때 말하면 된다 |
| "ultrathink" | 필요할 때만 붙이는 키워드라 설정할 필요가 없다 |
| "지우지 말고 ~로 바꿔 줘" | 그 순간의 판단이다. 대신 `rm`을 `ask`에 넣으면 지우기 전에 늘 물어본다 (선택 사항) |

## 적용 순서 (추천)

1. **권한 (13~16)**: 안전장치부터 설정한다
2. **CLAUDE.md (1~8)**: 공통 규칙은 `~/.claude/CLAUDE.md`에, 프로젝트 규칙은 해당 폴더에 둔다
3. **스킬 `/ship` (10)**: 가장 자주 반복하는 마무리 흐름이다
4. **서브에이전트 screen-checker (9)**
5. **스킬 `/web-page` (11)**, **훅 (12)**: 테스트 명령이 정해진 프로젝트에서 설정한다

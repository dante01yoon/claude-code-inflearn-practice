# 섹션 11 · 87강 📏 하네스 적용 전후 — 같은 요청을 시간·토큰·버그 수로 비교

## 이번 수업에서 할 것
- 섹션 11에서 서울 라이브 3D에 입힌 하네스가 실제로 나아지게 했는지, 같은 부탁 하나를 **적용 전 커밋**과 **적용 후 커밋**에 보내 숫자로 비교한다.
- 버그는 클로드가 볼 수 없는 **숨은 채점**(실존 역 6곳 × 서울·미국 동부 시간대 = 12칸) + 그 복사본의 `npm test` 실패 + 브라우저 화면 확인으로 센다.
- 대표 1회씩은 code-server에서 실제로 실행해 보고, 결과는 브라우저 앱 화면으로 확인한다.
- 마지막에 섹션 11 전체(78~87)를 고삐 그림과 지도로 정리한다.

촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 오토 모드, Opus 5.5 · medium, 2026-10-17 05:51~06:05 EDT(녹화 컴퓨터 시간대 미국 동부). 앱: [dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d).

## 비교한 두 상태
| | 적용 전 | 적용 후 |
|---|---|---|
| 커밋 | `cc3d56f` (main, 섹션 10 끝) | `922724e` (브랜치 `sec11-all`) |
| 지침 | 루트 CLAUDE.md 하나(59줄, 17KB) | 나눈 CLAUDE.md(38줄) + `.claude/rules/` 경로 규칙 8개 + 폴더별 CLAUDE.md(mcp-server·tests·data) |
| 훅 · 스킬 | 없음(권한 규칙 `settings.json`, `rules/html.md`만) | 기록 훅 `trace.py`(78) · 검사 훅 `check.py` PostToolUse + Stop(82) · `tdd` 스킬(81) |
| 그 밖 | — | SPEC.md(80) · CI 검사(83) · 시각·디버깅 규칙(84) · 사용량 대시보드(85) · 키트 비교 스크립트(86) |

`sec11-all` 만들기: 새로 clone → `sec11-harness`(8bdfdb8)에서 `origin/sec11-spec`(ec5cb8c)을 로컬 머지. 충돌은 `CLAUDE.md` 하나 — 79강에서 나눈 루트(파일 지도·공통 규칙)를 살리고, spec 쪽 새 파일(`transfer-lines.mjs`, `tools/otel-view.mjs`, `bench/kit-ab.mjs`, `scripts/repro-*.mjs`)을 파일 지도에, 84강 규칙 두 줄(시각 `timeZone: "Asia/Seoul"`, 버그 잡는 순서)을 공통 규칙에 더함. `subway-page.md` 경로 규칙에 `transfer-lines.mjs`·테스트를 더함. 머지 뒤 `npm test` 148개 중 144개 통과 · 실패 0 · 건너뜀 4, `npm run check` 문제 0건. origin에 push(main 머지 안 함).

## 같은 부탁 (두 쪽 모두 글자 그대로)
```text
답 카드에 '지금부터 가장 가까운 한가한 시간대'도 보여 줘. 한가함은 하루 띠의 '한' 기준이야. 계산은 next-quiet.mjs의 nextQuietHour(row, date)로 빼고 테스트도 써 줘. 질문하지 말고 끝나면 npm test로 확인해 줘.
```
틀리기 쉬운 곳: ① 지금 시각(녹화 컴퓨터는 미국 동부 → 컴퓨터 시각을 쓰면 서울과 13시간 차이) ② 자정 넘기기(23시대 다음 00시대) ③ 승하차 0명인 02·03시(운행 안 함)는 한가한 시간 후보에서 빼기. 함수 이름만 정해 둔 것은 채점하려고. 짧은 부탁으로 원하는 결과가 나와 자세한 버전은 쓰지 않았습니다.

## 📏 재는 방법 (`bench/`)
- `before-after.mjs`: 앱 폴더에서 `node ~/bench87/before-after.mjs`. 지금 커밋과 `cc3d56f`를 `git clone`으로 깨끗한 복사본(`/tmp/ba87/{before,after}-{1,2,3}`)으로 만들고 6개 동시에 `claude -p "<부탁>" --output-format json --permission-mode auto`. 다른 건 출발 커밋뿐(같은 녹화 HOME·계정·모델 기본값).
- JSON 결과에서: 걸린 시간(벽시계), `total_cost_usd`(구독자에게는 참고값, 85강), `num_turns`, 토큰(`usage`의 입력+출력+캐시 읽기+캐시 쓰기), 출력 토큰.
- 버그 ① 숨은 채점 `accept.mjs`(복사본 밖에 있어 클로드는 못 봄): 여의도(5호선) 09:20·17:40, 홍대입구(2호선) 13:10, 강남(2호선) 10:05·05:59, 서울역(1호선) 02:30의 `nextQuietHour` 결과를 9월 CSV로 계산한 기준값(피크 대비 30% 미만 · 0명 제외 · 서울 시각부터 24시간)과 비교. 같은 채점을 `TZ=Asia/Seoul`·`TZ=America/New_York` 두 번 = 12칸. 돌려준 값은 숫자·`{hour}`·"10시대" 글자 모두 받음(모양 차이는 버그로 안 셈).
- 버그 ② 그 복사본의 `npm test` 실패 수. ③ 화면 확인 `screen-all.sh`·`screen-check.mjs`: 복사본마다 서버를 띄우고 미국 동부 시간대 브라우저에서 서울 시각을 2026-10-17 09:20으로 고정, 여의도(5·9호선 합산)를 골라 새 줄이 10시대인지(컴퓨터 시각으로 계산하면 22시대). `merge-screen.mjs`가 표에 붙임.
- 적용 후 쪽은 `.claude/trace.log`로 Stop 훅이 막은 횟수(Stop 줄 − 1), 경로 규칙이 실린 횟수, 편집 도구 사용을 셈(`results/harness-trace.json`).

## 결과 (2026-10-17 05:58~06:01 EDT, 조건마다 3회, Opus 5.5)
| 조건 | 회 | 분 | 비용 추정($) | 턴 | 토큰(k) | 출력 토큰 | 숨은 채점 | 테스트 실패 | 화면 | 바뀐 줄 | Stop 막음 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 적용 전 | 1 | 1.4 | 0.49 | 11 | 455 | 6,241 | 12/12 | 0 | 맞음 | 96+ | - |
| 적용 전 | 2 | 1.2 | 0.48 | 9 | 365 | 6,585 | 12/12 | 0 | 맞음 | 98+ | - |
| 적용 전 | 3 | 1.3 | 0.52 | 11 | 475 | 6,546 | 12/12 | 0 | 맞음 | 112+ | - |
| 적용 후 | 1 | 1.4 | 0.55 | 12 | 404 | 6,890 | 12/12 | 0 | 맞음 | 104+ | 0 |
| 적용 후 | 2 | 1.4 | 0.54 | 12 | 396 | 7,774 | 12/12 | 0 | 맞음 | 112+ | 0 |
| 적용 후 | 3 | 1.9 | 0.55 | 13 | 510 | 8,223 | 12/12 | 0 | 맞음 | 110+ | 0 |
| **평균 전** | | 1.30 | 0.50 | 10.3 | 432 | 6,457 | | | | | |
| **평균 후** | | 1.57 | 0.55 | 12.3 | 437 | 7,629 | | | | | |

- **버그 수: 둘 다 0** (숨은 채점 18/18회 · 테스트 실패 0 · 화면 6/6). 이 부탁에서는 하네스가 버그 수를 바꾸지 못했다.
- 적용 후가 시간 약 +21%, 비용 추정 약 +10%, 턴 +2, 출력 토큰 +18%. 토큰 합계는 거의 같음(캐시 읽기가 대부분).
- **표본이 작다**: 조건마다 3회, 부탁 1개. 이 숫자만으로 하네스가 좋다/나쁘다를 말할 수 없음(영상에서도 그대로 말함).
- 화면 확인 중 1건(적용 후 #1)은 처음 판정 스크립트가 「한산한」이라는 표현을 못 읽어 "표시 없음"으로 셌다가, 화면 캡처를 보고 판정 기준을 '가장 가까운'이 든 새 줄로 고쳐 다시 셈(실제로는 10시대로 맞음). 고친 판정 스크립트가 `bench/merge-screen.mjs`.

### 하네스가 실제로 일한 정도 (적용 후, `trace.log`)
| 실행 | 경로 규칙(path_glob_match) | 폴더 CLAUDE.md(nested) | Write/Edit | Bash | Skill | Stop(막음) | 테스트를 먼저 썼나 |
|---|---|---|---|---|---|---|---|
| 측정 #1 | 5 (index-3d·citydata·bike·html·supabase, subway-page는 0) | 0 | 2 | 9 | 0 | 1 (0) | 예 |
| 측정 #2 | 0 | 1 (tests) | 2 | 9 | 0 | 1 (0) | 예 |
| 측정 #3 | 0 | 1 (tests) | 2 | 10 | 0 | 1 (0) | 아니오 |
| 녹화 대표 | 0 | 1 (tests) | 2 | 12 | 0 | 1 (0) | 예 |
- 클로드는 `subway.html`을 `sed`·`grep`(여러 파일을 섞은 셸 명령)으로 읽고, 고칠 때는 `python3 - <<'EOF'`로 바꿈 → `subway-page.md` 경로 규칙은 4번 모두 안 실렸고, PostToolUse 검사 훅(`Edit|Write|MultiEdit`)은 Write로 만든 두 파일에서만 돎. 82강에서 단 Stop 훅이 셸 수정까지 한 번 더 검사했고 4번 모두 조용히 통과.
- 녹화 대표 실행에서는 테스트를 먼저 Write하자 검사 훅이 `PostToolUse:Write hook returned blocking error … 테스트 검사 실패`를 돌려줌 → 클로드가 「빨강 확인(모듈이 아직 없어서 실패 — 예상대로)」 후 구현. tdd 스킬(Skill 도구)은 한 번도 불리지 않음(-p · 「질문하지 말고」, 대표 실행도 마찬가지).

## 대표 실행 (녹화, code-server)
- 적용 전 `s11_l87a`(158초): `git log`·`ls .claude` → 같은 부탁 → **1분 16초**, `next-quiet.mjs`(앱에 이미 있던 `alerts.mjs`의 `kstHour` 사용, 0명 제외, 24시간 순환, `{hour, inHours, ratio}`), `QUIET_RATIO`로 하루 띠와 기준 공유, 테스트 7개, `npm test` 144개 중 140개 통과·실패 0, CLAUDE.md 구조에 한 줄 → `node ~/bench87/accept.mjs .` **12/12**.
- 적용 후 `s11_l87b`(179초): **1분 37초**, 테스트 먼저 → 검사 훅 빨강 → `next-quiet.mjs`(`bandLevel`로 하루 띠와 같은 기준), `subway-page.md` 경로 규칙·CLAUDE.md 파일 지도에 새 모듈, `npm test` 154개 중 150개 통과·실패 0 → **12/12**.
- 측정 `s11_l87c`(133초): `node ~/bench87/before-after.mjs` → 위 표.
- 결과 화면(실제 시각, 서울 19:03, 서버는 인증키를 환경 변수로만): 적용 전·후 모두 여의도 「지금부터 가장 가까운 한가한 때: 22시대(3시간 뒤)」. 적용 전 화면 위쪽 「실시간 열차 … 오전 06:03:15 기준」은 84강에서 고친 시간대 버그가 `cc3d56f`에 남아 있는 것(이번 부탁과 무관, 적용 후는 「19:03:42 기준」).

## 공식 문서로 확인한 것
| 내용 | 근거 |
|---|---|
| 클로드에게 작업을 검증할 방법(테스트·스크립트 등)을 주면 결과가 좋아진다 | [모범 사례 · 검증할 방법 제공하기](https://code.claude.com/docs/ko/best-practices#give-claude-a-way-to-verify-its-work) |
| 클로드는 셸 명령으로도 파일을 바꿀 수 있어 PostToolUse(Edit·Write)만으로는 모든 변경을 못 잡음 → Stop 훅으로 작업 트리 확인 | [훅 가이드 · Matchers로 hooks 필터링](https://code.claude.com/docs/ko/hooks-guide#filter-hooks-with-matchers) |
| `paths` 규칙은 맞는 파일에 Read·Write·Edit를 쓰거나 읽기로 치는 Bash 명령일 때 실림 | [메모리 · 경로별 규칙](https://code.claude.com/docs/ko/memory#path-specific-rules) |
| `claude -p --output-format json` 결과의 `total_cost_usd`·`num_turns`·`usage`, 구독자에게 세션 비용은 참고값 | [CLI 참조](https://code.claude.com/docs/ko/cli-reference), [비용 관리](https://code.claude.com/docs/ko/costs) |

## 파일
- `bench/before-after.mjs` — 비교 스크립트, `bench/accept.mjs` — 숨은 채점, `bench/screen-check.mjs`·`screen-all.sh`·`merge-screen.mjs` — 화면 확인
- `bench/results/before-after.json` — 6회 원자료(JSON 결과의 사용량·모델·클로드 마지막 답 앞부분 포함) + 평균, `harness-trace.json`·`trace/*.trace.log`, `screen/*.json·png`
- `solution/before/`·`solution/after/` — 대표 실행이 만든 `next-quiet.mjs`·테스트·`changes.diff`

## 연습 과제
1. `ROUNDS=5`로 늘리고 다시 재 보세요. 시간·비용 차이가 유지되나요?
2. 부탁을 내 프로젝트에서 자주 틀리는 일로 바꾸고(예: 이 앱이라면 "다른 화면 시각도 서울 시각으로"), 숨은 채점을 그 일에 맞게 새로 써서 같은 비교를 해 보세요. 하네스의 값은 실수가 날 때 드러납니다.

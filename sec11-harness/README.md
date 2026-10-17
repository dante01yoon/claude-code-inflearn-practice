# 섹션 11 · 하네스 완성 — 프로젝트 3에 하네스 입히기 (서울 라이브 3D)

| 폴더 | 내용 |
|---|---|
| [78-internals](78-internals/) | 클로드 코드 내부 한 바퀴 — 프롬프트 조립, 도구 호출, 권한 확인, 압축. 관찰용 훅(`trace.py`)으로 한 바퀴를 `.claude/trace.log`에 기록, `/context`·`/compact` 전후 숫자 |
| [79-context-harness](79-context-harness/) | 컨텍스트 하네스 — 루트 CLAUDE.md를 폴더별 CLAUDE.md·`paths` 규칙으로 나누기, `/context` 9k → 2k, `trace.log`의 `nested_traversal`·`path_glob_match` |
| [80-spec](80-spec/) | 스펙 하네스 — AskUserQuestion으로 인터뷰 → `SPEC.md` → 화면으로 확인할 수 있게 세로로 6단계 → 새 세션 계획 모드로 1단계(환승역 노선 칩, `transfer-lines.mjs`). 앱 브랜치 `sec11-spec` |
| [81-tdd-skill](81-tdd-skill/) | 검증 하네스 ① — 빨강 → 초록 → 리팩터링을 스킬 `/tdd`로, 역 찾기 "강남역" 버그 고치기 |
| [82-hook-gate](82-hook-gate/) | 검증 하네스 ② — 검사 훅(문법·타입·테스트): 통과는 조용히, 실패만 exit 2. PostToolUse + Stop(셸 수정까지) |
| [83-ci-review](83-ci-review/) | 검증 하네스 ③ — 훅과 같은 `check.py`를 GitHub Actions(`check.yml`)에서, PR 자동 리뷰(요약 + 인라인 코멘트)와 함께 |
| [84-debug](84-debug/) | 디버깅 하네스 — 로그·재현 스크립트·환경 변수. 「받음」 시각이 보는 컴퓨터 시간대로 나오던 버그를 `TZ`로 5개 시간대에서 재현(`scripts/repro-received-time.mjs`, 틀리면 종료 코드 1) → 고침 → CLAUDE.md 규칙 |
| [85-observe](85-observe/) | 관측 — `/usage` Session 블록, `/statusline`으로 모델·컨텍스트 %·세션 비용, OpenTelemetry(OTLP http/json)를 받아 토큰·비용을 보여 주는 `tools/otel-view.mjs`(이메일·조직 ID 등 계정 속성은 허용 목록으로 버림) |
| [86-kit](86-kit/) | 공개 하네스 키트 📏 — 공식 마켓플레이스 superpowers + 내장 mod You should know 설치, `/context` 변화(스킬 32→46), `bench/kit-ab.mjs`로 같은 부탁을 키트 없음/있음 2회씩 비교한 숫자 |
| [87-before-after](87-before-after/) | 📏 하네스 적용 전후 — 같은 부탁(답 카드에 「지금부터 가장 가까운 한가한 시간대」)을 `cc3d56f`(적용 전)와 `sec11-all`(적용 후)에 조건마다 3회, `claude -p --output-format json`으로 비교. 숨은 채점(실존 역 6곳 × 서울·다른 시간대)·`npm test`·화면 확인으로 버그 세기. 결과: 버그 둘 다 0, 적용 후 시간 +21%·비용 추정 +10%·턴 +2 (표본 작음) |

앱 저장소: [dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec11-harness`(80·84~86강은 `sec11-spec`, 87강은 둘을 합친 `sec11-all`)(main `cc3d56f` 위). `solution/`에는 그 수업에서 생기거나 바뀐 파일만 있습니다. Claude Code 2.1.296.

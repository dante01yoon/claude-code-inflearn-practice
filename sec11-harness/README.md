# 섹션 11 · 하네스 완성 — 프로젝트 3에 하네스 입히기 (서울 라이브 3D)

| 폴더 | 내용 |
|---|---|
| [78-internals](78-internals/) | 클로드 코드 내부 한 바퀴 — 프롬프트 조립, 도구 호출, 권한 확인, 압축. 관찰용 훅(`trace.py`)으로 한 바퀴를 `.claude/trace.log`에 기록, `/context`·`/compact` 전후 숫자 |
| [79-context-harness](79-context-harness/) | 컨텍스트 하네스 — 루트 CLAUDE.md를 폴더별 CLAUDE.md·`paths` 규칙으로 나누기, `/context` 9k → 2k, `trace.log`의 `nested_traversal`·`path_glob_match` |
| [80-spec](80-spec/) | 스펙 하네스 — AskUserQuestion으로 인터뷰 → `SPEC.md` → 화면으로 확인할 수 있게 세로로 6단계 → 새 세션 계획 모드로 1단계(환승역 노선 칩, `transfer-lines.mjs`). 앱 브랜치 `sec11-spec` |
| [81-tdd-skill](81-tdd-skill/) | 검증 하네스 ① — 빨강 → 초록 → 리팩터링을 스킬 `/tdd`로, 역 찾기 "강남역" 버그 고치기 |
| [82-hook-gate](82-hook-gate/) | 검증 하네스 ② — 검사 훅(문법·타입·테스트): 통과는 조용히, 실패만 exit 2. PostToolUse + Stop(셸 수정까지) |

앱 저장소: [dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec11-harness`(main `cc3d56f` 위). `solution/`에는 그 수업에서 생기거나 바뀐 파일만 있습니다. Claude Code 2.1.296.

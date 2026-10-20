# 하네스 뼈대 — 폴더가 곧 진행 상태

빈 폴더에서 클로드에게 하네스 뼈대를 만들게 합니다(실제 실행 3분 42초). 결과: `harness/stages.mjs`(단계 · 필수 섹션), `npm run check`(PASS/FAIL/TODO/WAIT), `npm run approve`(승인 때 파일 해시 저장 → 바뀌면 다시 WAIT), `.claude/hooks/guard.mjs`(PreToolUse 훅: 승인 전 피그마 쓰기 · 클로드의 승인 명령 차단, 종료 코드 2).

녹화에서 본 것: 클로드가 승인 기능을 시험하려던 명령을 방금 만든 훅이 막음 → 함수를 직접 불러 검증. `npm run new ttareungyi` → 8단계 TODO, 훅에 피그마 쓰기 입력을 넣으면 `exit 2`, "와이어프레임 승인해줘" → 클로드가 거절(CLAUDE.md 규칙), 사람이 `npm run approve wireframe` → "아직 작성 안 됨".

다음 수업부터는 이 저장소의 하네스(같은 생각 + 레퍼런스 캡처 · 노드 린트 · 지표 · 테스트, 설계 문서 `HARNESS-DESIGN.md`)로 이어 갑니다. 클로드 결과는 매번 조금씩 다르니 `solution/`에서 이어가도 됩니다.
공식 문서: [훅](https://code.claude.com/docs/en/hooks)

프롬프트 원문(복사용): [PROMPTS.md](PROMPTS.md)

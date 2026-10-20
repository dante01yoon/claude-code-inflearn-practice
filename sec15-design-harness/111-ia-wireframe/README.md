# 정보 구조와 와이어프레임 — 구조 게이트

`ia.json`(화면 · 기능 번호 · 흐름 · 필수 상태)과 `wireframes.json`(영역 · 우선순위) → `npm run wireframe`으로 회색 상자 SVG(`out/ttareungyi/wireframes/`). 실제 실행 1분 23초: 화면 3장(목록 · 상세 · 정보·출처), 필수 상태 5개(기본 4 + 오래된 데이터).
클로드가 승인 전에 짚은 것: 기준 시각이 UTC 그대로 "03시 39분"(한국 시간 12시 39분), 자전거 적음 표시 자리 없음, SVG 글자 잘림.
구조 게이트 시험: 로딩 상태를 빼면 FAIL("없는 화면/상태 station-list:loading"), 되돌리면 PASS. 클로드가 한계도 지적 — 흐름이 가리키지 않는 상태는 빼도 통과(화면 프레임 누락은 검증 단계 린트 `missing-state`가 잡음).
사람 승인 `npm run approve -- wireframe --by <이름>` → 기준 시각을 한국 시간으로 고침(원본 데이터 UTC 유지, PRD F5에 KST 명시) → 승인 뒤 파일이 바뀌어 다시 WAIT → 재승인 PASS.

프롬프트 원문(복사용): [PROMPTS.md](PROMPTS.md)

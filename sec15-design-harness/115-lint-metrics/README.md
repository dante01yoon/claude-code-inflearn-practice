# 검증 ① 린트와 객관 지표

시작 폴더의 `work/ttareungyi`는 앞 수업들에서 피그마에 그린 따릉이 8화면의 노드 내보내기(`figma/nodes.json`, `scripts/figma/export-nodes.js`로 피그마 안에서 읽기 전용 실행)와 규칙 파일입니다. 이 폴더의 `scripts/lint-figma.mjs`는 수정 전(오탐이 있는) 버전입니다.

1) `npm run lint:figma -- --nodes tests/fixtures/bad-nodes.json` — 일부러 틀린 예시(다른 토큰으로 만든 것)라 이 프로젝트 규칙으로는 오류 101개(서체 · 크기 · 상태 누락 · 일관성 …).
2) `npm run lint:figma` — 따릉이 8화면: 오류 0, 경고 12(지도 바탕 grid-margin 8 · 새로고침 버튼 x=326 grid-base 4).
3) `npm run metrics -- work/ttareungyi` — 대비 최소 5.76:1 · 통과율 100%([WCAG](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)), 44pt 이상 100%([HIG](https://developer.apple.com/design/human-interface-guidelines/buttons)), 글자 5단계(13/15/17/22/40) · 평균 비율 1.35, 간격 · 4pt 격자 100%, 정렬선 평균 3.1(경험칙 ≤4).
4) "린트 경고 12개가 진짜 디자인 문제인지 봐줘" → 12개 모두 검사기 오탐, 하네스 규칙상 검사 스크립트는 고치지 않고 수정안 제안(38초). "응, 그렇게 고치고 테스트도 남겨줘" → 화면 양끝을 넘는 레이어 = 전체 바탕, 오른쪽에 붙은 요소는 오른쪽 여백으로 격자 판정 + 테스트 4가지(스스로 틀린 기대값도 고침, 45초) → `npm test` 13/13, 린트 오류 0 · 경고 0. 디자인 파일은 그대로.

프롬프트 원문(복사용): [PROMPTS.md](PROMPTS.md)

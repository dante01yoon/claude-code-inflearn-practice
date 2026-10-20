# 디자인 시스템 ② 컴포넌트 · 베리언트 · 상태

앞 수업 `112-tokens-variables/solution/design-harness`에서 이어갑니다(피그마에 Variables가 있는 파일, 플러그인 실행 · figma.json 채널 갱신).

"이제 피그마에 컴포넌트를 만들어줘. 화면은 아직 말고" → build-in-figma → figma-operator가 섹션마다 그리고 그림을 찍어 확인. 실제 실행 8분 5s(에이전트 7m 23s): Design System 페이지에 섹션 5개 · 컴포넌트 19개 · 상태 변형 7개(ModeToggle, StationPin, BottomSheet, StationRow, CountHero, StateMessage, Button). 색 · 간격 · 모서리는 모두 변수에 연결, 누를 수 있는 것은 44px 이상([Apple HIG](https://developer.apple.com/design/human-interface-guidelines/buttons)).
끝낼 때 Stop 훅이 `FAIL verify missing-state 8`(화면이 아직 없음) → 범위 밖이라 고치지 않고 보고, 지도 출처 문구와 고정 px 3곳을 사람에게 물음.

`solution/design-harness/work/ttareungyi/figma/calls/` = 실제로 피그마에 보낸 코드(01~11). 프롬프트 원문: [PROMPTS.md](PROMPTS.md)

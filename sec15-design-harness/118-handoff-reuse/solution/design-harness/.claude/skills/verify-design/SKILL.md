---
name: verify-design
description: Figma 디자인을 기계 검사와 사람 검토로 나눠 검증한다. "검증해줘", "리뷰해줘", /verify-design에 쓴다.
---
# /verify-design

기계로 재는 것 (`design-harness lint:figma`, figma/nodes.json 기준):
토큰 밖 색, 변수에 안 묶인 색, 타입 스케일 밖 글자 크기·굵기·서체, 간격·반경 토큰 밖 값, 명도 대비(본문 4.5:1, 큰 글자 3:1), 터치 영역 44px, 기본 레이어 이름, 좌우 여백·4px 격자, 필수 상태(빈·오류·로딩) 누락, 화면 간 같은 컴포넌트의 높이·색 차이, 금지 카피·버튼 글자 수.

사람이 보는 것 (`review.json`):
위계(와이어프레임 1순위가 먼저 보이는가), 주요 행동, 상태 안내, 사용자 말, 일관성, 되돌리기, 군더더기, 톤, 기본값 같은 인상, 서비스 성격.

순서:
1. 린트 오류가 0이 될 때까지 `figma-operator`가 Figma를 고친다.
2. `design-critic`을 새 맥락으로 부른다. 제안 점수(suggested)와 findings를 쓴다.
3. 사람이 review.json의 score를 채우고 `design-harness approve verify --by <이름>`.

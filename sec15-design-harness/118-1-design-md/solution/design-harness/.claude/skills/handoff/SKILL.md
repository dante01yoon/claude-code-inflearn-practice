---
name: handoff
description: 검증이 끝난 디자인의 핸드오프 문서를 만든다. "핸드오프", "개발 전달 문서", /handoff에 쓴다.
---
# /handoff

`design-harness handoff`로 HANDOFF.md를 만든다. 문서는 파일에서만 생성한다(화면·상태 표, 흐름, 토큰, 컴포넌트, 기계 검사 결과, 사람 검토 점수). 손으로 내용을 덧붙이지 않는다; 빠진 게 있으면 원본 JSON을 고친 뒤 다시 만든다.

`design-harness design-md`로 DESIGN.md도 만든다. `design-harness check`의 handoff 단계가 DESIGN.md가 지금의 tokens·components·copy로 만든 것과 같은지, 공식 design.md lint에 오류가 없는지 본다. 실패하면 DESIGN.md를 손으로 고치지 말고 원본을 고친 뒤 다시 만든다.

선택: 개발로 넘길 때 Figma의 `get_design_context`/`get_variable_defs`로 코드를 만들 수 있지만, 이 하네스의 완료 조건은 아니다.

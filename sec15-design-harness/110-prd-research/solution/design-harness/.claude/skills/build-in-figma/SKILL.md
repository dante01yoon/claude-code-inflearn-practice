---
name: build-in-figma
description: 승인된 디자인 시스템으로 Figma에 변수·컴포넌트·화면을 만든다. "피그마에 그려줘", /build-in-figma에 쓴다. 파일 키가 있어야 실행한다.
---
# /build-in-figma

전제(하나라도 없으면 멈추고 사람에게 요청):
- `npm run check`에서 system 사람 승인 PASS
- `figma.json`에 사람이 적은 `fileKey`(새 파일이면 `planKey`)와 `account`

`figma-operator` 에이전트에 다음을 넘긴다: 프로젝트 이름, figma.json 경로, tokens/components/copy/wireframes/data 경로. 대화 전체는 넘기지 않는다.

끝 조건: `figma/nodes.json`이 마지막 Figma 수정 뒤에 내보내졌고(`npm run check`의 figma PASS) `npm run lint:figma` 오류 0.

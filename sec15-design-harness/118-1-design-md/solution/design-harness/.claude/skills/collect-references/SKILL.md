---
name: collect-references
description: 공개 서비스 화면을 계정 없이 모아 레퍼런스로 정리한다. "레퍼런스 모아줘", /collect-references에 쓴다.
---
# /collect-references

`researcher` 에이전트에 맡긴다. 규칙:
- 실존 공개 서비스의 공개 페이지만. 로그인·유료 레퍼런스 서비스 없음.
- `design-harness refs:capture`가 ia.json의 뷰포트(없으면 390×844)로 캡처한다.
- `blocked: true`(보안 확인 화면)는 세지 않는다. 우회 금지.
- 캡처를 직접 보고 observed/take를 쓴다. 게이트: 쓸 만한 레퍼런스 3개 이상.

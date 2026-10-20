# 디자인 하네스

디자이너가 Claude Code와 함께 PRD에서 Figma 디자인·검증·핸드오프까지 가는 작업 틀.
시작·재개는 `/design-flow`. 상태는 `npm run check`가 판정한다(폴더의 파일이 곧 상태).

## 단계
prd → research → ia → wireframe → system → figma → verify → handoff
산출물은 모두 `work/<프로젝트>/`에. 여러 프로젝트면 `work/.active`에 이름을 적는다.

## 규칙
- 사람 승인 단계(wireframe, system, verify)는 사람이 `npm run approve`를 실행한다. 에이전트가 대신 승인하지 않는다.
- Figma 도구는 `figma-operator`만 부른다. 쓰기는 system 승인 + `figma.json`의 파일 키가 있어야 하며 `figma-guard` 훅이 강제한다.
- 실존 서비스·공개 데이터만 쓴다. 가상 회사·지어낸 숫자 금지. 데이터 출처와 라이선스를 PRD에 적는다.
- 레퍼런스 화면은 근거 자료일 뿐, 디자인에 복사하지 않는다. 보안 확인 화면은 우회하지 않는다.
- 린트를 통과시키려고 nodes.json·검사 스크립트를 고치지 않는다. 디자인(Figma)이나 원본 JSON을 고친다.
- 같은 실패가 반복되면 `failures.jsonl`을 보고 규칙(copy.json 금지어, 토큰, 컴포넌트)을 고친다.

## 명령
`npm run check` 게이트 · `npm run lint:figma` 노드 검사 · `npm run lint:web` 웹 화면 HTML 검사 · `npm run wireframe` 와이어프레임 SVG ·
`npm run refs:capture` 레퍼런스 캡처 · `npm run review` 사람 체크리스트 · `npm run handoff` 핸드오프 ·
`npm run design-md` tokens·components·copy로 DESIGN.md 생성 + 공식 design.md lint ·
`npm test` 하네스 자체 테스트 · `npm run fixtures` 검사용 예시 노드 재생성

스킬·에이전트는 `design-harness <명령>`으로 부른다(플러그인 PATH). 이 저장소에서 PATH에 없으면 `node bin/design-harness <명령>`이나 위 npm 명령을 쓴다.
플러그인 배포: `.claude-plugin/`, `hooks/hooks.json`. 이 파일의 규칙은 플러그인에 실리지 않으므로 `/design-flow` 스킬의 규칙 절과 같이 고친다.

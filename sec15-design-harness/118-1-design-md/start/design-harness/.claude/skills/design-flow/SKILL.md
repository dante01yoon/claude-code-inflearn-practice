---
name: design-flow
description: 디자인 하네스의 진입점. "디자인 시작", "이어서 진행", "다음 단계" 요청이나 /design-flow에 쓴다. 현재 단계를 판정하고 맞는 에이전트에 맡긴다.
---
# /design-flow

명령은 모두 `design-harness <명령>`이다(플러그인이 PATH에 올린다. 하네스 저장소 안에서 PATH에 없으면 `node bin/design-harness`). 작업 폴더는 지금 프로젝트의 `work/<프로젝트>/`.

0. `work/`가 없으면 새로 시작하는 것이다. 사람에게 프로젝트 이름(영문 소문자·숫자·-)을 묻고 `design-harness new <이름>`으로 PRD.md 틀을 만든 뒤 prd부터 한다. `refs:capture`를 처음 쓰기 전에 `design-harness setup`을 한 번 실행한다.
1. `design-harness check`를 실행한다. 결과가 상태다(폴더에 있는 파일만 믿는다).
2. 위에서부터 처음으로 PASS가 아닌 줄의 단계를 고른다. (플러그인으로 쓰면 에이전트 이름 앞에 `design-harness:`가 붙는다)
   - TODO/FAIL → 그 단계 담당에게 맡긴다:
     prd(사람과 PRD 작성) · research → `researcher` · ia, wireframe → `ia-architect` · system → `system-designer` · figma → `figma-operator`(`/build-in-figma`) · verify → `/verify-design` · handoff → `/handoff`
   - WAIT(사람 승인) → 멈추고 사람에게 볼 것을 보여 준다: 와이어프레임 SVG, 토큰·컴포넌트 표, 린트 결과와 review.json. 승인 명령(`design-harness approve <단계> --by <이름>`)은 사람이 직접 실행한다(프롬프트에서 `! design-harness approve …`). 에이전트가 대신 승인하지 않는다.
   - SKIP(figma) → 파일 키를 받기 전까지는 검사 픽스처(`design-harness path good-nodes`)로 verify를 시험할 수 있다고 알린다.
3. 담당이 끝나면 다시 `design-harness check`. 같은 FAIL이 두 번 나오면 멈추고 failures.jsonl의 해당 줄을 보여 준다.

## 규칙 (담당 에이전트에 맡길 때 함께 전한다)
- 사람 승인 단계(wireframe, system, verify)는 사람이 승인한다. 에이전트가 대신 승인하지 않는다.
- Figma 도구는 `figma-operator`만 부른다. 쓰기는 system 승인 + `figma.json`의 파일 키가 있어야 하며 `figma-guard` 훅이 강제한다.
- 실존 서비스·공개 데이터만 쓴다. 가상 회사·지어낸 숫자 금지. 데이터 출처와 라이선스를 PRD에 적는다.
- 레퍼런스 화면은 근거 자료일 뿐, 디자인에 복사하지 않는다. 보안 확인 화면은 우회하지 않는다.
- 린트를 통과시키려고 nodes.json·검사 스크립트를 고치지 않는다. 디자인(Figma)이나 원본 JSON을 고친다.
- 같은 실패가 반복되면 `failures.jsonl`을 보고 규칙(copy.json 금지어, 토큰, 컴포넌트)을 고친다.

---
name: design-flow
description: 디자인 하네스의 진입점. "디자인 시작", "이어서 진행", "다음 단계" 요청이나 /design-flow에 쓴다. 현재 단계를 판정하고 맞는 에이전트에 맡긴다.
---
# /design-flow

1. `npm run check`를 실행한다. 결과가 상태다(폴더에 있는 파일만 믿는다).
2. 위에서부터 처음으로 PASS가 아닌 줄의 단계를 고른다.
   - TODO/FAIL → 그 단계 담당에게 맡긴다:
     prd(사람과 PRD 작성) · research → `researcher` · ia, wireframe → `ia-architect` · system → `system-designer` · figma → `figma-operator`(`/build-in-figma`) · verify → `/verify-design` · handoff → `/handoff`
   - WAIT(사람 승인) → 멈추고 사람에게 볼 것을 보여 준다: 와이어프레임 SVG, 토큰·컴포넌트 표, 린트 결과와 review.json. 승인 명령(`npm run approve -- <단계> --by <이름>`)은 사람이 직접 실행한다. 에이전트가 대신 승인하지 않는다.
   - SKIP(figma) → 파일 키를 받기 전까지는 검사 픽스처로 verify를 시험할 수 있다고 알린다.
3. 담당이 끝나면 다시 `npm run check`. 같은 FAIL이 두 번 나오면 멈추고 failures.jsonl의 해당 줄을 보여 준다.

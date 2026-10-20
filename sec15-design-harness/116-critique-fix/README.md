# 검증 ② 블라인드 비평 → 기법 → 수정 📏

앞 수업 solution(8화면, 린트 오류 0)에서 이어갑니다.

1. `npm run metrics -- work/ttareungyi` — 고치기 전 지표.
2. `claude` → "디자인 비평 받아줘" → design-critic(새 맥락, 결과만 봄)이 `review.json`: 권고 18/24, 지적 12건(High 3 · Medium 6 · Nit 3). 3분 44초.
3. "High 이상만 고쳐줘. 고칠 때마다 어떤 디자인 기법인지 이름도 붙여줘" → 13분 44초: 보는 범위 맞춤 · 안전 영역(32px) · 충돌 회피(40px) · 지시선 콜아웃 · 쌓는 순서 · 카피 포맷 적용 · 범례 (클러스터링은 일부러 안 씀).
4. `npm run metrics -- work/ttareungyi` — 대비 · 터치 · 간격 100% 유지. 요소 수 · 정렬선이 늘어난 건 지표가 지도 레이어를 이름(`Pins` · `MapLabels` · `MapBase`)으로만 빼기 때문 — 숫자를 믿기 전에 무엇을 세는지 확인.
5. 사람: 새 화면으로 `npm run review` 채점 → `npm run approve -- verify --by <이름>`.

전후 그림: `before-after/`. `solution/design-harness/work/ttareungyi/review.json` = 비평 원문, `figma/calls/15-high-fixes.js` · `16-return-rows.js` = 실제 수정 코드.
프롬프트 원문: [PROMPTS.md](PROMPTS.md)

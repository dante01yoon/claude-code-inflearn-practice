# 디자인 시스템 ① 토큰 → Variables

`start/design-harness`(와이어프레임 승인까지 끝난 상태)에서 시작합니다. `npm install` 후 `claude`.

1. "다음 단계 진행해줘. 서체는 피그마에 있는 Noto Sans KR로 해줘" → system-designer가 `tokens.json`(primitive → semantic, 대비 쌍) · `components.json` · `copy.json`. 실제 실행 3분 39초: 의미 색 17 · 간격 4px 단위 · 글자 6단계 · 컴포넌트 19 · 대비 쌍 16개 모두 4.5:1 이상(최저 4.92, [WCAG 2.2 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
2. 사람이 직접: `npm run check` → `npm run approve -- system --by <이름>` → `work/ttareungyi/figma.json`에 `{"channel": "<플러그인 창의 채널>", "fileName": "<열린 피그마 파일 이름>", "fileKey": "<파일 주소의 키>"}`.
3. "승인했어. 피그마 파일 정보도 figma.json에 적었으니까, 피그마에 Variables만 먼저 만들어줘" → figma-operator가 `npm run figma -- <code.js>`로 Variables 80개(primitive 31 숨김 + semantic 49). 2분 21초.

## 하네스 변경 (Talk to Figma 판) — `harness-changes/`
앞 수업 하네스는 공식 MCP(`use_figma`)용입니다. 이 섹션은 무료 연결(앞 수업 「공식 MCP 없이 무료로 피그마 연결」)을 쓰므로 아래 파일을 덮어쓰고 `npm install` 하세요(`ws` 추가).
- `scripts/figma/send.mjs` — `npm run figma -- <code.js> [--data d.json]` · `export`(→ figma/nodes.json) · `shots`(→ figma/screens/*.png). 보내기 전에 열린 파일 이름 = figma.json `fileName` 확인, 쓰기는 system 승인 필요, 쓰기 시각 기록.
- `scripts/hooks/figma-guard.mjs` + `.claude/settings.json` — Bash로 `npm run figma`를 부를 때도 같은 규칙(승인 전 쓰기 → exit 2).
- `CLAUDE.md`, `.claude/agents/figma-operator.md`, `.claude/agents/design-critic.md`, `.claude/skills/build-in-figma/SKILL.md` — Talk to Figma 기준 문구.
- `package.json` — `"figma"` 스크립트, `ws` 의존성.

`solution/design-harness` = 이 수업이 끝난 상태(figma.json의 채널·파일 키는 자리표시로 바꿔 둠). 클로드 결과는 매번 조금씩 다르니 여기서 이어가도 됩니다.
프롬프트 원문: [PROMPTS.md](PROMPTS.md)

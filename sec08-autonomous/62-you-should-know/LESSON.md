# 섹션 8 · 62강 옆에서 지켜보는 mod "You should know" — 놓친 점을 노트로

## 이번 섹션의 그림: 야간 근무조
낮에는 옆에서 한 줄씩 부탁하지만, 퇴근할 때는 할 일을 적어 두고 나갑니다. 근무조가 밤새 이어서 일하고, 아침에 결과만 확인합니다. 맡겨 둘 때 생기는 걱정과 이번 섹션의 기능은 이렇게 짝지어집니다.

| 걱정 | 기능 | 수업 |
|---|---|---|
| 안 보는 사이에 놓친 게 있으면? | You should know — 옆에서 지켜보다 노트 | 62 (이번) |
| 어디까지 하면 끝인지는? | `/goal` — 완료 조건을 적은 작업 지시서 | 63 |
| 한 명이 다 못 할 만큼 크면? | dynamic workflows · `ultracode` | 64 |
| 터미널을 계속 붙잡고 있어야? | 백그라운드 세션 · agent view (research preview) | 65 |
| 자리에 없을 때 보려면? | Remote Control — 휴대폰·브라우저 | 66 |
| 한 번에 엮기 | 미션 8 | 67 |

## You should know란
- 클로드 코드에 처음부터 들어 있는 빌트인 mod `cc-plugin-you-should-know`. 긴 작업을 하는 동안 옆 에이전트가 따로 지켜보다가, 내가 놓칠 만한 것을 찾으면 입력창 위에 노트를 띄웁니다.
- 비유: 옆자리 동료가 붙여 주는 포스트잇. 일을 멈추거나 대신 고치지 않고, 판단은 내가 합니다.
- 기본은 꺼져 있습니다(2026-10 기준, 조직에서 쓸 수 있을 때만 목록에 보임).

## 켜기 / 끄기
```text
/plugin enable cc-plugin-you-should-know@builtin
```
- `@builtin` = 클로드 코드에 들어 있는 mod. 명령을 넣으면 플러그인 화면에 "Enabled cc-plugin-you-should-know. Applies when you close this menu."가 나오고, Esc로 닫으면 다시 불러옵니다(`/reload-plugins`).
- 사용자 설정(`~/.claude/settings.json`)의 `enabledPlugins`에 적히므로 다음 세션에도 켜져 있습니다. 끄기는 `/plugin` → Installed → Built-in.
- 이번 섹션 녹화는 auto 모드(섹션 1)로 진행합니다. 맡겨 둔 일이 도구마다 멈추지 않게 하려는 것입니다.

## 실습 (입력한 것 그대로)
```text
/plugin enable cc-plugin-you-should-know@builtin
역 찾기에서 초성으로도 찾게 해 줘. ㄱㄴ 치면 강남 나오게
커밋해 줘
```
- 결과(녹화 1분 46초): 검색 코드를 `station-search.mjs`로 빼고, 9월 실제 역 목록으로 `tests/station-search.test.mjs`를 새로 만듦. ㄱㄴ → 강남·가능·강남구청…, 강ㄴ처럼 섞어 쓰기 가능, 된소리(ㄸ)는 따로, 점수가 같으면 하루 승하차가 많은 역 먼저. "npm test는 통과했지만 브라우저에서 직접 쳐 보지는 않았다"고 밝힘. 커밋 `39f0f7b`.
- 오른쪽에 생기는 창은 또 다른 빌트인 mod인 diff 창(바뀐 파일·줄을 그때그때 보여 줌)입니다.
- 이 짧은 작업에서는 You should know 노트가 뜨지 않았습니다. 알아 둘 만한 것이 있을 때만 말을 겁니다.

## 노트가 뜬 장면 (63강 녹화 중)
`/goal`로 두 역 비교 그래프를 길게 맡겼을 때, 입력창 바로 위에 이런 노트가 떴습니다.
```text
✦ Heads up · 두 역 비교에서 A역은 고른 노선만, B역은 늘 모든 노선 합계로 그려서 같은 기준이 아닐 수 있습니다.
  1: Learn more   2: Knew this already   0: Dismiss
```
일하던 클로드는 이 차이를 말하지 않았습니다. 1 = 더 자세히, 2 = 이미 알고 있음, 0 = 닫기. 지적이 맞는지·고칠지는 63강에서 이어서 봅니다.

## 결과 화면
`npm start` → http://127.0.0.1:8000/subway.html → 역 찾기에 `ㄱㄴ`(강남이 맨 위), `ㅎㄷ`(학동·행당·홍대입구), `강ㄴ` → Enter로 강남 답 카드.

## 근거 (2026-10-12 확인, Claude Code 2.1.296)
- [Mods overview — Mods built into Claude Code](https://code.claude.com/docs/en/plugins/mods/overview)
- [Plugins CLI reference — plugin in a session](https://code.claude.com/docs/en/plugins/cli-reference)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 8 = 브랜치 `sec08-auto`, 이 수업 커밋 `39f0f7b`).

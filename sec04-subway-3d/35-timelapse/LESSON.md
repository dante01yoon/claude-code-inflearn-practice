# 섹션 4 · 35강 MVP — 역 기둥이 24시간 솟았다 내려가는 타임랩스 (deck.gl)

32강 화면 틀의 빈 지도 자리에 deck.gl `ColumnLayer`로 역마다 기둥을 세우고, 재생 버튼으로 하루를 흘려 봅니다.

## 개념
- MVP = 가장 작은 단위로 핵심 화면이 돌아가게
- deck.gl `ColumnLayer`(위치·높이·색), `transitions`(높이를 부드럽게), 공통 눈금(하루 최댓값으로 고정)

## 입력한 것 (그대로)
```bash
CLAUDE_CODE_ENABLE_TODO_TOOLS=1 claude
```
짧은 프롬프트:
```text
subway.html 지도 자리에 deck.gl로 역마다 3D 기둥 세우고, 재생 누르면 24시간이 흘러가면서 기둥이 오르내리게 해 줘
```
→ 약 2분 47초. 역 529곳, 0.9초에 한 시간대씩, 공통 눈금(최대 30,000명), 배경 타일 없이 노선 선(API 키 불필요), deck.gl 9.0.38(jsDelivr).
화면을 열어 보니 기둥이 가늘고 모두 회색 → 어디가 붐비는지 안 보임(빗나감).

"프롬프트를 좀 더 자세히 써야 제대로 되니, 제대로 작성해 보겠습니다" — 자세한 프롬프트 (`claude --continue`, 줄바꿈은 Shift+Enter):
```text
기둥이 가늘고 다 회색이라 시간대가 바뀌어도 차이가 잘 안 보여. 이렇게 고쳐 줘.
1) 기둥을 지금보다 2배 굵게, 최대 높이도 2배로.
2) 기둥 색은 그 시간대 인원이 많을수록 노랑에서 빨강으로.
3) 3D 지도 칸을 화면 높이의 70%로 키우고, 처음 시점은 도심을 45도로 내려다보게.
4) 끝나면 08시와 14시 화면을 직접 찍어서 차이가 보이는지 확인해 줘.
```
→ 반지름 110m→220m, 최대 높이 4km→8km, 노랑(#ffd43b)→빨강(#e03131), 70vh, 45도 시점. 직접 찍어 보다가 버그 발견: 색 전환 애니메이션 때문에 짧은 기둥 윗면이 비어 보임 → 색 전환을 빼고 높이만 전환(코드 주석으로 이유 기록).
```text
좋아. 여기까지 커밋해 줘
```

## 결과 (seoul-live-3d `sec04-subway`)
- `9a2cbc6` 9월 CSV 어댑터와 역사마스터 좌표 매핑 추가(2단계) · `1df5c99` 노선별 역 순서(SUBWAY_LINES) 추가 · `00b6914` 지하철 화면에 deck.gl 3D 기둥과 24시간 재생 추가
- 보기: `python3 -m http.server 8000` → http://127.0.0.1:8000/subway.html → ▶

## 근거 문서
- [deck.gl ColumnLayer](https://deck.gl/docs/api-reference/layers/column-layer) · [deck.gl transitions](https://deck.gl/docs/developer-guide/animations-and-transitions)

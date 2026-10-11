# 섹션 2 · 18강 미션 2 — 서울 라이브 3D: 아침 8시 vs 저녁 6시

지금까지 연결한 MCP 서버(Context7 · Playwright)로 서울 라이브 3D 지도를 키워서, 도심 역의 출근·퇴근 차이를 **눈으로** 확인합니다.

## 미션
1. Context7으로 deck.gl 문서를 찾아 지도 기둥 위에 **한글 역 이름** 띄우기
2. Playwright로 **08시와 18시** 화면을 찍어 비교하기
3. 결과가 원하는 모습과 다르면 프롬프트를 자세히 고쳐서 다시 시키기
4. 끝나면 `/context`로 대화가 얼마나 찼는지 확인하기

준비: `start/` = 16강 끝 상태(`.mcp.json`에 context7 · playwright). 17강에서 Playwright를 껐다면 `/mcp`에서 다시 켜기.

## 풀이에서 입력한 것 (그대로)

```bash
claude
```

짧은 프롬프트 1 — 한 번에 됨:

```text
context7로 deck.gl 문서 보고 지도 기둥 위에 역 이름 띄워 줘
```

- Context7 검색어: `TextLayer labels above ColumnLayer with elevation`, `TextLayer characterSet auto for non-ASCII (CJK/Korean) text …`
- 문서 확인 결과: TextLayer는 기본 문자 집합이 ASCII라 **한글은 `characterSet: 'auto'`** 가 필요

짧은 프롬프트 2:

```text
playwright로 08시랑 18시 화면 스크린샷 찍어서 비교해 줘
```

→ 두 화면이 거의 똑같아 보임(빗나감). 이유: ① 기둥 높이를 화면마다 가장 큰 역에 맞춤 ② 승차+하차를 합쳐서 봄(아침에 내린 사람이 저녁에 탐). 스크린샷: `solution/screenshots/first-try-sum-08.png`, `first-try-sum-18.png`

"프롬프트를 좀 더 자세히 써야 제대로 되니, 제대로 작성해 보겠습니다" — 자세한 프롬프트 (`claude --continue`로 이어서):

```text
playwright로 다시 찍어 줘. 이번엔 '하차' 기준으로 바꾸고, 기둥 높이는 하루 전체에서 가장 큰 값을 기준으로 고정해서 시간대끼리 높이를 비교할 수 있게 해 줘.
08시와 18시 화면을 각각 찍고, 두 장을 나란히 붙인 compare.html을 만들어서 그 화면도 스크린샷으로 보여 줘.
```

(두 번째 줄은 Shift+Enter로 줄을 바꿨습니다.)

```text
/context
```

## 결과 (2026년 7월 한 달 합계, 하차 인원)

| 역 | 08시대 | 18시대 | 18시 / 08시 |
|---|---:|---:|---:|
| 서울역 | 274,196 | 214,060 | 78% |
| 시청 | 216,414 | 25,706 | 12% |
| 종각 | 285,007 | 53,109 | 19% |
| 종로3가 | 66,235 | 38,219 | 58% |
| 종로5가 | 97,217 | 31,841 | 33% |

- 시청·종각은 저녁 하차가 아침의 10~20% → 출근 때 사람들이 내리는 사무실 동네
- 결과 화면: `solution/compare.html`, `solution/screenshots/compare.png`(비교 페이지), `off-08.png`, `off-18.png`
- `/context`: 대화 메시지 40.5k 토큰, 실제로 쓴 MCP 도구 설명 3k 토큰이 올라옴(시작 때는 0) → 큰 작업이 끝나면 `/clear`
- 데이터: 서울 열린데이터광장 「지하철 호선별 역별 시간대별 승하차 인원」(공공누리 제1유형). 역 좌표(`data/stations.json`)는 근사값
- 보기: `solution/`에서 `python3 -m http.server 8000` → http://127.0.0.1:8000/compare.html

## 채점 기준
- [ ] 기둥 위 한글 역 이름이 깨지지 않는다
- [ ] 08시·18시 스크린샷이 같은 높이 기준(하루 최댓값)으로 비교된다
- [ ] `/context`로 메시지·MCP 도구 토큰을 확인했다

## 근거 문서
- [Claude Code MCP](https://code.claude.com/docs/en/mcp) · [deck.gl TextLayer](https://deck.gl/docs/api-reference/layers/text-layer) · [Context7](https://github.com/upstash/context7) · [Playwright MCP](https://github.com/microsoft/playwright-mcp)

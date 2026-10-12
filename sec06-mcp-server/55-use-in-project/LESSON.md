# 섹션 6 · 55강 프로젝트 2·3(서울 라이브 3D)에서 내 MCP 서버 쓰기

## 개념
- 팀과 나누기 = `mcp-server/` + `.mcp.json`을 저장소에 커밋(project 범위). 팀원은 처음 한 번 승인, 키는 각자 환경 변수.
- 범위 다시 보기: local(이 프로젝트·나만) · project(`.mcp.json`·팀) · user(내 모든 프로젝트·나만).
- 클로드 코드는 `.mcp.json`의 프로젝트 서버를 쓰기 전에 승인을 묻는다(되돌리기: `claude mcp reset-project-choices`). `claude -p` 같은 실행에서는 묻지 않고 불러오므로 모르는 저장소의 `.mcp.json`은 먼저 열어 볼 것.
- 앱을 고칠 때 내 MCP 서버 쓰기: ① 앱이 내놓는 답을 다른 데이터로 **검산** ② 새 화면을 만들기 전에 **실제 칸을 먼저 확인**.

## 입력한 것 (그대로)
```text
mcp-server랑 .mcp.json 커밋해 줘
앱 답 카드의 가장 한가한 시간이 8월 데이터로도 같은지 MCP로 강남, 홍대입구, 잠실 확인해 줘
장소 기록 패널에 지금 연령대 비율 막대 넣어 줘. 어떤 칸이 오는지는 장소 붐빔 도구로 먼저 확인하고
커밋해 줘
```
→ 커밋 `2304155`(.mcp.json에 실제 키 없음 확인, node_modules 제외, 손대던 다른 파일은 따로 둠).
→ 프로젝트 2 검산: seoul-data를 6번 호출(9월 = CSV 도구, 8월 = API 도구), 앱과 같은 `quietestInWindow`로 다시 계산 → 세 역 × 시간 창 4개(출근·낮·퇴근·저녁) 모두 8월에도 같음. 잠실 낮(10시 vs 11시)만 차이 약 3%.
→ 프로젝트 3: 도구 응답에는 연령대 칸이 없음(54강에서 짧게 줄였기 때문) → 원본 API로 `PPLTN_RATE_0`~`PPLTN_RATE_70`(8칸) 확인 → `realtime-citydata.mjs` `toCitydata`에 `ages`, `subway.html` `renderAges`(가장 많은 연령대 강조), 테스트 73개. 클로드는 화면을 직접 보지 못했다고 밝힘 → 수업에서 앱을 열어 확인.
→ 커밋 `a257cf3`(fetchCitydataArea 분리·CLAUDE.md), `404f238`(연령대 막대).

결과 화면: `npm start` → `subway.html`에서 시청 → 가까운 장소 · 광화문·덕수궁 → 패널 아래 「지금 연령대 비율」(sample 키는 광화문·덕수궁만 값이 있음, 이 녹화는 DB를 켜지 않아 기록 그래프는 안내만).

## 근거
- 클로드 코드 MCP 문서(프로젝트 서버 승인): [https://code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp)
- 서울 열린데이터광장 [서울시 실시간 인구데이터(OA-21778)](https://data.seoul.go.kr/dataList/OA-21778/A/1/datasetView.do)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 6 = 브랜치 `sec06-mcp`, main 병합 `7bc358e`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.

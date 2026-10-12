# 섹션 6 · 56강 미션 6 — 내 MCP 서버에 따릉이 도구 붙이기

## 미션
서울 열린데이터광장의 따릉이 대여소 현황 API `bikeList`를 감싸는 도구를 MCP 서버에 추가하세요. 대여소 이름 일부로 찾고, 지금 자전거 수와 거치대 수를 알려 줄 것. 키는 환경 변수로만 받고 결과에 나오지 않게(54강). 클로드를 다시 켜서 `/mcp`로 도구 수를 보고, "망원역 근처 따릉이 몇 대 있어?"로 실제 호출 확인 후 커밋.

## 채점표
1. `/mcp`에서 도구 수가 늘었다 2. 대여소 이름 일부로 찾는다 3. 결과·오류에 키가 없다 4. sample 키 한계를 결과에 알려 준다 5. 질문에 실제로 도구가 불렸다(힌트: sample 키는 망원역·합정역 근처 5곳만) 6. 커밋

## 정답 풀이 (입력한 것 그대로)
```text
따릉이 대여소 현황 도구도 추가해 줘. bikeList API로
```
```bash
/exit
claude
/mcp      # ✔ seoul-data · 4 tools
```
```text
망원역 근처 따릉이 몇 대 있어?
커밋해 줘
```
→ `get_bike_stations({ query, limit? })`(이름 일부·번호 102·ID ST-4로 찾기, 자전거·거치대·거치율, 실제 키용 1,000건 단위 나눠 받기 + 1분 캐시, sample 키 안내를 결과에 적음, 키는 결과·오류에서 지움). 망원역 대여소 2곳에 자전거 27대(녹화 시점). 커밋 `0470eb4`.
⚠️ 답 끝의 "전체를 보려면 .mcp.json의 SEOUL_OPENAPI_KEY를 실제 키로 바꾸라"는 안내는 따르지 마세요 — 키가 커밋됩니다. 셸에서 `export SEOUL_OPENAPI_KEY=...` 후 클로드를 실행하세요.

결과 화면: MCP Inspector(`npx @modelcontextprotocol/inspector@2.10.1 node mcp-server/src/index.ts`) → Tools에 4번째 도구 「따릉이 대여소 현황」 → `망원역` 실행 → 표 + Structured Output(좌표 포함).

## 근거
- 서울 열린데이터광장 [서울시 공공자전거 실시간 대여정보(OA-15493)](https://data.seoul.go.kr/dataList/OA-15493/A/1/datasetView.do)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 6 = 브랜치 `sec06-mcp`, main 병합 `7bc358e`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.

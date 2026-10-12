# 섹션 6 · 54강 공공데이터 API를 MCP 도구로 감싸기

## 개념
- API를 도구로 감싼다 = 클로드는 역·장소 **이름만** 넘기고, 서버가 API 주소를 만들고 키를 붙여 부른 뒤, 긴 JSON에서 **필요한 칸만 짧은 글로** 돌려준다.
- 오늘 감싼 API (서울 열린데이터광장, 공공누리 제1유형): 지하철 승하차 `CardSubwayTime`(OA-12252, 섹션 4 CSV의 API판) · 실시간 도시데이터 `citydata_ppltn`(OA-21778, 주요 121곳 혼잡도·추정 인구·12시간 예측).
- 인증키는 서버 안에: `.mcp.json`에는 키 대신 `"SEOUL_OPENAPI_KEY": "${SEOUL_OPENAPI_KEY:-sample}"`(클로드 코드의 `${VAR:-default}` 펼치기), 결과·오류 문구에서도 키를 지움(`scrub`).
- 도구 설명은 짧고 분명하게: 도구가 많으면 클로드 코드는 서버 설명·도구 설명으로 도구를 찾는다(설명은 2,048자에서 잘림).
- 공개 sample 키의 한계(2026-10 확인): 승하차는 한 번에 5행, 도시데이터는 어느 장소든 광화문·덕수궁 값만. 내 인증키는 셸에서 `export SEOUL_OPENAPI_KEY=...` 후 클로드 실행(`.env`는 자동으로 읽히지 않음).

## 입력한 것 (그대로)
```text
서울 열린데이터 API로 도구 두 개 더 만들어 줘. 승하차는 CardSubwayTime, 장소 붐빔은 citydata_ppltn. 키는 SEOUL_OPENAPI_KEY 환경 변수를 .mcp.json에서 넘기고, 없으면 sample로
```
→ 클로드가 먼저 API 경로를 바꿔 가며 응답 모양을 시험(sample 키 한계 발견) → `mcp-server/src/openapi.ts`(API 호출·달 고르기·장소 찾기·`scrub`), 도구 `get_station_hourly_api({ station, month?, line? })`·`get_place_crowd({ place })`, 리소스 `places://list`(121곳), `realtime-citydata.mjs`의 한 장소 호출을 `fetchCitydataArea`로 분리(앱과 같이 씀). 타입 검사 + stdio 클라이언트로 호출 시험.

```bash
/exit
cat .mcp.json     # "env": { "SEOUL_OPENAPI_KEY": "${SEOUL_OPENAPI_KEY:-sample}" }
claude
/mcp              # ✔ seoul-data · 3 tools
```
```text
광화문 지금 붐벼? 내일 아침 출근 시간엔?
강남역 8월이랑 9월 출근 시간 하차 비교해 줘
방금 광화문 예측을 막대그래프 html 한 장으로 만들어 줘
```
→ 광화문·덕수궁 지금 「여유」 18,000~20,000명, 내일 07~09시도 여유(장소 안 인구라 역 개찰구 혼잡과는 다름). 강남역 출근(07~09시) 하차: 8월 799,661명(API 도구) vs 9월 789,056명(CSV 도구), −1.3%, 대부분 09시대. 마지막 질문에 클로드가 HTML을 만들고 Artifact로도 게시함 — 수업에서는 만든 HTML 파일을 브라우저로 열어 봄(`extra/gwanghwamun-forecast.html`, 2026-10-12 20:35 값으로 고정).

## 근거
- 서울 열린데이터광장: [서울시 지하철 호선별 역별 시간대별 승하차 인원 정보(OA-12252)](https://data.seoul.go.kr/dataList/OA-12252/S/1/datasetView.do), [서울시 실시간 인구데이터(OA-21778)](https://data.seoul.go.kr/dataList/OA-21778/A/1/datasetView.do)
- 클로드 코드 MCP 문서(환경 변수 펼치기, 도구 검색과 서버 설명): [https://code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 6 = 브랜치 `sec06-mcp`, main 병합 `7bc358e`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.

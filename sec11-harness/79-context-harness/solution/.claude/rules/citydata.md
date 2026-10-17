---
paths:
  - "citydata-areas.mjs"
  - "realtime-citydata.mjs"
  - "api/citydata.js"
  - "vercel.json"
  - "subway.html"
  - "tests/citydata.test.mjs"
---

# 실시간 도시데이터(121장소)

- `citydata-areas.mjs`: 서울시 주요 121장소 영역 zip(shapefile)을 읽을 때 풀어서 `{ code, category, name, polygons }`로 바꾼다(zip·.shp·.dbf 파서, 의존성 없음, `DecompressionStream` 사용). 브라우저와 Node가 함께 쓴다. 혼잡도 단계 `CONGEST_LEVELS`도 브라우저에서 쓰도록 여기 있다.
- `realtime-citydata.mjs`: 실시간 도시데이터(`citydata_ppltn`, 인구·혼잡도·12시간 예측) 121곳 호출·5분 캐시·키 가리기(`createCitydataSource`). 장소 코드는 영역 zip에서 읽는다. 키는 일반 인증키 `SEOUL_OPENAPI_KEY`(`.env`/Vercel 환경 변수). `sample` 키는 어느 장소를 물어도 광화문·덕수궁만 주므로 1곳만 묻는다. `server.mjs`와 `api/citydata.js`가 함께 쓰고, Vercel은 `vercel.json`의 `includeFiles`로 zip을 함수에 올린다.
- `toCitydata`는 `PPLTN_RATE_0`…`70`을 8칸 `ages`로 만든다.
- `subway.html`의 도시데이터 레이어: 영역을 추정 인구(범위의 가운데)만큼 솟게(`PolygonLayer`), 색은 혼잡도 4단계(`--congest-1`…`--congest-4`). 값은 시간 슬라이더의 시가 지금이면 지금, 12시간 안이면 그 시 예측(`crowdAtHour`), 그 밖이면 회색. 레이어가 보이면 승하차 기둥은 흐리게(`CITY_ON_ALPHA`) 그린다.

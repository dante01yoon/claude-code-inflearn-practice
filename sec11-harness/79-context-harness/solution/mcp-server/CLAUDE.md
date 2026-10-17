# mcp-server

공식 TypeScript SDK로 만든 MCP 서버(자체 `package.json`, 빌드 없음).

- 도구·리소스는 `src/server.ts`의 `createServer`에 있다.
  - 도구: `get_station_hourly`(9월 CSV 역별 시간대 승하차), `get_station_hourly_api`(CardSubwayTime, 달 지정), `get_place_crowd`(citydata_ppltn, 121장소), `get_bike_stations`(bikeList, 따릉이 대여소 이름·번호·ID로 찾기, 전체를 1,000건씩 받아 1분 캐시).
  - 리소스: `stations://list`, `places://list`.
- API 호출은 `src/openapi.ts`. 키는 `.mcp.json`의 env로 넘기는 `SEOUL_OPENAPI_KEY`, 없으면 `sample`.
- 전송만 따로 붙인다.
  - stdio: `npm start`(`src/index.ts`). stdout이 MCP 전용이라 로그는 `console.error`로.
  - Streamable HTTP: `npm run start:http`(`src/http.ts`, http://127.0.0.1:18610/mcp). 세션 없이 요청마다 서버 생성, POST만, Host 헤더 검사.
- Node가 `.ts`를 바로 실행하므로 import 경로는 `.ts`로 쓴다(tsconfig `allowImportingTsExtensions`).
- 루트의 `subway-csv.mjs`·`stats.mjs`를 import한다. 그 파일을 바꾸면 여기도 확인한다.

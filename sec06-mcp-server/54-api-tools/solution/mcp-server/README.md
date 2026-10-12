# seoul-live-3d MCP 서버

공식 TypeScript SDK(`@modelcontextprotocol/sdk`)로 만든 stdio MCP 서버. 저장소의 9월 승하차 CSV(`data/raw/`)를 `subway-csv.mjs`로 읽는다.

- 도구 `get_station_hourly({ station })`: 역의 시간대별(04시~다음 날 03시) 승차·하차(한 달 합계). 환승역은 노선을 합치고, 부역명 괄호나 끝의 "역"은 빼고 찾아도 된다. 못 찾으면 비슷한 이름을 알려 준다.
- 도구 `get_station_hourly_api({ station, month?, line? })`: 같은 내용을 열린데이터광장 CardSubwayTime API에서 받는다. `month`(YYYYMM)로 다른 달을 물을 수 있고, 비우면 지난달부터 석 달 안의 가장 최근 달. `line`(예: `2호선`)을 주면 그 노선만.
- 도구 `get_place_crowd({ place })`: 실시간 도시데이터(citydata_ppltn)로 주요 121장소의 지금 혼잡도·추정 인구·12시간 예측. 장소는 이름이나 코드(`POI009`). 이름이 여러 곳에 걸리면 후보를 알려 준다.
- 리소스 `stations://list`: 역 이름과 노선 목록(JSON).
- 리소스 `places://list`: 주요 121장소의 코드·분류·이름(JSON, 영역 zip에서 읽음).

## 인증키

API 도구 두 개는 일반 인증키 `SEOUL_OPENAPI_KEY` 환경 변수를 쓴다. 저장소의 `.mcp.json`이 `${SEOUL_OPENAPI_KEY:-sample}`로 넘기므로 Claude Code를 띄우는 셸에 `export SEOUL_OPENAPI_KEY=...`를 해 두면 되고(`.env`는 자동으로 읽히지 않는다), 없으면 `sample` 키를 쓴다. sample 키는 한 번에 5행까지만 주고(노선이 6개 넘는 역은 일부만), 도시데이터는 어느 장소를 물어도 광화문·덕수궁만 준다. 도구는 이때 그 사실을 결과에 적는다. 키는 결과·오류 문구에 넣지 않는다.

## 실행

```sh
cd mcp-server
npm install
npm start          # node src/index.ts (Node 23.6+의 타입 제거로 빌드 없이 실행)
npm run typecheck  # tsc --noEmit
```

Claude Code에 등록(저장소 루트에서):

```sh
claude mcp add seoul-live-3d -- node mcp-server/src/index.ts
```

출처: 서울 열린데이터광장(서울특별시, 공공누리 제1유형)

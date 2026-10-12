# seoul-live-3d MCP 서버

공식 TypeScript SDK(`@modelcontextprotocol/sdk`)로 만든 stdio MCP 서버. 저장소의 9월 승하차 CSV(`data/raw/`)를 `subway-csv.mjs`로 읽는다.

- 도구 `get_station_hourly({ station })`: 역의 시간대별(04시~다음 날 03시) 승차·하차(한 달 합계). 환승역은 노선을 합치고, 부역명 괄호나 끝의 "역"은 빼고 찾아도 된다. 못 찾으면 비슷한 이름을 알려 준다.
- 리소스 `stations://list`: 역 이름과 노선 목록(JSON).

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

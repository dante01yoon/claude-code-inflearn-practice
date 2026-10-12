# 섹션 6 · 53강 MCP 서버 구조 — 도구·리소스, stdio와 HTTP

## 개념
- 비유: 섹션 2의 만능 USB 허브(클로드 코드)에 **직접 만든 장치(내 MCP 서버)**를 꽂기. 규격(MCP)만 맞으면 다른 MCP 앱에도 꽂힘.
- 왜 직접 만드나: ① 우리 데이터·API를 도구로 ② 한 번 만들어 여러 곳에서 ③ 비밀(인증키)은 서버 안에 → 54강 ④ `.mcp.json` 하나로 팀 공유 → 55강.
- 세 역할: 호스트(클로드 코드) → 서버마다 클라이언트 하나(1:1) → 서버.
- 메시지: JSON-RPC 2.0 — `initialize`(인사) → `tools/list`(목록) → `tools/call`(호출).
- 서버가 내놓는 것: 도구(tools, 모델이 골라 부름) · 리소스(resources, 앱·사용자가 골라 붙임) · 프롬프트(prompts, 사용자가 고르는 부탁 문구).
- 전송: **stdio**(클로드 코드가 서버를 직접 실행, 표준 입력·출력 — stdout엔 MCP 메시지만, 로그는 `console.error`) · **Streamable HTTP**(따로 켜진 서버, `/mcp` 주소에 POST — 내 컴퓨터용이면 127.0.0.1에만, Origin·Host 검사).
- 공식 TypeScript SDK(2026-10 기준): v2 `@modelcontextprotocol/server` 2.3.1이 안정판(명세 2026-07-28), v1 `@modelcontextprotocol/sdk` 1.32.1도 공식 지원 계속. 녹화에서 클로드는 v1을 골랐고 등록 방식(`registerTool`·`registerResource`)은 같음.

## 입력한 것 (그대로)
서울 라이브 3D(`seoul-live-3d`, main `9e43764`에서 브랜치 `sec06-mcp`)에서:
```text
mcp-server 폴더에 공식 TypeScript SDK로 MCP 서버 만들어 줘. 역 이름 주면 9월 시간대별 승하차 알려 주는 도구 하나, 역 목록 리소스 하나. stdio로
```
→ `mcp-server/`(자체 `package.json`, `@modelcontextprotocol/sdk` 1.32.1 + zod 4, Node가 `.ts`를 바로 실행), 도구 `get_station_hourly({ station })`(9월 CSV, 04시~다음 날 03시, 환승역 합산, 가장 붐비는 시간대, 텍스트 + 구조화 값), 리소스 `stations://list`(역 528개). 루트의 `subway-csv.mjs`·`stats.mjs`를 그대로 import. 타입 검사·테스트 72개 통과. (설치된 TypeScript가 7이라는 안내 — 그대로 둠)

```bash
claude mcp add --scope project seoul-data -- node mcp-server/src/index.ts
cat .mcp.json
claude    # "New MCP server found in this project: seoul-data" → Use this MCP server
/mcp      # ✔ seoul-data · 1 tool
```
```text
강남역 몇 시에 제일 한가해?
@seoul-data:stations://list 여기서 2호선 역은 몇 개야?
같은 서버를 HTTP로도 띄울 수 있게 해 줘. 주소는 127.0.0.1:18610
```
→ `Called seoul-data` — 낮에는 12시대(182,554명)가 가장 덜 붐빔, 가장 붐비는 때 18시대(480,534명). 리소스 질문 → 2호선 50개(실제 51개, 이 데이터에선 까치산이 5호선에만). HTTP → `src/server.ts`(`createServer()`)를 stdio(`src/index.ts`)와 HTTP(`src/http.ts`: 요청마다 서버 생성, POST만, Host 검사)가 같이 씀, `npm run start:http`.

HTTP로 꽂아 보기 (클로드 호출 없음):
```bash
npm --prefix mcp-server run start:http &
claude mcp add --transport http seoul-data-http http://127.0.0.1:18610/mcp
claude mcp list        # seoul-data ✔ Connected · seoul-data-http ✔ Connected
curl -s -X POST 127.0.0.1:18610/mcp -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq '.result.tools[].name'
kill %1
claude mcp list        # seoul-data-http ✘ Failed to connect
claude mcp remove seoul-data-http
```

결과 화면 — MCP Inspector(클로드 없이 서버 점검):
```bash
npx @modelcontextprotocol/inspector@2.10.1 node mcp-server/src/index.ts
```
연결 → Tools → `get_station_hourly`에 `강남` → 시간대별 표 + Structured Output, Resources → 역 목록(JSON, 528개). 오른쪽 Messages에 `initialize`·`tools/list`·`resources/list`·`tools/call`. (녹화의 서버 카드: `MCP 2025-11-25`)

## 근거
- MCP 명세 2026-07-28: [Architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture), [Transports — stdio·Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports), [Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools), [Resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources)
- 클로드 코드 MCP 문서: [https://code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp)
- MCP Inspector: [https://github.com/modelcontextprotocol/inspector](https://github.com/modelcontextprotocol/inspector)
- 데이터: 서울 열린데이터광장 「서울시 지하철 호선별 역별 시간대별 승하차 인원 정보」(OA-12252, 2026년 9월, 공공누리 제1유형)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 6 = 브랜치 `sec06-mcp`, main 병합 `7bc358e`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.

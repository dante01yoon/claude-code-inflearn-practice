// 「서울 라이브 3D」 MCP 서버(Streamable HTTP). 도구·리소스는 stdio와 같은 server.ts를 쓴다.
// 주소: http://127.0.0.1:18610/mcp (HOST·PORT 환경 변수로 바꿀 수 있다)
// 세션 없이(stateless) 요청마다 서버와 전송을 새로 만든다. 데이터는 읽기 전용이라 세션이 필요 없다.
import { createServer as createHttpServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer, month, rows } from "./server.ts";

const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? 18610);
const PATH = "/mcp";

// DNS 리바인딩 막기: Host 헤더가 이 주소일 때만 받는다.
const allowedHosts = [`${HOST}:${PORT}`, `localhost:${PORT}`];

const jsonError = (code: number, message: string) =>
  JSON.stringify({ jsonrpc: "2.0", error: { code, message }, id: null });

const http = createHttpServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  if (pathname !== PATH) {
    res.writeHead(404, { "content-type": "application/json" }).end(jsonError(-32000, `MCP 주소는 ${PATH}입니다.`));
    return;
  }
  // 세션이 없으니 서버가 먼저 보내는 GET 스트림과 세션 종료(DELETE)는 받지 않는다.
  if (req.method !== "POST") {
    res.writeHead(405, { "content-type": "application/json", allow: "POST" }).end(jsonError(-32000, "POST만 받습니다."));
    return;
  }
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
    enableDnsRebindingProtection: true,
    allowedHosts,
  });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (err) {
    console.error(`MCP 요청 처리 실패: ${err instanceof Error ? err.message : err}`);
    if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" }).end(jsonError(-32603, "서버 내부 오류"));
  }
});

http.listen(PORT, HOST, () => {
  console.error(`seoul-live-3d MCP 서버 시작(HTTP http://${HOST}:${PORT}${PATH}, ${month}, ${rows.length}행)`);
});

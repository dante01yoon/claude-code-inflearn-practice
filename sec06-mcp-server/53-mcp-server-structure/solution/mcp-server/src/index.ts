// 「서울 라이브 3D」 MCP 서버(stdio). 도구·리소스는 server.ts에 있다.
// stdout은 MCP 메시지 전용이라 로그는 console.error로만 남긴다.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer, month, rows } from "./server.ts";

await createServer().connect(new StdioServerTransport());
console.error(`seoul-live-3d MCP 서버 시작(stdio, ${month}, ${rows.length}행)`);

// 개발 서버: 저장소 파일을 그대로 내보내고, /api/trains로 실시간 열차 위치를 대신 받아 준다.
// 실시간 지하철 인증키는 이 서버만 읽는다(.env의 SEOUL_REALTIME_KEY). 브라우저로 가는 응답에는 키가 들어가지 않는다.
//
//   npm start   →  http://127.0.0.1:8000
//
// .env, .git처럼 점으로 시작하는 경로는 내보내지 않는다.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createTrainsSource } from "./realtime-trains.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT ?? 8000);
const HOST = "127.0.0.1";

try {
  process.loadEnvFile(join(ROOT, ".env"));
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}
const { isSample, trains, scrub } = createTrainsSource(process.env.SEOUL_REALTIME_KEY);
if (isSample) console.warn("SEOUL_REALTIME_KEY가 없어 공개 sample 키를 씁니다. 노선마다 열차 5대까지만 받습니다.");

// ---- 정적 파일 ----

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".csv": "text/csv",
  ".md": "text/markdown; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
};

async function serveFile(pathname, res) {
  const rel = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, "");
  // 점으로 시작하는 경로(.env, .git, .claude)와 저장소 밖은 막는다.
  if (rel.split(sep).some((part) => part.startsWith(".")) || !join(ROOT, rel).startsWith(ROOT)) {
    res.writeHead(404).end("Not Found");
    return;
  }
  let file = join(ROOT, rel);
  if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, "index.html");
  const body = await readFile(file).catch(() => null);
  if (!body) {
    res.writeHead(404).end("Not Found");
    return;
  }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-cache" });
  res.end(body);
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${HOST}`);
  try {
    if (pathname === "/api/trains") {
      const data = await trains();
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify(data));
    } else if (req.method === "GET" || req.method === "HEAD") {
      await serveFile(pathname, res);
    } else {
      res.writeHead(405).end();
    }
  } catch (err) {
    console.error(scrub(err.stack ?? err));
    if (!res.headersSent) res.writeHead(500).end("Server Error");
  }
}).listen(PORT, HOST, () => console.log(`http://${HOST}:${PORT}`));

// 개발 서버: 저장소 파일을 그대로 내보내고, /api/trains로 실시간 열차 위치를, /api/citydata로 실시간 도시데이터를 대신 받아 준다.
// /api/crowd-history?code=POI009는 Supabase에 쌓인 장소별 붐빔 기록(최근 24시간)을 읽어 준다(npm run collect가 쌓는다).
// /api/config는 로그인·즐겨찾기에 쓸 Supabase 주소와 publishable 키를 알려 준다(브라우저에 공개하도록 만든 키, 권한은 RLS가 막는다).
// 인증키는 이 서버만 읽는다(.env의 SEOUL_REALTIME_KEY: 실시간 지하철, SEOUL_OPENAPI_KEY: 일반 인증키). 브라우저로 가는 응답에는 키가 들어가지 않는다.
//
//   npm start   →  http://127.0.0.1:8000
//
// .env, .git처럼 점으로 시작하는 경로는 내보내지 않는다.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createTrainsSource } from "./realtime-trains.mjs";
import { createCitydataSource } from "./realtime-citydata.mjs";
import { createCrowdHistory, isPlaceCode } from "./citydata-store.mjs";

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
const city = createCitydataSource(process.env.SEOUL_OPENAPI_KEY);
if (city.isSample) console.warn("SEOUL_OPENAPI_KEY가 없어 공개 sample 키를 씁니다. 실시간 도시데이터는 광화문·덕수궁 1곳만 받습니다.");
const crowd = createCrowdHistory({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_PUBLISHABLE_KEY });
if (!crowd.configured) console.warn("SUPABASE_URL·SUPABASE_PUBLISHABLE_KEY가 없어 장소별 붐빔 기록(/api/crowd-history)을 보여 주지 않습니다.");

// ---- 정적 파일 ----

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".csv": "text/csv",
  ".md": "text/markdown; charset=utf-8", ".zip": "application/zip", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
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
    if (pathname === "/api/trains" || pathname === "/api/citydata") {
      const data = await (pathname === "/api/trains" ? trains() : city.citydata());
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify(data));
    } else if (pathname === "/api/config") {
      const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
      res.writeHead(configured ? 200 : 503, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify(configured
        ? { supabaseUrl: process.env.SUPABASE_URL, supabaseKey: process.env.SUPABASE_PUBLISHABLE_KEY }
        : { error: "로그인 DB가 설정되지 않았습니다" }));
    } else if (pathname === "/api/crowd-history") {
      const code = new URL(req.url, `http://${HOST}`).searchParams.get("code");
      const [status, data] = !crowd.configured ? [503, { error: "붐빔 기록 DB가 설정되지 않았습니다" }]
        : !isPlaceCode(code) ? [400, { error: "장소 코드가 아닙니다" }]
        : [200, await crowd.history(code)];
      res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify(data));
    } else if (req.method === "GET" || req.method === "HEAD") {
      await serveFile(pathname, res);
    } else {
      res.writeHead(405).end();
    }
  } catch (err) {
    console.error(city.scrub(scrub(err.stack ?? err)));
    if (!res.headersSent) res.writeHead(500).end("Server Error");
  }
}).listen(PORT, HOST, () => console.log(`http://${HOST}:${PORT}`));

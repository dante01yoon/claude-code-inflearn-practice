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
import { REALTIME_LINES } from "./train-positions.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT ?? 8000);
const HOST = "127.0.0.1";

try {
  process.loadEnvFile(join(ROOT, ".env"));
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}
const KEY = process.env.SEOUL_REALTIME_KEY || "sample";
const IS_SAMPLE = KEY === "sample";
if (IS_SAMPLE) console.warn("SEOUL_REALTIME_KEY가 없어 공개 sample 키를 씁니다. 노선마다 열차 5대까지만 받습니다.");

// ---- 실시간 열차 위치 ----

// 여러 사람이 열어도 위 API는 이 간격에 한 번만 부른다(노선마다 1회).
const CACHE_MS = 20_000;
const ROWS = IS_SAMPLE ? 5 : 500; // sample 키는 0–5행만 받을 수 있다
const FIELDS = ["subwayNm", "trainNo", "statnNm", "statnTnm", "updnLine", "trainSttus", "directAt", "lstcarAt", "recptnDt"];

// 오류 문구에 요청 주소(=키)가 섞여 나가지 않게 한다.
const scrub = (s) => String(s).replaceAll(KEY, "***").replaceAll(encodeURIComponent(KEY), "***");

async function fetchLine(line) {
  const url = `http://swopenapi.seoul.go.kr/api/subway/${encodeURIComponent(KEY)}/json/realtimePosition/0/${ROWS}/${encodeURIComponent(line)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  const info = body.errorMessage ?? body;
  if (info.code === "INFO-200") return []; // 지금 다니는 열차가 없다(심야 등)
  if (info.code !== "INFO-000") throw new Error(`${info.code} ${info.message}`);
  return (body.realtimePositionList ?? []).map((t) => Object.fromEntries(FIELDS.map((k) => [k, t[k]])));
}

let cache = null; // { at, promise }
function trains() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.promise;
  const promise = Promise.allSettled(REALTIME_LINES.map(fetchLine)).then((results) => {
    const out = { updatedAt: new Date().toISOString(), sample: IS_SAMPLE, trains: [], errors: [] };
    results.forEach((r, i) => {
      if (r.status === "fulfilled") out.trains.push(...r.value);
      else out.errors.push({ line: REALTIME_LINES[i], message: scrub(r.reason?.message ?? r.reason) });
    });
    if (out.errors.length) console.warn("실시간 열차 위치 오류", out.errors);
    return out;
  });
  cache = { at: Date.now(), promise };
  return promise;
}

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

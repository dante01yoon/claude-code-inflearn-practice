// Claude Code 사용량 대시보드: OpenTelemetry(OTLP http/json)로 받은 토큰·비용을 모아 화면에 보여 준다.
// 받는 곳과 화면이 같은 주소다: http://127.0.0.1:18972 (POST /v1/metrics, /v1/logs, 화면은 /)
//
//   node tools/otel-view.mjs
//
// Claude Code 쪽 환경 변수:
//   CLAUDE_CODE_ENABLE_TELEMETRY=1
//   OTEL_METRICS_EXPORTER=otlp
//   OTEL_LOGS_EXPORTER=otlp
//   OTEL_EXPORTER_OTLP_PROTOCOL=http/json
//   OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:18972
//   OTEL_METRIC_EXPORT_INTERVAL=10000   (선택, 기본 60초)
//
// 계정 정보(user.email, user.account_uuid, organization.id, user.id 등)는 받아도 버린다.
// 속성은 KEEP_ATTRS에 적은 것만 남기고(허용 목록), 리소스 속성은 아예 읽지 않는다. 모은 값은 메모리에만 있다.

import { createServer } from "node:http";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const PORT = 18972;
const MAX_BODY = 8 * 1024 * 1024;
const RECENT_LIMIT = 50;

// 남기는 속성. 여기에 없는 키(계정·조직·기기 ID 포함)는 읽자마자 버린다.
export const KEEP_ATTRS = ["model", "type", "session.id"];
// api_request 이벤트에서 남기는 필드
const EVENT_FIELDS = ["model", "input_tokens", "output_tokens", "cache_read_tokens", "cache_creation_tokens", "cost_usd", "duration_ms"];

const TOKEN_METRIC = "claude_code.token.usage";
const COST_METRIC = "claude_code.cost.usage";
const CUMULATIVE = 2; // AggregationTemporality

// OTLP JSON AnyValue → JS 값
function anyValue(v) {
  if (!v || typeof v !== "object") return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("intValue" in v) return Number(v.intValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("boolValue" in v) return v.boolValue;
  return undefined;
}

// 속성 목록에서 keep에 있는 키만 꺼낸다
export function pickAttrs(list, keep = KEEP_ATTRS) {
  const out = {};
  for (const a of list ?? []) if (keep.includes(a?.key)) out[a.key] = anyValue(a.value);
  return out;
}

const pointValue = (p) => Number(p.asDouble ?? p.asInt ?? 0);
const nanoToMs = (n) => (n ? Math.floor(Number(BigInt(n) / 1000000n)) : Date.now());

export function createUsageStore() {
  const tokens = new Map(); // `${model}\t${session}\t${type}` → 개수
  const cost = new Map(); // `${model}\t${session}` → USD
  const lastSeen = new Map(); // session → ms
  const cumulative = new Map(); // 누적 방식 계열의 지난 값
  const recent = [];
  const received = { metrics: 0, logs: 0, lastAt: null };

  const add = (map, key, v) => map.set(key, (map.get(key) ?? 0) + v);

  // 누적(cumulative)이면 지난 값과의 차이만, 델타면 그대로 더한다
  function delta(seriesKey, p, temporality) {
    const v = pointValue(p);
    if (temporality !== CUMULATIVE) return v;
    const key = `${seriesKey}\t${p.startTimeUnixNano ?? ""}`;
    const prev = cumulative.get(key) ?? 0;
    cumulative.set(key, v);
    return v >= prev ? v - prev : v; // 줄었으면 다시 시작한 것
  }

  function addMetrics(body) {
    for (const rm of body?.resourceMetrics ?? [])
      for (const sm of rm.scopeMetrics ?? [])
        for (const m of sm.metrics ?? []) {
          if (m.name !== TOKEN_METRIC && m.name !== COST_METRIC) continue;
          const data = m.sum ?? m.gauge;
          for (const p of data?.dataPoints ?? []) {
            const at = pickAttrs(p.attributes);
            const model = at.model ?? "(모름)";
            const session = at["session.id"] ?? "(없음)";
            const type = at.type ?? "(모름)";
            const ms = nanoToMs(p.timeUnixNano);
            lastSeen.set(session, Math.max(lastSeen.get(session) ?? 0, ms));
            if (m.name === TOKEN_METRIC) {
              const key = `${model}\t${session}\t${type}`;
              add(tokens, key, delta(`t\t${key}`, p, data.aggregationTemporality));
            } else {
              const key = `${model}\t${session}`;
              add(cost, key, delta(`c\t${key}`, p, data.aggregationTemporality));
            }
          }
        }
    received.metrics++;
    received.lastAt = Date.now();
  }

  function addLogs(body) {
    for (const rl of body?.resourceLogs ?? [])
      for (const sl of rl.scopeLogs ?? [])
        for (const r of sl.logRecords ?? []) {
          const name = pickAttrs(r.attributes, ["event.name"])["event.name"] ?? anyValue(r.body);
          if (name !== "api_request" && name !== "claude_code.api_request") continue;
          const at = pickAttrs(r.attributes, EVENT_FIELDS);
          recent.unshift({
            time: nanoToMs(r.timeUnixNano || r.observedTimeUnixNano),
            model: at.model ?? "(모름)",
            input: Number(at.input_tokens ?? 0),
            output: Number(at.output_tokens ?? 0),
            cacheRead: Number(at.cache_read_tokens ?? 0),
            cacheCreation: Number(at.cache_creation_tokens ?? 0),
            cost: Number(at.cost_usd ?? 0),
            durationMs: Number(at.duration_ms ?? 0),
          });
        }
    recent.sort((a, b) => b.time - a.time);
    recent.length = Math.min(recent.length, RECENT_LIMIT);
    received.logs++;
    received.lastAt = Date.now();
  }

  function summary() {
    const totals = { cost: 0, tokens: {} };
    const models = new Map();
    const sessions = new Map();
    const row = (map, k, extra) => map.get(k) ?? map.set(k, { ...extra, cost: 0, tokens: {} }).get(k);
    for (const [key, n] of tokens) {
      const [model, session, type] = key.split("\t");
      for (const t of [totals, row(models, model, { model }), row(sessions, session, { session })])
        t.tokens[type] = (t.tokens[type] ?? 0) + n;
    }
    for (const [key, usd] of cost) {
      const [model, session] = key.split("\t");
      for (const t of [totals, row(models, model, { model }), row(sessions, session, { session })]) t.cost += usd;
    }
    for (const s of sessions.values()) s.lastSeen = lastSeen.get(s.session) ?? null;
    return {
      totals,
      byModel: [...models.values()].sort((a, b) => b.cost - a.cost),
      bySession: [...sessions.values()].sort((a, b) => (b.lastSeen ?? 0) - (a.lastSeen ?? 0)),
      recent: [...recent],
      received: { ...received },
    };
  }

  return { addMetrics, addLogs, summary };
}

// ---- 화면 ----

const PAGE = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Claude Code 사용량</title>
<style>
  :root { color-scheme: light dark; --muted: #888; --line: #8884; --accent: #d97757; }
  body { font: 14px/1.5 system-ui, sans-serif; margin: 24px; max-width: 1100px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 28px 0 8px; }
  .muted { color: var(--muted); }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 16px; }
  .card { border: 1px solid var(--line); border-radius: 8px; padding: 12px; }
  .card b { display: block; font-size: 22px; font-variant-numeric: tabular-nums; }
  .card.cost b { color: var(--accent); }
  table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
  th, td { padding: 6px 8px; border-bottom: 1px solid var(--line); text-align: right; white-space: nowrap; }
  th:first-child, td:first-child { text-align: left; }
  th { font-weight: 600; color: var(--muted); }
  .empty { color: var(--muted); padding: 12px 0; }
</style>
</head>
<body>
<h1>Claude Code 사용량</h1>
<div class="muted" id="status">받은 데이터 없음</div>
<div class="cards" id="cards"></div>
<h2>모델별</h2><div id="models"></div>
<h2>세션별</h2><div id="sessions"></div>
<h2>최근 API 요청</h2><div id="recent"></div>
<script>
const TYPES = [["input", "입력"], ["output", "출력"], ["cacheRead", "캐시 읽기"], ["cacheCreation", "캐시 쓰기"]];
const num = (n) => Math.round(n ?? 0).toLocaleString("ko-KR");
const usd = (n) => "$" + (n ?? 0).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const time = (ms) => ms ? new Date(ms).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour12: false }) : "-";
const sumTokens = (t) => Object.values(t).reduce((a, b) => a + b, 0);

function el(tag, text, cls) {
  const e = document.createElement(tag);
  if (text != null) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

function table(target, head, rows) {
  const box = document.getElementById(target);
  box.replaceChildren();
  if (!rows.length) { box.append(el("div", "아직 없음", "empty")); return; }
  const t = el("table"), tr = el("tr");
  for (const h of head) tr.append(el("th", h));
  t.append(tr);
  for (const r of rows) {
    const row = el("tr");
    for (const c of r) row.append(el("td", c));
    t.append(row);
  }
  box.append(t);
}

function render(s) {
  const r = s.received;
  document.getElementById("status").textContent = r.lastAt
    ? "마지막으로 받은 시각 " + time(r.lastAt) + " · 지표 " + num(r.metrics) + "번 · 로그 " + num(r.logs) + "번"
    : "받은 데이터 없음 — Claude Code에 OTEL 환경 변수를 설정하세요";

  const cards = document.getElementById("cards");
  cards.replaceChildren();
  const card = (label, value, cls) => { const c = el("div", null, "card " + (cls ?? "")); c.append(el("span", label, "muted"), el("b", value)); cards.append(c); };
  card("비용", usd(s.totals.cost), "cost");
  card("토큰 합계", num(sumTokens(s.totals.tokens)));
  for (const [k, label] of TYPES) card(label, num(s.totals.tokens[k]));

  const tokenCols = (t) => [...TYPES.map(([k]) => num(t[k])), num(sumTokens(t))];
  const tokenHead = [...TYPES.map(([, l]) => l), "합계"];
  table("models", ["모델", ...tokenHead, "비용"], s.byModel.map((m) => [m.model, ...tokenCols(m.tokens), usd(m.cost)]));
  table("sessions", ["세션", "마지막", ...tokenHead, "비용"],
    s.bySession.map((x) => [x.session.slice(0, 8), time(x.lastSeen), ...tokenCols(x.tokens), usd(x.cost)]));
  table("recent", ["시각", "모델", "입력", "출력", "캐시 읽기", "캐시 쓰기", "비용", "걸린 시간(초)"],
    s.recent.map((x) => [time(x.time), x.model, num(x.input), num(x.output), num(x.cacheRead), num(x.cacheCreation), usd(x.cost),
      (x.durationMs / 1000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })]));
}

async function refresh() {
  try {
    const res = await fetch("/api/summary");
    if (res.ok) render(await res.json());
  } catch {}
}
refresh();
setInterval(refresh, 5000);
</script>
</body>
</html>`;

// ---- 서버 ----

const allowedHosts = [`${HOST}:${PORT}`, `localhost:${PORT}`];

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error("본문이 너무 큽니다"), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function createOtelServer(store = createUsageStore()) {
  return createServer(async (req, res) => {
    const send = (status, type, body) => res.writeHead(status, { "content-type": type }).end(body);
    const json = (status, obj) => send(status, "application/json", JSON.stringify(obj));
    if (!allowedHosts.includes(req.headers.host)) return json(403, { error: "허용하지 않는 Host" });
    const { pathname } = new URL(req.url ?? "/", "http://localhost");

    if (req.method === "GET" && pathname === "/") return send(200, "text/html; charset=utf-8", PAGE);
    if (req.method === "GET" && pathname === "/api/summary") return json(200, store.summary());

    const handler = { "/v1/metrics": store.addMetrics, "/v1/logs": store.addLogs, "/v1/traces": () => {} }[pathname];
    if (!handler) return json(404, { error: "없는 주소" });
    if (req.method !== "POST") return json(405, { error: "POST만 받습니다" });
    if (!String(req.headers["content-type"] ?? "").includes("application/json"))
      return json(415, { error: "OTLP http/json만 받습니다(OTEL_EXPORTER_OTLP_PROTOCOL=http/json)" });
    try {
      let buf = await readBody(req);
      if (req.headers["content-encoding"] === "gzip") buf = gunzipSync(buf);
      handler(JSON.parse(buf.toString("utf8")));
      json(200, {});
    } catch (err) {
      // 본문은 출력하지 않는다(계정 정보가 들어 있다).
      console.error(`${pathname} 처리 실패: ${err instanceof SyntaxError ? "JSON 형식 오류" : err.message}`);
      json(err.status ?? 400, { error: "처리하지 못했습니다" });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createOtelServer().listen(PORT, HOST, () => console.log(`Claude Code 사용량 대시보드: http://${HOST}:${PORT}`));
}

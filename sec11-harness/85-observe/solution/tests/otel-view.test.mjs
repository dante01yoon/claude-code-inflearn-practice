import { test } from "node:test";
import assert from "node:assert/strict";
import { request } from "node:http";
import { createUsageStore, createOtelServer } from "../tools/otel-view.mjs";

// fetch는 Host 헤더를 바꿀 수 없어서 node:http로 보낸다
function call(port, path, { method = "GET", host = "127.0.0.1:18972", body } = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port, path, method, headers: { host, "content-type": "application/json" } }, (res) => {
      let text = "";
      res.on("data", (c) => (text += c));
      res.on("end", () => resolve({ status: res.statusCode, text }));
    });
    req.on("error", reject);
    req.end(body);
  });
}

const s = (key, v) => ({ key, value: { stringValue: v } });
const ACCOUNT = [s("user.email", "someone@example.com"), s("user.account_uuid", "acc-uuid-1"), s("organization.id", "org-id-1"), s("user.id", "device-id-1")];
const SECRETS = ["someone@example.com", "acc-uuid-1", "org-id-1", "device-id-1"];

const point = (attrs, value, time = "1760000000000000000") => ({ attributes: [...ACCOUNT, ...attrs], asDouble: value, startTimeUnixNano: "1759999990000000000", timeUnixNano: time });
const metrics = (temporality, tokenValue, costValue, time) => ({
  resourceMetrics: [{
    resource: { attributes: [s("service.name", "claude-code"), ...ACCOUNT] },
    scopeMetrics: [{ metrics: [
      { name: "claude_code.token.usage", sum: { aggregationTemporality: temporality, dataPoints: [
        point([s("model", "claude-opus-5-5"), s("type", "input"), s("session.id", "sess-a")], tokenValue, time),
        point([s("model", "claude-opus-5-5"), s("type", "output"), s("session.id", "sess-a")], tokenValue / 10, time),
      ] } },
      { name: "claude_code.cost.usage", sum: { aggregationTemporality: temporality, dataPoints: [
        point([s("model", "claude-opus-5-5"), s("session.id", "sess-a")], costValue, time),
      ] } },
      { name: "claude_code.session.count", sum: { dataPoints: [point([], 1)] } },
    ] }],
  }],
});
const logs = {
  resourceLogs: [{ resource: { attributes: ACCOUNT }, scopeLogs: [{ logRecords: [{
    timeUnixNano: "1760000000000000000",
    body: { stringValue: "claude_code.api_request" },
    attributes: [...ACCOUNT, s("event.name", "api_request"), s("model", "claude-opus-5-5"), s("input_tokens", "1200"),
      s("output_tokens", "300"), s("cache_read_tokens", "5000"), s("cache_creation_tokens", "0"), s("cost_usd", "0.042"), s("duration_ms", "2100")],
  }] }] }],
};

test("델타 지표는 그대로 더하고, 모델·세션·종류별로 나눈다", () => {
  const store = createUsageStore();
  store.addMetrics(metrics(1, 1000, 0.1));
  store.addMetrics(metrics(1, 500, 0.05));
  const { totals, byModel, bySession } = store.summary();
  assert.deepEqual(totals.tokens, { input: 1500, output: 150 });
  assert.ok(Math.abs(totals.cost - 0.15) < 1e-9);
  assert.equal(byModel[0].model, "claude-opus-5-5");
  assert.equal(bySession[0].session, "sess-a");
});

test("누적 지표는 지난 값과의 차이만 더한다", () => {
  const store = createUsageStore();
  store.addMetrics(metrics(2, 1000, 0.1));
  store.addMetrics(metrics(2, 1500, 0.15, "1760000010000000000"));
  const { totals } = store.summary();
  assert.equal(totals.tokens.input, 1500);
  assert.ok(Math.abs(totals.cost - 0.15) < 1e-9);
});

test("api_request 이벤트는 최근 요청 목록에 숫자로 들어간다", () => {
  const store = createUsageStore();
  store.addLogs(logs);
  const [r] = store.summary().recent;
  assert.deepEqual(r, { time: 1760000000000, model: "claude-opus-5-5", input: 1200, output: 300, cacheRead: 5000, cacheCreation: 0, cost: 0.042, durationMs: 2100 });
});

test("계정 정보는 요약에도, 서버 응답에도 없다", async () => {
  const server = createOtelServer().listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const { port } = server.address();
  try {
    for (const [path, body] of [["/v1/metrics", metrics(1, 1000, 0.1)], ["/v1/logs", logs]]) {
      const res = await call(port, path, { method: "POST", body: JSON.stringify(body) });
      assert.equal(res.status, 200);
    }
    const { text } = await call(port, "/api/summary");
    for (const secret of SECRETS) assert.ok(!text.includes(secret), `${secret}가 응답에 있다`);
    assert.ok(text.includes("claude-opus-5-5"));
    assert.equal((await call(port, "/", { host: "evil.example:18972" })).status, 403);
  } finally {
    server.close();
  }
});

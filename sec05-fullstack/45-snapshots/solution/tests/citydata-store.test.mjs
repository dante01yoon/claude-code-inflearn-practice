import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createCrowdHistory, createCrowdStore, isPlaceCode, kstToIso, toPlaceRows, toSnapshotRows } from "../citydata-store.mjs";

const area = (code, now, message = "크게 붐비지는 않아요.") => ({ code, name: code, message, now, forecast: [] });

test("PPLTN_TIME(KST)을 +09:00 시각으로 바꾼다", () => {
  assert.equal(kstToIso("2026-10-12 13:40"), "2026-10-12T13:40:00+09:00");
  assert.equal(kstToIso("2026-10-12 13:40:05"), "2026-10-12T13:40:05+09:00");
  assert.equal(Date.parse(kstToIso("2026-10-12 00:05")), Date.parse("2026-10-11T15:05:00Z"));
  for (const bad of [undefined, null, "", "2026/10/12 13:40", "13:40"]) assert.equal(kstToIso(bad), null);
});

test("영역 장소를 places 행으로 바꾼다", () => {
  assert.deepEqual(toPlaceRows([{ code: "POI009", name: "광화문·덕수궁", category: "고궁·문화유산", polygons: [] }]),
    [{ code: "POI009", name: "광화문·덕수궁", category: "고궁·문화유산" }]);
});

test("테이블 check에 걸릴 값은 빼고 crowd_snapshots 행으로 바꾼다", () => {
  const { rows, skipped } = toSnapshotRows([
    area("POI009", { time: "2026-10-12 13:40", level: "보통", min: 44000, max: 46000 }),
    area("POI001", { time: "2026-10-12 13:40", level: "정보없음", min: 1, max: 2 }),
    area("POI002", { time: "", level: "여유", min: 1, max: 2 }),
    area("POI003", { time: "2026-10-12 13:40", level: "붐빔", min: 5, max: 1 }),
    area("POI004", { time: "2026-10-12 13:40", level: "여유", min: null, max: null }, null),
  ]);
  assert.deepEqual(rows, [
    { place_code: "POI009", observed_at: "2026-10-12T13:40:00+09:00", congest_level: "보통", population_min: 44000, population_max: 46000, message: "크게 붐비지는 않아요." },
    { place_code: "POI004", observed_at: "2026-10-12T13:40:00+09:00", congest_level: "여유", population_min: null, population_max: null, message: null },
  ]);
  assert.deepEqual(skipped.map((s) => s.code), ["POI001", "POI002", "POI003"]);
});

const realFetch = globalThis.fetch;
afterEach(() => (globalThis.fetch = realFetch));

test("PostgREST에 upsert하고, 이미 있는 시각은 건너뛰게 묻는다", async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return Response.json(JSON.parse(init.body).slice(0, 1));
  };
  const store = createCrowdStore({ url: "http://127.0.0.1:54421/", serviceKey: "secret-key" });
  const { rows } = toSnapshotRows([
    area("POI009", { time: "2026-10-12 13:40", level: "보통", min: 1, max: 2 }),
    area("POI010", { time: "2026-10-12 13:40", level: "여유", min: 1, max: 2 }),
  ]);
  assert.equal(await store.saveSnapshots(rows), 1);
  assert.equal(await store.saveSnapshots([]), 0);
  assert.equal(calls.length, 1);
  const [{ url, init }] = calls;
  assert.equal(url, "http://127.0.0.1:54421/rest/v1/crowd_snapshots?on_conflict=place_code,observed_at&select=place_code");
  assert.equal(init.method, "POST");
  assert.equal(init.headers.apikey, "secret-key");
  assert.match(init.headers.Prefer, /resolution=ignore-duplicates/);

  await store.savePlaces([{ code: "POI009", name: "광화문·덕수궁", category: "고궁·문화유산" }]);
  assert.match(calls[1].url, /\/places\?on_conflict=code/);
  assert.match(calls[1].init.headers.Prefer, /resolution=merge-duplicates/);
});

test("저장에 실패하면 키 없이 상태와 응답을 알린다", async () => {
  globalThis.fetch = async () => new Response('{"message":"violates foreign key constraint"}', { status: 409 });
  const store = createCrowdStore({ url: "http://127.0.0.1:54421", serviceKey: "secret-key" });
  await assert.rejects(store.saveSnapshots([{ place_code: "POI999" }]), (err) => {
    assert.match(err.message, /HTTP 409.*foreign key/);
    assert.ok(!err.message.includes("secret-key"));
    return true;
  });
  assert.throws(() => createCrowdStore({ url: "", serviceKey: "x" }), /SUPABASE_URL/);
});

test("장소 하나의 최근 기록을 시각 순서로 읽고 잠깐 캐시한다", async () => {
  const urls = [];
  globalThis.fetch = async (url, init) => {
    urls.push(url);
    assert.equal(init.headers.apikey, "publishable-key");
    return Response.json([
      { observed_at: "2026-10-12T05:00:00+00:00", congest_level: "여유", population_min: 1000, population_max: 1500 },
      { observed_at: "2026-10-12T05:05:00+00:00", congest_level: "보통", population_min: 2000, population_max: 2500 },
    ]);
  };
  const { configured, history } = createCrowdHistory({ url: "http://127.0.0.1:54421", key: "publishable-key" });
  assert.ok(configured);
  const out = await history("POI009");
  assert.deepEqual(out.points[1], { time: "2026-10-12T05:05:00+00:00", level: "보통", min: 2000, max: 2500 });
  assert.equal(Date.parse(out.to) - Date.parse(out.from), 24 * 3600_000);
  const q = new URL(urls[0]).searchParams;
  assert.equal(q.get("place_code"), "eq.POI009");
  assert.equal(q.get("order"), "observed_at.asc");
  assert.equal(q.get("observed_at"), `gte.${out.from}`);
  assert.equal(await history("POI009"), out);
  assert.equal(urls.length, 1);
});

test("장소 코드가 아니거나 설정이 없으면 묻지 않는다", () => {
  globalThis.fetch = async () => assert.fail("물었다");
  for (const bad of ["POI9", "poi009", "POI009&select=*", null]) assert.equal(isPlaceCode(bad), false);
  const { history } = createCrowdHistory({ url: "http://127.0.0.1:54421", key: "k" });
  assert.throws(() => history("POI009,POI010"), /장소 코드/);
  const off = createCrowdHistory({ url: "", key: "" });
  assert.equal(off.configured, false);
  assert.throws(() => off.history("POI009"), /SUPABASE_URL/);
});

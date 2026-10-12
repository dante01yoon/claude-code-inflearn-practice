import assert from "node:assert/strict";
import { test } from "node:test";
import { kstDate, parseClaudeResult, reportFacts, reportPrompt, upsertIndex } from "../daily-report.mjs";
import { toBikeStation } from "../realtime-bikes.mjs";

const area = (code, level, min, max, forecast = []) => ({ code, name: `장소${code}`, now: { time: "2026-10-12 08:00", level, min, max }, forecast });

test("KST 날짜와 요일", () => {
  assert.deepEqual(kstDate(new Date("2026-10-11T23:30:00Z")), { date: "2026-10-12", weekday: "월" });
  assert.deepEqual(kstDate(new Date("2026-10-11T14:59:00Z")), { date: "2026-10-11", weekday: "일" });
});

test("장소 혼잡도를 단계별로 세고, 붐비는 순·여유로운 순·오를 곳을 고른다", () => {
  const citydata = {
    sample: false,
    areas: [
      area("POI001", "여유", 1000, 1500),
      area("POI002", "붐빔", 30000, 32000),
      area("POI003", "약간 붐빔", 50000, 52000, [{ time: "2026-10-12 12:00", level: "붐빔" }, { time: "2026-10-12 13:00", level: "붐빔" }]),
      area("POI004", "보통", 8000, 9000, [{ time: "2026-10-12 18:00", level: "약간 붐빔" }]),
      area("POI005", "정보없음", null, null),
    ],
    errors: [{ code: "POI006", message: "HTTP 500" }],
  };
  const categories = new Map([["POI001", "공원"], ["POI002", "인구밀집지역"], ["POI003", "인구밀집지역"], ["POI004", "공원"]]);
  const { places } = reportFacts({ citydata, categories, bikes: { error: "x" }, now: new Date("2026-10-11T23:00:00Z") });

  assert.equal(places.received, 5);
  assert.equal(places.failed, 1);
  assert.deepEqual(places.levels, { 여유: 1, 보통: 1, "약간 붐빔": 1, 붐빔: 1 });
  assert.deepEqual(places.byCategory, [
    { category: "인구밀집지역", count: 2, crowded: 2 },
    { category: "공원", count: 2, crowded: 0 },
  ]);
  // 단계가 먼저, 같은 단계 안에서는 인구 순. 정보없음은 뺀다.
  assert.deepEqual(places.mostCrowded.map((p) => p.name), ["장소POI002", "장소POI003", "장소POI004", "장소POI001"]);
  assert.deepEqual(places.mostCrowded[0], { name: "장소POI002", category: "인구밀집지역", level: "붐빔", population: { min: 30000, max: 32000 }, time: "2026-10-12 08:00" });
  assert.equal(places.calmest[0].name, "장소POI001");
  // 가장 높은 단계가 처음 되는 시각.
  assert.deepEqual(places.rising, [
    { name: "장소POI003", now: "약간 붐빔", peak: "붐빔", peakTime: "2026-10-12 12:00" },
    { name: "장소POI004", now: "보통", peak: "약간 붐빔", peakTime: "2026-10-12 18:00" },
  ]);
});

test("따릉이 대여소 현황을 합치고 빈 곳·몰린 곳을 센다", () => {
  const row = (id, bikes, racks, shared) => toBikeStation({ stationId: id, stationName: ` ${id}. 대여소 `, parkingBikeTotCnt: String(bikes), rackTotCnt: String(racks), shared: String(shared), stationLatitude: "37.5", stationLongitude: "127" });
  assert.equal(row("ST-1", 0, 10, 0).name, "ST-1. 대여소");
  const stations = [row("ST-1", 0, 10, 0), row("ST-2", 2, 10, 20), row("ST-3", 15, 10, 150), row("ST-4", 10, 10, 100), row("ST-5", 5, 10, 50)];
  const { bikes } = reportFacts({ citydata: { error: "x" }, bikes: { sample: false, stations } });
  assert.equal(bikes.stations, 5);
  assert.equal(bikes.bikes, 32);
  assert.equal(bikes.racks, 50);
  assert.equal(bikes.empty, 1);
  assert.equal(bikes.low, 1);
  assert.equal(bikes.full, 2);
  assert.deepEqual(bikes.fullest.map((s) => s.shared), [150, 100, 50, 20, 0]);
});

test("받지 못한 데이터는 error로 남기고 프롬프트에 날짜와 사실을 넣는다", () => {
  const facts = reportFacts({ citydata: { error: "HTTP 500" }, bikes: null, now: new Date("2026-10-11T23:00:00Z") });
  assert.deepEqual(facts.places, { error: "HTTP 500" });
  assert.deepEqual(facts.bikes, { error: "받지 못함" });
  const prompt = reportPrompt(facts);
  assert.match(prompt, /2026-10-12\(월\)/);
  assert.ok(prompt.endsWith(JSON.stringify(facts)));
});

test("claude -p JSON 결과에서 structured_output을 꺼낸다", () => {
  const summary = { headline: "h", overview: "o", crowd: { summary: "c", hotspots: [] }, bike: { summary: "b", notes: [] }, tips: [] };
  const ok = JSON.stringify({ type: "result", subtype: "success", is_error: false, structured_output: summary, total_cost_usd: 0.01, modelUsage: { "claude-opus-5-5": {} } });
  assert.deepEqual(parseClaudeResult(ok), { summary, model: "claude-opus-5-5", costUsd: 0.01 });
  assert.throws(() => parseClaudeResult(JSON.stringify({ subtype: "error_max_turns", is_error: true })), /claude 실행 실패/);
  assert.throws(() => parseClaudeResult(JSON.stringify({ subtype: "success", is_error: false, result: "글" })), /structured_output/);
  assert.throws(() => parseClaudeResult("not json"));
});

test("목록은 같은 날짜를 바꾸고 최근 날짜가 앞에 온다", () => {
  const r = (date, headline) => ({ date, weekday: "월", generatedAt: `${date}T00:00:00Z`, summary: headline ? { headline } : null });
  let index = upsertIndex([], r("2026-10-11", "어제"));
  index = upsertIndex(index, r("2026-10-12", "오늘"));
  index = upsertIndex(index, r("2026-10-12", null));
  assert.deepEqual(index.map((e) => [e.date, e.headline]), [["2026-10-12", null], ["2026-10-11", "어제"]]);
});

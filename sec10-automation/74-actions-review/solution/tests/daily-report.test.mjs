import assert from "node:assert/strict";
import { test } from "node:test";
import { kstDate, parseClaudeResult, previousDate, reportDiff, reportFacts, reportPrompt, upsertIndex } from "../daily-report.mjs";
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

test("지난 리포트는 그 날짜보다 앞선 가장 최근 날짜", () => {
  const index = [{ date: "2026-10-13" }, { date: "2026-10-12" }, { date: "2026-10-09" }];
  assert.equal(previousDate(index, "2026-10-13"), "2026-10-12");
  assert.equal(previousDate(index, "2026-10-14"), "2026-10-13");
  assert.equal(previousDate(index, "2026-10-09"), null);
  assert.equal(previousDate([], "2026-10-13"), null);
});

test("지난 리포트와 단계별 수·장소별 단계·따릉이 합계를 비교한다", () => {
  const station = (id, bikes, racks, shared) => toBikeStation({ stationId: id, stationName: id, parkingBikeTotCnt: String(bikes), rackTotCnt: String(racks), shared: String(shared), stationLatitude: "37.5", stationLongitude: "127" });
  const prevFacts = reportFacts({
    citydata: { sample: false, areas: [area("POI001", "여유", 1, 2), area("POI002", "보통", 1, 2), area("POI003", "붐빔", 1, 2), area("POI004", "보통", 1, 2)], errors: [] },
    bikes: { sample: false, stations: [station("A", 0, 10, 0), station("B", 5, 10, 50)] },
    now: new Date("2026-10-11T22:00:00Z"),
  });
  const prev = { date: prevFacts.date, weekday: prevFacts.weekday, generatedAt: prevFacts.generatedAt, facts: prevFacts };
  const facts = reportFacts({
    // POI001 여유→붐빔(3단계), POI002 보통→약간 붐빔, POI003 붐빔→보통, POI004 그대로, POI005는 지난번에 없음.
    citydata: { sample: false, areas: [area("POI001", "붐빔", 1, 2), area("POI002", "약간 붐빔", 1, 2), area("POI003", "보통", 1, 2), area("POI004", "보통", 1, 2), area("POI005", "여유", 1, 2)], errors: [] },
    bikes: { sample: false, stations: [station("A", 3, 10, 30), station("B", 12, 10, 120), station("C", 0, 5, 0)] },
    now: new Date("2026-10-12T22:00:00Z"),
  });
  const diff = reportDiff(prev, facts);

  assert.deepEqual(diff.previous, { date: "2026-10-12", weekday: "월", generatedAt: "2026-10-11T22:00:00.000Z" });
  assert.equal(diff.hours, 24);
  assert.equal(diff.places.sampleChanged, false);
  assert.deepEqual(diff.places.received, { prev: 4, now: 5, delta: 1 });
  assert.deepEqual(diff.places.levels, {
    여유: { prev: 1, now: 1, delta: 0 },
    보통: { prev: 2, now: 2, delta: 0 },
    "약간 붐빔": { prev: 0, now: 1, delta: 1 },
    붐빔: { prev: 1, now: 1, delta: 0 },
  });
  assert.equal(diff.places.compared, 4);
  assert.equal(diff.places.worseCount, 2);
  assert.equal(diff.places.betterCount, 1);
  // 많이 오른 곳 먼저.
  assert.deepEqual(diff.places.worse, [
    { name: "장소POI001", from: "여유", to: "붐빔" },
    { name: "장소POI002", from: "보통", to: "약간 붐빔" },
  ]);
  assert.deepEqual(diff.places.better, [{ name: "장소POI003", from: "붐빔", to: "보통" }]);

  assert.deepEqual(diff.bikes.stations, { prev: 2, now: 3, delta: 1 });
  assert.deepEqual(diff.bikes.bikes, { prev: 5, now: 15, delta: 10 });
  assert.deepEqual(diff.bikes.empty, { prev: 1, now: 1, delta: 0 });
  assert.deepEqual(diff.bikes.full, { prev: 0, now: 1, delta: 1 });

  // 프롬프트에는 장소별 단계(all)는 빼고 diff를 넣는다.
  const prompt = reportPrompt(facts, diff);
  assert.match(prompt, /지난 리포트\(2026-10-12 월요일, 24시간 전\)/);
  const json = JSON.parse(prompt.slice(prompt.lastIndexOf("\n") + 1));
  assert.equal(json.places.all, undefined);
  assert.deepEqual(json.diff, diff);
  assert.match(reportPrompt(facts), /changes는 빈 문자열/);
});

test("지난 리포트가 없거나, 한쪽을 받지 못했거나, 장소별 단계가 없던 리포트와 비교", () => {
  const facts = reportFacts({ citydata: { sample: true, areas: [area("POI001", "여유", 1, 2)], errors: [] }, bikes: { error: "HTTP 500" }, now: new Date("2026-10-12T22:00:00Z") });
  assert.equal(reportDiff(null, facts), null);

  // 이 기능 전 리포트: places에 all이 없다.
  const { all, ...oldPlaces } = reportFacts({ citydata: { sample: false, areas: [area("POI001", "보통", 1, 2)], errors: [] }, bikes: null }).places;
  const prev = { date: "2026-10-12", weekday: "월", generatedAt: "2026-10-11T22:00:00Z", facts: { places: oldPlaces, bikes: { stations: 1 } } };
  const diff = reportDiff(prev, facts);
  assert.equal(diff.places.sampleChanged, true);
  assert.equal(diff.places.worse, null);
  assert.deepEqual(diff.places.levels.여유, { prev: 0, now: 1, delta: 1 });
  assert.deepEqual(diff.bikes, { error: "이번 리포트에서 받지 못함" });
  assert.deepEqual(reportDiff({ ...prev, facts: { ...prev.facts, places: { error: "x" } } }, facts).places, { error: "지난 리포트에서 받지 못함" });
});

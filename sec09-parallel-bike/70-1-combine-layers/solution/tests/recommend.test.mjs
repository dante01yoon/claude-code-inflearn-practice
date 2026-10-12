import assert from "node:assert/strict";
import { test } from "node:test";
import { BIKE_MAX_M, BUSY_RATIO, TRIP_MAX_M, WALK_MAX_M, chooseMode, crowdAtHour, recommend } from "../recommend.mjs";

const live = {
  now: { time: "2026-10-12 14:40", level: "보통", min: 100, max: 200 },
  forecast: [
    { time: "2026-10-12 15:00", level: "여유", min: 50, max: 60 },
    { time: "2026-10-13 02:00", level: "붐빔", min: 900, max: 1000 },
  ],
};

test("crowdAtHour: 그 시가 지금이면 지금 값, 아니면 그 시 예측, 없으면 null", () => {
  assert.deepEqual(crowdAtHour(live, 14), { ...live.now, forecast: false });
  assert.deepEqual(crowdAtHour(live, 15), { ...live.forecast[0], forecast: true });
  assert.equal(crowdAtHour(live, 2).level, "붐빔"); // 자정 넘긴 예측
  assert.equal(crowdAtHour(live, 9), null);           // 지나간 시각
  assert.equal(crowdAtHour(null, 14), null);
  assert.equal(crowdAtHour({ now: { ...live.now, level: "" }, forecast: [] }, 14), null); // 단계를 모르면 없음
});

const station = (ratio, running = true) => ({ ratio, running });

test("chooseMode: 가까우면 걸어서, 4km 안이면 따릉이, 멀면 지하철", () => {
  const origin = { running: true, docks: 3 };
  assert.deepEqual(chooseMode({ station: station(0.2), docks: 2, distanceM: WALK_MAX_M }, origin), { mode: "walk", why: "close" });
  assert.deepEqual(chooseMode({ station: station(0.2), docks: 2, distanceM: BIKE_MAX_M }, origin), { mode: "bike", why: "short" });
  assert.deepEqual(chooseMode({ station: station(0.2), docks: 2, distanceM: BIKE_MAX_M + 1 }, origin), { mode: "subway", why: "default" });
  // 출발 역 근처에 대여소가 없으면 짧아도 지하철
  assert.deepEqual(chooseMode({ station: station(0.2), docks: 2, distanceM: 2000 }, { running: true, docks: 0 }), { mode: "subway", why: "default" });
});

test("chooseMode: 도착 역이 붐비면 7km 안은 따릉이, 대여소가 없으면 붐벼도 지하철", () => {
  assert.deepEqual(chooseMode({ station: station(BUSY_RATIO), docks: 1, distanceM: 6000 }, { running: true, docks: 1 }), { mode: "bike", why: "busyStation" });
  assert.deepEqual(chooseMode({ station: station(BUSY_RATIO), docks: 1, distanceM: 8000 }, { running: true, docks: 1 }), { mode: "subway", why: "busy" });
  assert.deepEqual(chooseMode({ station: station(0.9), docks: 0, distanceM: null }), { mode: "subway", why: "busy" });
  assert.deepEqual(chooseMode({ station: station(0.9), docks: 4, distanceM: null }), { mode: "bike", why: "busyStation" });
});

test("chooseMode: 지하철이 안 다니거나 근처 역이 없으면 따릉이, 그것도 없으면 none", () => {
  assert.deepEqual(chooseMode({ station: station(0, false), docks: 2 }), { mode: "bike", why: "noSubway" });
  assert.deepEqual(chooseMode({ station: station(0.1), docks: 2, distanceM: 9000 }, { running: false, docks: 1 }), { mode: "bike", why: "noSubway" });
  assert.deepEqual(chooseMode({ station: null, docks: 2 }), { mode: "bike", why: "noStation" });
  assert.deepEqual(chooseMode({ station: null, docks: 0 }), { mode: "none", why: "noStation" });
});

const cand = (name, level, extra = {}) => ({
  area: { name }, crowd: level ? { level } : null, station: station(0.3), docks: 1, distanceM: null, ...extra,
});

test("recommend: 그 시각 혼잡도가 낮은 순, 같으면 가까운 순, 같으면 역이 한가한 순", () => {
  const { basis, items } = recommend([
    cand("붐빔", "붐빔"), cand("보통", "보통"), cand("여유-역붐빔", "여유", { station: station(0.8) }),
    cand("여유-역한가", "여유", { station: station(0.1) }), cand("값없음", null),
  ]);
  assert.equal(basis, "crowd");
  assert.deepEqual(items.map((c) => c.area.name), ["여유-역한가", "여유-역붐빔", "보통"]);
  assert.equal(items[1].mode, "bike"); // 역이 붐비고 대여소가 있다
});

test("recommend: 출발 역이 있으면 10km 안만, 갈 수단이 없는 곳은 뒤로", () => {
  const origin = { running: true, docks: 1 };
  const { items } = recommend([
    cand("멀리", "여유", { distanceM: TRIP_MAX_M + 1 }), cand("보통-가까움", "보통", { distanceM: 3000 }),
    cand("여유-못감", "여유", { distanceM: 5000, station: null, docks: 0 }), cand("여유-중간", "여유", { distanceM: 6000 }),
  ], { origin });
  assert.deepEqual(items.map((c) => c.area.name), ["여유-중간", "보통-가까움", "여유-못감"]);
  assert.deepEqual(items.map((c) => c.mode), ["subway", "bike", "none"]);
});

test("recommend: 그 시각 혼잡도가 하나도 없으면 가까운 역 승하차로, 지하철이 다니는 곳만", () => {
  const { basis, items } = recommend([
    cand("역붐빔", null, { station: station(0.7) }), cand("역한가", null, { station: station(0.2) }),
    cand("운행없음", null, { station: station(0, false) }), cand("역없음", null, { station: null }),
  ], { limit: 5 });
  assert.equal(basis, "station");
  assert.deepEqual(items.map((c) => c.area.name), ["역한가", "역붐빔"]);
  assert.deepEqual(recommend([]), { basis: "station", items: [] });
});

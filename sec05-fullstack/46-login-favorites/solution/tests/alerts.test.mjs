import assert from "node:assert/strict";
import { test } from "node:test";
import { PLACE_ALERT_LEVELS, STATION_ALERT_RATIOS, activeAlerts, kstHour, newAlerts, placeAlert, stationAlert } from "../alerts.mjs";
import { HOURS } from "../stats.mjs";

const area = (level, name = "강남역") => ({ name, live: { now: { time: "2026-10-12 18:05", level, min: 30000, max: 32000 } } });
const fav = (notify_level, place_code = "POI014") => ({ place_code, notify_level });

// 08시 100명(피크), 11시 30명, 18시 60명, 나머지 0
const row = {};
for (const h of HOURS) {
  row[`HR_${h}_GET_ON_NOPE`] = { 8: 100, 11: 30, 18: 60 }[h] ?? 0;
  row[`HR_${h}_GET_OFF_NOPE`] = 0;
}

test("알림 기준 선택지는 DB check와 같다", () => {
  assert.deepEqual(PLACE_ALERT_LEVELS, ["보통", "약간 붐빔", "붐빔"]);
  for (const r of STATION_ALERT_RATIOS) assert.ok(r >= 10 && r <= 100);
});

test("KST 시는 UTC에 9시간을 더한다", () => {
  assert.equal(kstHour(new Date("2026-10-12T09:30:00Z")), 18);
  assert.equal(kstHour(new Date("2026-10-12T15:10:00Z")), 0);
});

test("장소: 지금 혼잡도가 고른 단계 이상이면 알린다", () => {
  assert.equal(placeAlert(fav("약간 붐빔"), area("보통")), null);
  assert.equal(placeAlert(fav("약간 붐빔"), area("약간 붐빔")).level, "약간 붐빔");
  assert.deepEqual(placeAlert(fav("약간 붐빔"), area("붐빔")),
    { key: "place:POI014", kind: "place", name: "강남역", level: "붐빔", time: "2026-10-12 18:05", min: 30000, max: 32000 });
  assert.equal(placeAlert(fav("붐빔"), area("약간 붐빔")), null);
});

test("장소: 알림을 껐거나 실시간 값이 없거나 혼잡도를 모르면 알리지 않는다", () => {
  assert.equal(placeAlert(fav(null), area("붐빔")), null);
  assert.equal(placeAlert(fav("보통"), { name: "강남역", live: null }), null);
  assert.equal(placeAlert(fav("보통"), undefined), null);
  assert.equal(placeAlert(fav("보통"), area("정보없음")), null);
});

test("역: 지금 시간대가 피크의 고른 비율 이상이면 알린다", () => {
  const f = (notify_ratio) => ({ station_name: "가산디지털단지", notify_ratio });
  assert.deepEqual(stationAlert(f(60), row, 18), { key: "station:가산디지털단지", kind: "station", name: "가산디지털단지", hour: 18, ratio: 0.6, value: 60 });
  assert.equal(stationAlert(f(70), row, 18), null);
  assert.equal(stationAlert(f(90), row, 8).ratio, 1);
  assert.equal(stationAlert(f(10), row, 3), null, "승하차 0명인 시간대는 운행하지 않는 때");
  assert.equal(stationAlert(f(null), row, 8), null);
  assert.equal(stationAlert(f(60), undefined, 8), null);
});

test("지금 울릴 알림을 모으고, 새로 붐비게 된 것만 새 알림으로 본다", () => {
  const areas = { POI014: area("붐빔"), POI009: area("여유", "광화문·덕수궁") };
  const alerts = activeAlerts({
    places: [fav("약간 붐빔"), fav("보통", "POI009"), fav("보통", "POI999")],
    stations: [{ station_name: "가산디지털단지", notify_ratio: 50 }, { station_name: "없는역", notify_ratio: 10 }],
    areaOf: (code) => areas[code], rowOf: (name) => (name === "가산디지털단지" ? row : undefined), hour: 18,
  });
  assert.deepEqual(alerts.map((a) => a.key), ["place:POI014", "station:가산디지털단지"]);
  assert.deepEqual(newAlerts(null, alerts), [], "처음 확인은 기준점만 잡는다");
  assert.deepEqual(newAlerts(new Set(["place:POI014"]), alerts).map((a) => a.key), ["station:가산디지털단지"]);
});

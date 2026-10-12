import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  BIKE_COORDS, BIKE_DAY, BIKE_DAYS, BIKE_TRIPS_JSON, SERVICE_START_S, bikeCsv, bikeTripsJson, dockActivity, fromTripsJson,
  hourlyStarts, stationKey, toSeconds, toServiceDay, toTrips, toTripsJson,
} from "../bike-trips.mjs";
import { decodeCsv, parseCsv } from "../subway-csv.mjs";

// 대여이력 한 행(머리글 이름 그대로). 값은 덮어쓸 것만 넘긴다.
const rec = (o = {}) => ({
  "자전거번호": "SPB-1", "대여일시": "2026-06-13 08:00:00", "대여 대여소번호": "00102",
  "반납일시": "2026-06-13 08:10:30", "반납대여소번호": "00103",
  "이용시간(분)": "10", "이용거리(M)": "1280.50", ...o,
});
const fmt = (n) => n.toLocaleString("ko-KR");
const coords = { 102: { lat: 37.5, lng: 126.9 }, 103: { lat: 37.6, lng: 127.0 } };

test("대여소번호 5자리 0 채움을 좌표 JSON 키로 바꾼다", () => {
  assert.equal(BIKE_DAY, "2026-06-13");
  assert.equal(stationKey("01028"), "1028");
  assert.equal(stationKey("00102"), "102");
  assert.equal(stationKey("04099"), "4099");
  assert.equal(stationKey("12345"), "12345");
  assert.equal(stationKey(""), ""); // 반납 정보가 없는 행
  assert.equal(stationKey("ST-1045"), "");
});

test("toSeconds: 자정 기준 초, 다음 날은 86400 이상, 이상한 값은 NaN", () => {
  assert.equal(toSeconds("2026-06-13 00:00:00"), 0);
  assert.equal(toSeconds("2026-06-13 00:00:35"), 35);
  assert.equal(toSeconds("2026-06-13 23:59:59"), 86399);
  assert.equal(toSeconds("2026-06-14 00:00:00"), 86400);
  assert.equal(toSeconds("2026-06-15 14:28:54"), 2 * 86400 + 14 * 3600 + 28 * 60 + 54);
  for (const bad of ["", "2026-06-13", "2026-06-13T08:00:00", "2026-06-13 24:00:00", "2026-13-13 00:00:00", "abc"]) {
    assert.ok(Number.isNaN(toSeconds(bad)), JSON.stringify(bad));
  }
});

test("toTrips: 좌표는 [경도, 위도] 순서이고 같은 대여소 반납은 round다", () => {
  const { trips, skipped } = toTrips([rec(), rec({ "반납대여소번호": "00102" })], coords);
  assert.equal(trips.length, 2);
  assert.equal(skipped.noCoords + skipped.noReturn + skipped.badTime, 0);
  assert.deepEqual(trips[0], {
    bike: "SPB-1", fromNo: "102", toNo: "103", from: [126.9, 37.5], to: [127.0, 37.6],
    start: 28800, end: 29430, minutes: 10, meters: 1280.5, round: false,
  });
  assert.equal(trips[1].round, true);
  assert.deepEqual(trips[1].to, [126.9, 37.5]);
});

test("toTrips: 버린 행을 이유별로 센다", () => {
  const { trips, skipped } = toTrips([
    rec({ "반납대여소번호": "" }), // 반납 정보 없음
    rec({ "대여 대여소번호": "04099" }), // 좌표에 없는 대여소
    rec({ "반납대여소번호": "00005" }),
    rec({ "반납일시": "2026-06-13 07:59:59" }), // 반납이 대여보다 이름
    rec({ "반납일시": "" }),
    rec({ "반납일시": "2026-06-14 00:00:00" }), // 다음 날 반납은 살린다
  ], coords);
  assert.equal(trips.length, 1);
  assert.equal(trips[0].end, 86400);
  assert.equal(skipped.noReturn, 1);
  assert.equal(skipped.noCoords, 2);
  assert.equal(skipped.badTime, 2);
});

test("hourlyStarts: 대여 시작 시각의 시별 건수 24개", () => {
  const at = (s) => ({ start: s });
  const counts = hourlyStarts([at(0), at(3599), at(3600), at(86399)]);
  assert.equal(counts.length, 24);
  assert.deepEqual([counts[0], counts[1], counts[23]], [2, 1, 1]);
});

test("재생용 JSON: 이용자 정보 없이 열마다 배열로 담고, 다시 읽으면 재생에 쓰는 값이 같다", () => {
  const built = toTrips([rec(), rec({ "반납대여소번호": "00102", "생년": "1990", "성별": "F" })], coords);
  const json = toTripsJson({ ...built, total: 2 });
  assert.deepEqual(Object.keys(json), ["day", "source", "total", "skipped", "from", "to", "start", "end"]);
  assert.deepEqual([json.from, json.to, json.start, json.end], [[102, 102], [103, 102], [28800, 28800], [29430, 29430]]);
  assert.doesNotMatch(JSON.stringify(json), /SPB|1990|"F"/);
  const back = fromTripsJson(JSON.parse(JSON.stringify(json)), coords);
  assert.equal(back.total, 2);
  assert.deepEqual(back.trips, built.trips.map(({ fromNo, toNo, from, to, start, end, round }) => ({ fromNo, toNo, from, to, start, end, round })));
  assert.throws(() => fromTripsJson({ ...json, to: [103, 5] }, coords), /좌표 없음: 5/);
});

// 실제 하루치 데이터. 기준값은 원본 CSV를 모듈과 별개로 센 것이다.
// 화면이 읽는 재생용 JSON은 저장소에 있으므로 항상 검사한다.
const coordsJson = JSON.parse(readFileSync(BIKE_COORDS, "utf8"));
const EXPECTED = {
  "2026-06-13": {
    total: 135181, trips: 134455, skipped: { noCoords: 6, noReturn: 720, badTime: 0 },
    round: 15640, overDay: 1700, maxEnd: 218529, // 6월 15일에 반납한 건이 있다
    hourly: [
      3480, 2587, 1748, 1274, 908, 1197, 1970, 3185, 5172, 6105, 6364, 6499,
      7146, 7122, 6740, 7161, 8215, 9151, 9433, 9427, 9370, 8561, 6871, 4769,
    ],
    // 100번째 데이터 행(방이역 → 올림픽공원역)은 앞쪽 행이 모두 살아 있어 trips[99]다.
    first: { fromNo: "1028", toNo: "1028", from: [127.12277222, 37.53310776], start: 35, end: 62 },
    hundredth: { start: 226, end: 525, round: false, from: [127.12583923, 37.50896835], to: [127.13153839, 37.51657104] },
    csv: { first: { bike: "SPB-43658", minutes: 0, meters: 0 }, hundredth: { bike: "SPB-70844", minutes: 4, meters: 1280 } },
  },
  "2026-06-10": {
    total: 156472, trips: 155526, skipped: { noCoords: 97, noReturn: 849, badTime: 0 },
    round: 13448, overDay: 1055, maxEnd: 179645, // 6월 12일 01:54:05 반납
    hourly: [
      2468, 1688, 1105, 819, 562, 1620, 4048, 10443, 14359, 6804, 4705, 5343,
      5719, 5281, 5317, 6678, 8462, 13129, 17277, 11594, 9322, 8240, 6676, 3867,
    ], // 평일이라 08시·18시 출퇴근 봉우리가 뚜렷하다
    first: { fromNo: "3201", toNo: "3201", from: [126.89916992, 37.53073502], start: 36, end: 46 },
    hundredth: { start: 53, end: 559, round: true },
    csv: { first: { bike: "SPB-68558", minutes: 0, meters: 0.13 }, hundredth: { bike: "SPB-53816", minutes: 8, meters: 1.2 } },
  },
};

test("BIKE_DAYS: 기본은 토요일, 날짜마다 CSV·JSON 경로가 따로 있다", () => {
  assert.deepEqual(BIKE_DAYS.map((d) => d.day), Object.keys(EXPECTED));
  assert.equal(BIKE_DAY, "2026-06-13");
  assert.equal(BIKE_TRIPS_JSON, "data/bike/bike-trips-20260613.json");
  assert.equal(bikeTripsJson("2026-06-10"), "data/bike/bike-trips-20260610.json");
  assert.equal(bikeCsv("2026-06-10"), "data/bike/bike-rentals-20260610.csv");
});

test("toSeconds·toTrips: 날짜를 주면 그날 00:00 기준 초", () => {
  assert.equal(toSeconds("2026-06-10 00:00:36", "2026-06-10"), 36);
  assert.equal(toSeconds("2026-06-13 00:00:00", "2026-06-10"), 3 * 86400);
  const { trips } = toTrips([rec({ "대여일시": "2026-06-10 08:00:00", "반납일시": "2026-06-11 00:00:10" })], coords, "2026-06-10");
  assert.deepEqual([trips[0].start, trips[0].end], [28800, 86410]);
  assert.equal(toTripsJson({ trips, skipped: {}, total: 1 }, "2026-06-10").day, "2026-06-10");
});

for (const { day, label } of BIKE_DAYS) {
  const ex = EXPECTED[day];
  const tripsJson = JSON.parse(readFileSync(bikeTripsJson(day), "utf8"));
  const { trips, skipped, total } = fromTripsJson(tripsJson, coordsJson);
  const dropped = Object.values(ex.skipped).reduce((a, b) => a + b, 0);
  const t = (name, fn) => test(`실제 데이터 ${label}: ${name}`, fn);

  t(`${fmt(ex.total)}행 중 ${fmt(ex.trips)}건을 살리고 ${fmt(dropped)}행을 버린다`, () => {
    assert.equal(tripsJson.day, day);
    assert.equal(total, ex.total);
    assert.equal(trips.length, ex.trips);
    assert.deepEqual(skipped, ex.skipped);
    assert.equal(trips.length + dropped, total);
  });

  t(`같은 대여소 반납 ${fmt(ex.round)}건, 다음 날 이후 반납 ${fmt(ex.overDay)}건`, () => {
    assert.equal(trips.filter((x) => x.round).length, ex.round);
    assert.equal(trips.filter((x) => x.end >= 86400).length, ex.overDay);
    assert.equal(trips.reduce((m, x) => Math.max(m, x.end), 0), ex.maxEnd);
    assert.ok(trips.every((x) => x.end >= x.start && x.start >= 0 && x.start < 86400));
  });

  t("시별 대여 시작 건수", () => {
    const counts = hourlyStarts(trips);
    assert.deepEqual(counts, ex.hourly);
    assert.equal(counts.reduce((a, b) => a + b, 0), trips.length);
  });

  t("첫 이동과 100번째 이동", () => {
    const f = ex.first;
    assert.deepEqual(trips[0], { fromNo: f.fromNo, toNo: f.toNo, from: f.from, to: f.from, start: f.start, end: f.end, round: true });
    const h = ex.hundredth;
    assert.deepEqual([trips[99].start, trips[99].end, trips[99].round], [h.start, h.end, h.round]);
    if (h.from) assert.deepEqual([trips[99].from, trips[99].to], [h.from, h.to]);
  });

  t("모든 좌표가 서울 범위 안이다", () => {
    for (const x of trips) {
      for (const [lng, lat] of [x.from, x.to]) {
        assert.ok(lng > 126.7 && lng < 127.3 && lat > 37.4 && lat < 37.8, `${x.fromNo}→${x.toNo} ${lng},${lat}`);
      }
    }
  });

  t("운행 하루로 옮겨도 건수는 같고 모든 이동이 04시 이후에 시작한다", () => {
    const moved = toServiceDay(trips);
    assert.equal(moved.length, trips.length);
    assert.ok(moved.every((x) => x.start >= SERVICE_START_S && x.end >= x.start));
    const act = dockActivity(moved);
    const sum = [...act.values()].reduce((a, c) => a + c.reduce((x, y) => x + y, 0), 0);
    assert.equal(sum, trips.length * 2 - moved.filter((x) => x.end >= SERVICE_START_S + 86400).length);
  });

  // 원본 CSV는 개인 정보 열(생년·성별) 때문에 저장소에 넣지 않으므로, 없으면 건너뛴다(받는 법은 README).
  const csvPath = bikeCsv(day);
  const hasCsv = existsSync(csvPath);
  const records = hasCsv ? parseCsv(decodeCsv(readFileSync(csvPath))) : [];
  const csvTest = (name, fn) => test(`원본 CSV ${label}: ${name}`, { skip: !hasCsv && `${csvPath} 없음` }, fn);

  csvTest("재생용 JSON이 CSV에서 새로 만든 것과 같다(npm run build:bike)", () => {
    assert.equal(records.length, ex.total);
    assert.deepEqual(toTripsJson({ ...toTrips(records, coordsJson, day), total: records.length }, day), tripsJson);
  });

  csvTest("첫 행과 100번째 행", () => {
    const { trips: csvTrips } = toTrips(records, coordsJson, day);
    const f = ex.first, c = ex.csv;
    assert.deepEqual(csvTrips[0], {
      bike: c.first.bike, fromNo: f.fromNo, toNo: f.toNo, from: f.from, to: f.from,
      start: f.start, end: f.end, minutes: c.first.minutes, meters: c.first.meters, round: true,
    });
    assert.equal(records[99]["자전거번호"], c.hundredth.bike);
    assert.equal(csvTrips[99].bike, c.hundredth.bike);
    assert.deepEqual([csvTrips[99].minutes, csvTrips[99].meters], [c.hundredth.minutes, c.hundredth.meters]);
  });
}

test("toServiceDay: 04시 전에 시작한 이동은 하루 끝으로 옮긴다", () => {
  const t = (start, end) => ({ fromNo: "1", toNo: "2", start, end });
  assert.equal(SERVICE_START_S, 4 * 3600);
  assert.deepEqual(toServiceDay([t(100, 700), t(14400, 15000), t(86000, 87000)]).map((x) => [x.start, x.end]),
    [[86500, 87100], [14400, 15000], [86000, 87000]]);
});

test("dockActivity: 대여소별 운행 시간대(04시 = 0번)별 대여+반납, 하루 밖은 세지 않는다", () => {
  const t = (fromNo, toNo, start, end) => ({ fromNo, toNo, start, end });
  const act = dockActivity([
    t("1", "2", 4 * 3600, 4 * 3600 + 600),       // 04시대 대여·반납
    t("1", "1", 5 * 3600 - 1, 5 * 3600 + 10),    // 04시대 대여, 05시대 반납(같은 대여소)
    t("2", "3", 27 * 3600 + 50, 28 * 3600 + 5),  // 다음 날 03시대 대여, 04시 넘어 반납 → 반납은 안 셈
  ]);
  assert.deepEqual(act.get("1").slice(0, 2), [2, 1]);
  assert.equal(act.get("2")[0], 1);
  assert.equal(act.get("2")[23], 1);
  assert.equal(act.has("3"), false);
});

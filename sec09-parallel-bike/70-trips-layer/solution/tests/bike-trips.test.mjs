import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  BIKE_COORDS, BIKE_CSV, BIKE_DAY, BIKE_TRIPS_JSON, fromTripsJson, hourlyStarts, stationKey, toSeconds, toTrips, toTripsJson,
} from "../bike-trips.mjs";
import { decodeCsv, parseCsv } from "../subway-csv.mjs";

// 대여이력 한 행(머리글 이름 그대로). 값은 덮어쓸 것만 넘긴다.
const rec = (o = {}) => ({
  "자전거번호": "SPB-1", "대여일시": "2026-06-13 08:00:00", "대여 대여소번호": "00102",
  "반납일시": "2026-06-13 08:10:30", "반납대여소번호": "00103",
  "이용시간(분)": "10", "이용거리(M)": "1280.50", ...o,
});
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
const tripsJson = JSON.parse(readFileSync(BIKE_TRIPS_JSON, "utf8"));
const { trips, skipped, total } = fromTripsJson(tripsJson, coordsJson);

test("실제 데이터: 135,181행 중 134,455건을 살리고 726행을 버린다", () => {
  assert.equal(tripsJson.day, BIKE_DAY);
  assert.equal(total, 135181);
  assert.equal(trips.length, 134455);
  assert.deepEqual(skipped, { noCoords: 6, noReturn: 720, badTime: 0 });
  assert.equal(trips.length + Object.values(skipped).reduce((a, b) => a + b, 0), total);
});

test("실제 데이터: 같은 대여소 반납 15,640건, 다음 날 이후 반납 1,700건", () => {
  assert.equal(trips.filter((t) => t.round).length, 15640);
  assert.equal(trips.filter((t) => t.end >= 86400).length, 1700);
  assert.equal(trips.reduce((m, t) => Math.max(m, t.end), 0), 218529); // 6월 15일에 반납한 건이 있다
  assert.ok(trips.every((t) => t.end >= t.start && t.start >= 0 && t.start < 86400));
});

test("실제 데이터: 시별 대여 시작 건수", () => {
  const counts = hourlyStarts(trips);
  assert.deepEqual(counts, [
    3480, 2587, 1748, 1274, 908, 1197, 1970, 3185, 5172, 6105, 6364, 6499,
    7146, 7122, 6740, 7161, 8215, 9151, 9433, 9427, 9370, 8561, 6871, 4769,
  ]);
  assert.equal(counts.reduce((a, b) => a + b, 0), trips.length);
});

test("실제 데이터: 첫 이동과 100번째 이동", () => {
  assert.deepEqual(trips[0], {
    fromNo: "1028", toNo: "1028",
    from: [127.12277222, 37.53310776], to: [127.12277222, 37.53310776],
    start: 35, end: 62, round: true,
  });
  // 100번째 데이터 행(방이역 → 올림픽공원역)은 앞쪽 행이 모두 살아 있어 trips[99]다.
  assert.deepEqual([trips[99].start, trips[99].end, trips[99].round], [226, 525, false]);
  assert.deepEqual(trips[99].from, [127.12583923, 37.50896835]);
  assert.deepEqual(trips[99].to, [127.13153839, 37.51657104]);
});

test("실제 데이터: 모든 좌표가 서울 범위 안이다", () => {
  for (const t of trips) {
    for (const [lng, lat] of [t.from, t.to]) {
      assert.ok(lng > 126.7 && lng < 127.3 && lat > 37.4 && lat < 37.8, `${t.fromNo}→${t.toNo} ${lng},${lat}`);
    }
  }
});

// 원본 CSV는 개인 정보 열(생년·성별) 때문에 저장소에 넣지 않으므로, 없으면 건너뛴다(받는 법은 README).
const hasCsv = existsSync(BIKE_CSV);
const records = hasCsv ? parseCsv(decodeCsv(readFileSync(BIKE_CSV))) : [];
const csvTest = (name, fn) => test(name, { skip: !hasCsv && `${BIKE_CSV} 없음` }, fn);

csvTest("원본 CSV: 재생용 JSON이 CSV에서 새로 만든 것과 같다(npm run build:bike)", () => {
  assert.equal(records.length, 135181);
  assert.deepEqual(toTripsJson({ ...toTrips(records, coordsJson), total: records.length }), tripsJson);
});

csvTest("원본 CSV: 첫 행과 100번째 행", () => {
  const { trips: csvTrips } = toTrips(records, coordsJson);
  assert.deepEqual(csvTrips[0], {
    bike: "SPB-43658", fromNo: "1028", toNo: "1028",
    from: [127.12277222, 37.53310776], to: [127.12277222, 37.53310776],
    start: 35, end: 62, minutes: 0, meters: 0, round: true,
  });
  assert.equal(records[99]["자전거번호"], "SPB-70844");
  assert.equal(csvTrips[99].bike, "SPB-70844");
  assert.deepEqual([csvTrips[99].minutes, csvTrips[99].meters], [4, 1280]);
});

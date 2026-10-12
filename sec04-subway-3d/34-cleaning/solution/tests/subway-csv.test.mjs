import assert from "node:assert/strict";
import { test } from "node:test";
import { HOURS, count, total } from "../stats.mjs";
import { decodeCsv, mergeStations, parseCsv, stationLocator, toSubwayRows } from "../subway-csv.mjs";

// 승하차 CSV와 같은 열 순서(04시-05시 … 23시-24시, 00시-01시 … 03시-04시)로 작은 CSV를 만든다.
const hourColumns = HOURS.flatMap((h) => ["승차", "하차"].map((k) =>
  `${String(h).padStart(2, "0")}시-${String(h + 1).padStart(2, "0")}시 ${k}인원`));
const csv = (lines) => [["사용월", "호선명", "지하철역", ...hourColumns, "작업일자"], ...lines]
  .map((fields) => fields.map((f) => `"${f}"`).join(",")).join("\r\n") + "\r\n";
// h시 승차 = h * 10 + 1, 하차 = h * 10 + 2
const line = (name, ln) => ["202609", ln, name, ...HOURS.flatMap((h) => [h * 10 + 1, h * 10 + 2]), "20261003"];

test("CP949 바이트를 디코딩한다", () => {
  // CP949로 "역" = BF AA, "명" = B8 ED
  assert.equal(decodeCsv(new Uint8Array([0xbf, 0xaa, 0xb8, 0xed])), "역명");
});

test("열 이름을 HR_<시>_GET_<ON|OFF>_NOPE로 바꾸고 값은 숫자로 바꾼다", () => {
  assert.equal(hourColumns[38], "23시-24시 승차인원");
  const [row] = toSubwayRows(parseCsv(csv([line("가산디지털단지", "7호선")])));
  assert.equal(row.USE_MM, "202609");
  assert.equal(row.STTN, "가산디지털단지");
  assert.equal(row.SBWY_ROUT_LN_NM, "7호선");
  assert.equal(row.JOB_YMD, "20261003");
  for (const h of HOURS) {
    assert.equal(count(row, h, "ON"), h * 10 + 1, `${h}시 승차`);
    assert.equal(count(row, h, "OFF"), h * 10 + 2, `${h}시 하차`);
  }
  assert.equal(count(row, 23, "ON"), 231); // 23시 열은 "23시-24시"로 끝난다
  assert.equal(Object.keys(row).filter((k) => k.startsWith("HR_")).length, 48);
});

test("빈 값이나 숫자가 아닌 값은 NaN이 되어 점검에서 걸린다", () => {
  const bad = line("시청", "1호선");
  bad[3] = "";
  bad[4] = "1,234";
  const [row] = toSubwayRows(parseCsv(csv([bad])));
  assert.ok(Number.isNaN(count(row, 4, "ON")));
  assert.ok(Number.isNaN(count(row, 4, "OFF")));
});

test("필드 수가 머리글과 다르면 줄 번호와 함께 실패한다", () => {
  assert.throws(() => parseCsv('"a","b"\n"1","2"\n"3"\n'), /3번째 줄/);
});

test("환승역 합산: 같은 역명은 합치고, 노선별 행은 그대로 남긴다", () => {
  const rows = toSubwayRows(parseCsv(csv([line("시청", "1호선"), line("시청", "2호선"), line("종각", "1호선")])));
  const merged = mergeStations(rows);
  assert.equal(rows.length, 3);
  assert.deepEqual(merged.map((m) => [m.STTN, m.SBWY_ROUT_LN_NM]), [["시청", "1호선·2호선"], ["종각", "1호선"]]);
  assert.deepEqual(merged[0].LINES, ["1호선", "2호선"]);
  for (const h of HOURS) assert.equal(total(merged[0], h), total(rows[0], h) + total(rows[1], h));
  assert.equal(merged[0].USE_MM, "202609");
});

test("좌표: 매핑표 이름, 노선 별칭, 같은 역명 평균, 합친 행 평균", () => {
  const master = [
    { 역사명: "화전", 호선: "경의중앙선", 위도: "37.6", 경도: "126.8" },
    { 역사명: "양평", 호선: "5호선", 위도: "37.5", 경도: "126.9" },
    { 역사명: "양평", 호선: "중앙선", 위도: "37.4", 경도: "127.5" },
    { 역사명: "창동", 호선: "4호선", 위도: "37.65", 경도: "127.04" },
    { 역사명: "시청", 호선: "1호선", 위도: "37.56", 경도: "126.97" },
    { 역사명: "시청", 호선: "2호선", 위도: "37.58", 경도: "126.99" },
  ];
  const coordOf = stationLocator(master);
  assert.deepEqual(coordOf({ STTN: "한국항공대", SBWY_ROUT_LN_NM: "경의선" }), [37.6, 126.8]);
  assert.deepEqual(coordOf({ STTN: "양평", SBWY_ROUT_LN_NM: "중앙선" }), [37.4, 127.5]);
  assert.deepEqual(coordOf({ STTN: "창동", SBWY_ROUT_LN_NM: "경원선" }), [37.65, 127.04]);
  const [lat, lon] = coordOf({ STTN: "시청", LINES: ["1호선", "2호선"] });
  assert.ok(Math.abs(lat - 37.57) < 1e-9 && Math.abs(lon - 126.98) < 1e-9);
  assert.equal(coordOf({ STTN: "없는역", SBWY_ROUT_LN_NM: "1호선" }), null);
});

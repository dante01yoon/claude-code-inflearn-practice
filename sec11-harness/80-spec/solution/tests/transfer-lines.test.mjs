import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { HOURS, count } from "../stats.mjs";
import { SUBWAY_CSV, decodeCsv, mergeStations, parseCsv, toSubwayRows } from "../subway-csv.mjs";
import { groupByLine, passengerLine } from "../transfer-lines.mjs";

// 앱 기본 데이터: 2026년 9월 승하차 CSV
const rows = toSubwayRows(parseCsv(decodeCsv(readFileSync(SUBWAY_CSV))));

// 역마다 묶은 노선별 행(subway.html의 entry.byLine과 같은 방식)
const byStation = mergeStations(rows).map((merged) => ({
  name: merged.STTN,
  lines: groupByLine(rows.filter((r) => r.STTN === merged.STTN && merged.LINES.includes(r.SBWY_ROUT_LN_NM))),
}));
const station = (name) => byStation.find((s) => s.name === name).lines;
const lineOf = (name, line) => station(name).find((r) => r.SBWY_ROUT_LN_NM === line);
const monthSum = (row, kind) => HOURS.reduce((a, h) => a + count(row, h, kind), 0);

test("passengerLine: CSV 호선명을 승객이 아는 노선으로 묶는다", () => {
  const cases = [
    ["경부선", "서울역", "1호선"], ["경인선", "부평", "1호선"], ["장항선", "온양온천", "1호선"],
    ["경원선", "창동", "1호선"], ["경원선", "옥수", "경의중앙선"], ["경원선", "청량리(서울시립대입구)", "경의중앙선"],
    ["경의선", "공덕", "경의중앙선"], ["중앙선", "양평", "경의중앙선"],
    ["일산선", "지축", "3호선"], ["과천선", "과천", "4호선"], ["안산선", "안산", "4호선"],
    ["9호선2~3단계", "석촌", "9호선"], ["분당선", "선릉", "수인분당선"], ["수인선", "인천", "수인분당선"],
    ["공항철도 1호선", "서울역", "공항철도"],
    ["2호선", "강남", "2호선"], ["경춘선", "상봉", "경춘선"], ["서해선", "김포공항", "서해선"],
  ];
  for (const [line, name, expected] of cases) {
    assert.equal(passengerLine({ SBWY_ROUT_LN_NM: line, STTN: name }), expected, `${line} ${name}`);
  }
});

test("groupByLine은 원본 행을 바꾸지 않는다", () => {
  const before = JSON.stringify(rows);
  groupByLine(rows.filter((r) => r.STTN === "서울역"));
  assert.equal(JSON.stringify(rows), before);
});

test("묶은 뒤 노선이 2개 이상인 환승역은 76곳, 지축은 3호선 하나다", () => {
  assert.equal(byStation.filter((s) => s.lines.length > 1).length, 76);
  assert.deepEqual(station("지축").map((r) => r.SBWY_ROUT_LN_NM), ["3호선"]);
});

test("서울역: 1호선·4호선·경의중앙선·공항철도, 1호선은 1호선 + 경부선 합계", () => {
  assert.deepEqual(station("서울역").map((r) => r.SBWY_ROUT_LN_NM), ["1호선", "4호선", "경의중앙선", "공항철도"]);
  assert.equal(monthSum(lineOf("서울역", "1호선"), "ON"), 2784060);
  assert.equal(monthSum(lineOf("서울역", "1호선"), "OFF"), 2487687);
  assert.equal(monthSum(lineOf("서울역", "공항철도"), "ON"), 455766);
});

test("청량리: 경원선이 경의중앙선으로 묶인다", () => {
  const name = "청량리(서울시립대입구)";
  assert.deepEqual(station(name).map((r) => r.SBWY_ROUT_LN_NM), ["1호선", "경의중앙선"]);
  assert.equal(monthSum(lineOf(name, "1호선"), "ON"), 727908);
  assert.equal(monthSum(lineOf(name, "경의중앙선"), "ON"), 545000);
});

test("인천: 1호선(경인선)·수인분당선(수인선)", () => {
  assert.deepEqual(station("인천").map((r) => r.SBWY_ROUT_LN_NM), ["1호선", "수인분당선"]);
});

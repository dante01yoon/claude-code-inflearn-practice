import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  DEFAULT_WINDOW_ID, HOURS, WINDOW_PRESETS, busiestHours, peakRatio, quietestInWindow, usageMonth,
} from "../stats.mjs";

const rows = JSON.parse(readFileSync("data/subway-hourly-202607.json", "utf8")).CardSubwayTime.row;
const seoul = rows.find((r) => r.STTN === "서울역");

// 테스트용 행: 모든 시간대를 0으로 두고 일부만 채운다.
const fakeRow = (totals) => {
  const row = {};
  for (const h of HOURS) {
    row[`HR_${h}_GET_ON_NOPE`] = totals[h] ?? 0;
    row[`HR_${h}_GET_OFF_NOPE`] = 0;
  }
  return row;
};

const dayWindow = WINDOW_PRESETS.find((w) => w.id === "day").hours;

test("하루 전체 창: 가장 한가한 때는 운행하지 않는 02·03시를 빼고 고른다", () => {
  for (const row of rows) assert.ok(!quietestInWindow(row, HOURS).some((h) => h === 2 || h === 3), row.STTN);
  assert.deepEqual(quietestInWindow(seoul, HOURS), [1]);
});

test("시간 창 프리셋은 출근·낮·퇴근·저녁이고 기본은 낮(10–15시대)이다", () => {
  assert.deepEqual(WINDOW_PRESETS.map((w) => w.label), ["출근", "낮", "퇴근", "저녁"]);
  assert.equal(DEFAULT_WINDOW_ID, "day");
  assert.deepEqual(dayWindow, [10, 11, 12, 13, 14, 15]);
  for (const w of WINDOW_PRESETS) for (const h of w.hours) assert.ok(HOURS.includes(h), `${w.label} ${h}`);
});

test("창 안에서 0명인 시간대는 후보에서 빠진다", () => {
  assert.deepEqual(quietestInWindow(fakeRow({ 10: 0, 11: 7, 12: 3 }), [10, 11, 12]), [12]);
});

test("창 안에서 동률이면 모두 돌려준다", () => {
  assert.deepEqual(quietestInWindow(fakeRow({ 4: 5, 10: 9, 1: 5 }), HOURS), [4, 1]);
  assert.deepEqual(quietestInWindow(fakeRow({ 10: 4, 11: 8, 12: 4 }), [10, 11, 12]), [10, 12]);
});

test("자정을 넘는 창([22, 23, 0, 1])도 HOURS 순서대로 동작한다", () => {
  assert.deepEqual(quietestInWindow(fakeRow({ 22: 9, 23: 2, 0: 2, 1: 6 }), [22, 23, 0, 1]), [23, 0]);
  assert.deepEqual(quietestInWindow(seoul, [22, 23, 0, 1]), [1]);
});

test("창 안이 전부 0이면 []를 돌려준다", () => {
  assert.deepEqual(quietestInWindow(fakeRow({ 8: 100 }), dayWindow), []);
  assert.deepEqual(quietestInWindow(seoul, [2, 3]), []);
});

test("서울역(7월)의 낮 창 답은 14시대다", () => {
  // 10–15시대 승하차: 224,318 231,780 266,049 246,602 219,054 270,080
  assert.deepEqual(quietestInWindow(seoul, dayWindow), [14]);
});

test("피크 대비는 그 시간대 값 ÷ 하루 전체 최댓값이다", () => {
  // 서울역 하루 최대는 18시대 487,725명
  assert.equal(peakRatio(seoul, 18), 1);
  assert.equal(peakRatio(seoul, 14), 219054 / 487725);
  assert.equal(Math.round(peakRatio(seoul, 14) * 100), 45);
  assert.equal(peakRatio(seoul, 2), 0);
  assert.equal(peakRatio(fakeRow({}), 10), 0);
});

test("서울역은 18시 승차, 08시 하차가 가장 많다", () => {
  assert.deepEqual(busiestHours(seoul, "ON"), [18]);
  assert.deepEqual(busiestHours(seoul, "OFF"), [8]);
});

test("데이터 기준 달은 USE_MM에서 읽고 그 달의 일수를 센다", () => {
  assert.deepEqual(usageMonth(seoul), { year: 2026, month: 7, days: 31, label: "2026년 7월" });
  assert.equal(usageMonth({ USE_MM: "202606" }).days, 30);
  assert.equal(usageMonth({ USE_MM: "202402" }).days, 29);
  assert.equal(usageMonth({ USE_MM: 202602 }).label, "2026년 2월");
});

test("데이터 기준 달 형식이 맞지 않으면 null이다", () => {
  for (const USE_MM of [undefined, null, "", "2026-07", "202613", "202600", "2026070"]) {
    assert.equal(usageMonth({ USE_MM }), null, String(USE_MM));
  }
});

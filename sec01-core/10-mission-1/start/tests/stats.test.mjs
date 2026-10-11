import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { HOURS, busiestHours, quietestHours } from "../stats.mjs";

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

test("가장 한가한 때는 운행하지 않는 02·03시를 빼고 고른다", () => {
  for (const row of rows) assert.ok(!quietestHours(row).some((h) => h === 2 || h === 3), row.STTN);
  assert.deepEqual(quietestHours(seoul), [1]);
});

test("가장 한가한 때가 동률이면 모두 돌려준다", () => {
  assert.deepEqual(quietestHours(fakeRow({ 4: 5, 10: 9, 1: 5 })), [4, 1]);
});

test("서울역은 18시 승차, 08시 하차가 가장 많다", () => {
  assert.deepEqual(busiestHours(seoul, "ON"), [18]);
  assert.deepEqual(busiestHours(seoul, "OFF"), [8]);
});

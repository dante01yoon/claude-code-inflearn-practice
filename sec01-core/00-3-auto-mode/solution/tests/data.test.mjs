import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const rows = JSON.parse(readFileSync("data/subway-hourly-202607.json", "utf8")).CardSubwayTime.row;

test("역 5곳이 모두 1호선이다", () => {
  assert.equal(rows.length, 5);
  for (const row of rows) assert.equal(row.SBWY_ROUT_LN_NM, "1호선");
});

test("서울역은 08시 하차가 승차보다 많다", () => {
  const seoul = rows.find((r) => r.STTN === "서울역");
  assert.ok(seoul.HR_8_GET_OFF_NOPE > seoul.HR_8_GET_ON_NOPE);
});

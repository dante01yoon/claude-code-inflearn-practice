import assert from "node:assert/strict";
import { test } from "node:test";
import { bandLevel, nextQuietHour } from "../next-quiet.mjs";
import { HOURS } from "../stats.mjs";

// 시 → 승차 인원(하차 0). 없는 시간대는 0명.
const makeRow = (on) => {
  const row = {};
  for (const h of HOURS) {
    row[`HR_${h}_GET_ON_NOPE`] = on[h] ?? 0;
    row[`HR_${h}_GET_OFF_NOPE`] = 0;
  }
  return row;
};

// 피크 08시 100명. 한(<30%) = 05·06·10·22·23시, 보 = 09·20·21시(30), 붐 = 07·08시, 02·03·04·그 밖은 0명
const row = makeRow({ 5: 10, 6: 20, 7: 80, 8: 100, 9: 30, 10: 29, 20: 50, 21: 59, 22: 5, 23: 1 });
const kst = (h, m = 0) => new Date(Date.UTC(2026, 9, 17, (h - 9 + 24) % 24, m));

test("하루 띠 단계: 피크 대비 30% 미만 한, 30–60% 보, 60% 이상 붐, 0명은 null", () => {
  assert.equal(bandLevel(row, 10), "quiet");
  assert.equal(bandLevel(row, 9), "mid");
  assert.equal(bandLevel(row, 21), "mid");
  assert.equal(bandLevel(row, 7), "busy");
  assert.equal(bandLevel(row, 3), null);
});

test("지금 시간대가 한이면 지금 시간대를 돌려준다", () => {
  assert.equal(nextQuietHour(row, kst(10, 40)), 10);
  assert.equal(nextQuietHour(row, kst(22)), 22);
});

test("지금이 한이 아니면 그 뒤로 가장 가까운 한 시간대를 돌려준다", () => {
  assert.equal(nextQuietHour(row, kst(7, 15)), 10);
  assert.equal(nextQuietHour(row, kst(11)), 22);
});

test("0명인 시간대는 건너뛰고 자정을 넘어 다음 날로 이어서 찾는다", () => {
  // 00시 → 01·02·03·04시는 0명 → 05시
  assert.equal(nextQuietHour(row, kst(0)), 5);
  assert.equal(nextQuietHour(row, kst(3, 59)), 5);
});

test("시각은 컴퓨터 시간대가 아니라 서울 시각으로 본다", () => {
  // 2026-10-17 01:00 UTC = 서울 10시
  assert.equal(nextQuietHour(row, new Date("2026-10-17T01:00:00Z")), 10);
});

test("한 시간대가 없거나 하루 내내 0명이면 null", () => {
  const flat = makeRow(Object.fromEntries(HOURS.map((h) => [h, 50])));
  assert.equal(nextQuietHour(flat, kst(12)), null);
  assert.equal(nextQuietHour(makeRow({}), kst(12)), null);
});

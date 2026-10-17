import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { QUIET_RATIO, isQuietHour, nextQuietHour } from "../next-quiet.mjs";
import { HOURS, peakRatio } from "../stats.mjs";

const rows = JSON.parse(readFileSync("data/subway-hourly-202607.json", "utf8")).CardSubwayTime.row;

// 테스트용 행: 모든 시간대를 0으로 두고 일부만 채운다(승차만).
const fakeRow = (totals) => {
  const row = {};
  for (const h of HOURS) {
    row[`HR_${h}_GET_ON_NOPE`] = totals[h] ?? 0;
    row[`HR_${h}_GET_OFF_NOPE`] = 0;
  }
  return row;
};

// KST 시각으로 Date 만들기(KST = UTC+9)
const kst = (h, m = 0) => new Date(Date.UTC(2026, 9, 17, h - 9, m));

// 08시 피크 1000명. 30% 미만(299명 이하)만 한가하다.
const row = fakeRow({ 5: 100, 6: 400, 7: 800, 8: 1000, 9: 600, 10: 300, 11: 299, 12: 500, 22: 200, 23: 50 });

test("한가함 기준은 하루 띠의 「한」과 같다: 피크의 30% 미만이고 0명이 아닌 시간대", () => {
  assert.equal(QUIET_RATIO, 0.3);
  assert.equal(isQuietHour(row, 11), true);  // 29.9%
  assert.equal(isQuietHour(row, 10), false); // 정확히 30%는 「보」
  assert.equal(isQuietHour(row, 2), false);  // 0명은 운행하지 않는 때
});

test("지금 시간대가 한가하면 지금(0시간 뒤)을 돌려준다", () => {
  assert.deepEqual(nextQuietHour(row, kst(5, 30)), { hour: 5, inHours: 0, ratio: 0.1 });
});

test("지금이 붐비면 그 뒤로 처음 한가한 시간대를 고른다", () => {
  assert.deepEqual(nextQuietHour(row, kst(7, 59)), { hour: 11, inHours: 4, ratio: 0.299 });
  assert.equal(nextQuietHour(row, kst(12)).hour, 22);
});

test("자정과 운행하지 않는 시간대를 넘어 다음 날 아침까지 찾는다", () => {
  const r = nextQuietHour(fakeRow({ 5: 100, 8: 1000, 23: 900 }), kst(23, 10));
  assert.deepEqual(r, { hour: 5, inHours: 6, ratio: 0.1 });
});

test("KST로 시를 센다: UTC 23시는 KST 08시다", () => {
  assert.equal(nextQuietHour(row, new Date(Date.UTC(2026, 9, 16, 23, 0))).hour, 11);
});

test("한가한 시간대가 없으면 null", () => {
  assert.equal(nextQuietHour(fakeRow({}), kst(9)), null);
  assert.equal(nextQuietHour(fakeRow({ 8: 1000, 9: 900 }), kst(9)), null);
});

test("실제 데이터: 어느 시각에서 찾아도 고른 시간대는 한가하고, 그 사이 시간대는 한가하지 않다", () => {
  for (const r of rows) {
    for (let h = 0; h < 24; h++) {
      const got = nextQuietHour(r, kst(h));
      assert.ok(got, r.STTN);
      assert.equal(got.hour, (h + got.inHours) % 24);
      assert.ok(peakRatio(r, got.hour) < QUIET_RATIO && got.ratio === peakRatio(r, got.hour), `${r.STTN} ${h}시`);
      for (let k = 0; k < got.inHours; k++) assert.equal(isQuietHour(r, (h + k) % 24), false, `${r.STTN} ${h}시 +${k}`);
    }
  }
});

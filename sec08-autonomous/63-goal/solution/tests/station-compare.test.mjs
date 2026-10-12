import assert from "node:assert/strict";
import { test } from "node:test";
import { compareDaily } from "../station-compare.mjs";

test("합계·피크·더 많은 칸 수·차이가 가장 큰 칸", () => {
  const r = compareDaily([10, 50, 30, 0], [20, 10, 30, 0]);
  assert.deepEqual(r, { totalA: 90, totalB: 60, peakA: 1, peakB: 2, moreA: 1, moreB: 1, widest: 1 });
});

test("피크가 동률이면 앞 칸", () => {
  assert.equal(compareDaily([5, 9, 9], [1, 1, 1]).peakA, 1);
});

test("전부 0이면 피크 -1, 같은 값이면 widest -1", () => {
  const r = compareDaily([0, 0], [0, 0]);
  assert.equal(r.peakA, -1);
  assert.equal(r.widest, -1);
  assert.equal(r.moreA + r.moreB, 0);
});

test("시간대 수가 다르면 오류", () => {
  assert.throws(() => compareDaily([1, 2], [1]));
});

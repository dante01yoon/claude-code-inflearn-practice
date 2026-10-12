import assert from "node:assert/strict";
import { test } from "node:test";
import { compareDaily, compareSearch, findStationByName, readCompareParam } from "../station-compare.mjs";

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

test("주소의 compare 파라미터 읽기", () => {
  assert.deepEqual(readCompareParam("?compare=강남,홍대입구"), ["강남", "홍대입구"]);
  assert.deepEqual(readCompareParam("?compare=%EA%B0%95%EB%82%A8%2C%ED%99%8D%EB%8C%80%EC%9E%85%EA%B5%AC"), ["강남", "홍대입구"]);
  assert.deepEqual(readCompareParam("?compare= 강남 ,,"), ["강남"]);
  assert.deepEqual(readCompareParam("?x=1"), []);
});

test("compare만 바꾸고 다른 파라미터는 남긴다", () => {
  assert.equal(compareSearch("", ["강남", "홍대입구"]), `?compare=${encodeURIComponent("강남")},${encodeURIComponent("홍대입구")}`);
  assert.equal(compareSearch("?x=1&compare=a,b", ["c"]), "?x=1&compare=c");
  assert.equal(compareSearch("?compare=a,b", []), "");
  assert.deepEqual(readCompareParam(compareSearch("?x=1", ["잠실(송파구청)", "서울역"])), ["잠실(송파구청)", "서울역"]);
});

test("주소의 역 이름 찾기: 같은 이름, 부역명 뺀 이름만", () => {
  const entries = [{ name: "강남" }, { name: "강남구청" }, { name: "잠실(송파구청)" }];
  assert.equal(findStationByName(entries, "강남"), entries[0]);
  assert.equal(findStationByName(entries, "잠실"), entries[2]);
  assert.equal(findStationByName(entries, "잠실(송파구청)"), entries[2]);
  assert.equal(findStationByName(entries, "ㄱㄴ"), null);
  assert.equal(findStationByName(entries, "강"), null);
});

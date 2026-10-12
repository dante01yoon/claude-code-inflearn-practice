import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { choseong, searchStations } from "../station-search.mjs";
import { HOURS, total } from "../stats.mjs";
import { SUBWAY_CSV, decodeCsv, mergeStations, parseCsv, toSubwayRows } from "../subway-csv.mjs";

// 앱과 같은 검색 항목: 9월 CSV의 역(환승역은 합친 행 하나)과 하루 승하차 합(riders, 순위에만 쓰므로 한 달 합 그대로)
const entries = mergeStations(toSubwayRows(parseCsv(decodeCsv(readFileSync(SUBWAY_CSV)))))
  .map((m) => ({ name: m.STTN, riders: HOURS.reduce((a, h) => a + total(m, h), 0) }));
const names = (text, limit) => searchStations(entries, text, limit).map((e) => e.name);

test("음절의 초성을 구한다", () => {
  assert.equal(choseong("강"), "ㄱ");
  assert.equal(choseong("뚝"), "ㄸ");
  assert.equal(choseong("힣"), "ㅎ");
  assert.equal(choseong("ㄱ"), null);
  assert.equal(choseong("A"), null);
});

test("ㄱㄴ을 치면 강남이 맨 위에 나온다", () => {
  const found = names("ㄱㄴ");
  assert.equal(found[0], "강남");
  assert.ok(found.includes("가능"), "초성이 같은 다른 역도 나온다(승하차가 적어 뒤에)");
});

test("초성과 완성 글자를 섞어 써도 찾는다", () => {
  assert.equal(names("강ㄴ")[0], "강남");
  assert.equal(names("ㄱ남")[0], "강남");
  assert.ok(names("ㄱㅅㄷㅈㅌㄷㅈ").includes("가산디지털단지"));
});

test("초성은 가운데에서도 맞고, 앞부분 맞는 역이 먼저 나온다", () => {
  const found = names("ㄷㅈ", 100);
  assert.ok(found.includes("가산디지털단지"));
  const first = (pattern) => found.findIndex((n) => pattern.test(n));
  assert.ok(first(/^디지털|^당정|^도정/) <= found.indexOf("가산디지털단지"));
});

test("점수가 같으면 승하차가 많은 역, 그다음 이름순", () => {
  const list = [{ name: "가능", riders: 10 }, { name: "강남", riders: 99 }, { name: "고남" }];
  assert.deepEqual(searchStations(list, "ㄱㄴ").map((e) => e.name), ["강남", "가능", "고남"]);
  assert.deepEqual(searchStations([{ name: "나" }, { name: "가" }], "ㅏ").map((e) => e.name), []);
});

test("된소리 초성은 예사소리와 구분한다", () => {
  assert.ok(names("ㄸㅅ", 100).includes("뚝섬"));
  assert.ok(!names("ㄷㅅ", 100).includes("뚝섬"));
});

test("글자로 찾는 기존 동작은 그대로다", () => {
  assert.equal(names("강남")[0], "강남");
  assert.equal(names("가산")[0], "가산디지털단지");
  assert.deepEqual(names("  "), []);
  assert.deepEqual(names("없는역이름"), []);
});

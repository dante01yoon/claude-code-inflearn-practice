// 채점용 숨은 테스트 (클로드는 보지 못함). summary.mjs의 summarize(rows)를 검사한다.
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
const dir = process.env.TARGET;
const { summarize } = await import(dir + "/summary.mjs");
const real = JSON.parse(readFileSync(dir + "/data/snapshots.json", "utf8"));
const row = (t, lvl, min, max) => ({ place_code: "POI009", observed_at: t, congest_level: lvl, population_min: min, population_max: max });
test("1 실제 기록: 개수", () => assert.equal(summarize(real).count, real.length));
test("2 실제 기록: 마지막 기록", () => assert.equal(summarize(real).latest.observed_at, real[real.length - 1].observed_at));
test("3 순서가 섞여도 마지막 기록", () => {
  const r = [row("2026-10-12T05:20:00+00:00", "보통", 1, 2), row("2026-10-12T05:05:00+00:00", "여유", 1, 2), row("2026-10-12T05:10:00+00:00", "보통", 1, 2)];
  assert.equal(summarize(r).latest.observed_at, "2026-10-12T05:20:00+00:00");
});
test("4 시간대 표기가 달라도(+09:00 vs Z) 시각으로 비교", () => {
  const r = [row("2026-10-12T14:10:00+09:00", "보통", 1, 2), row("2026-10-12T05:20:00Z", "여유", 1, 2)];
  assert.equal(summarize(r).latest.observed_at, "2026-10-12T05:20:00Z");
});
test("5 가장 붐빈 기록 = 인구 가운데값 최대", () => {
  const r = [row("2026-10-12T05:05:00Z", "보통", 40000, 42000), row("2026-10-12T05:10:00Z", "약간 붐빔", 45000, 47000), row("2026-10-12T05:15:00Z", "보통", 30000, 60000)];
  assert.equal(summarize(r).peak.observed_at, "2026-10-12T05:10:00Z");
});
test("6 가운데값이 같으면 더 이른 기록", () => {
  const r = [row("2026-10-12T05:10:00Z", "보통", 40000, 42000), row("2026-10-12T05:05:00Z", "보통", 41000, 41000)];
  assert.equal(summarize(r).peak.observed_at, "2026-10-12T05:05:00Z");
});
test("7 인구 칸이 비면 peak 후보에서 빼되 개수는 셈", () => {
  const r = [row("2026-10-12T05:05:00Z", "붐빔", null, null), row("2026-10-12T05:10:00Z", "보통", 1000, 2000)];
  const s = summarize(r);
  assert.equal(s.count, 2);
  assert.equal(s.peak.observed_at, "2026-10-12T05:10:00Z");
});
test("8 빈 배열", () => {
  const s = summarize([]);
  assert.equal(s.count, 0);
  assert.equal(s.latest, null);
  assert.equal(s.peak, null);
});
test("9 levels는 4단계를 모두 갖고 없는 단계는 0", () => {
  const s = summarize([row("2026-10-12T05:05:00Z", "보통", 1, 2), row("2026-10-12T05:10:00Z", "혼잡", 1, 2)]);
  assert.deepEqual(Object.keys(s.levels).sort(), ["보통", "붐빔", "약간 붐빔", "여유"].sort());
  assert.equal(s.levels["보통"], 1);
  assert.equal(s.levels["여유"], 0);
});
test("10 입력 배열을 바꾸지 않음", () => {
  const r = [row("2026-10-12T05:20:00Z", "보통", 1, 2), row("2026-10-12T05:05:00Z", "여유", 1, 2)];
  const copy = JSON.parse(JSON.stringify(r));
  summarize(r);
  assert.deepEqual(r, copy);
});

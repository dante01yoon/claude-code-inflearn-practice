import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { summarize } from "./summary.mjs";

const row = (observed_at, congest_level, population_min, population_max) => ({
  place_code: "POI009",
  observed_at,
  congest_level,
  population_min,
  population_max,
});

const ZERO = { 여유: 0, 보통: 0, "약간 붐빔": 0, 붐빔: 0 };

test("빈 배열", () => {
  assert.deepEqual(summarize([]), { count: 0, latest: null, peak: null, levels: ZERO });
});

test("순서가 섞여 있어도 observed_at이 가장 늦은 기록이 latest", () => {
  const a = row("2026-10-12T05:05:00+00:00", "여유", 100, 200);
  const b = row("2026-10-12T05:45:00+00:00", "보통", 100, 200);
  const c = row("2026-10-12T05:20:00+00:00", "붐빔", 100, 200);
  assert.equal(summarize([b, a, c]).latest, b);
  assert.equal(summarize([a, c, b]).latest, b);
});

test("오프셋이 다르면 문자열이 아니라 실제 시각으로 비교", () => {
  const utc = row("2026-10-12T05:00:00+00:00", "보통", 1, 2);
  const kst = row("2026-10-12T13:30:00+09:00", "보통", 1, 2); // 04:30 UTC
  assert.equal(summarize([utc, kst]).latest, utc);
  assert.equal(summarize([kst, utc]).latest, utc);
});

test("peak는 (min+max)/2가 가장 큰 기록", () => {
  const a = row("2026-10-12T05:05:00+00:00", "보통", 10, 20); // 15
  const b = row("2026-10-12T05:10:00+00:00", "붐빔", 0, 100); // 50
  const c = row("2026-10-12T05:15:00+00:00", "보통", 40, 50); // 45
  assert.equal(summarize([a, b, c]).peak, b);
});

test("가운데값이 같으면 더 이른 기록이 peak (입력 순서와 무관)", () => {
  const early = row("2026-10-12T05:05:00+00:00", "보통", 40, 60);
  const late = row("2026-10-12T05:30:00+00:00", "보통", 30, 70);
  assert.equal(summarize([early, late]).peak, early);
  assert.equal(summarize([late, early]).peak, early);
});

test("인구 칸이 비어 있는 기록은 peak 후보에서 제외", () => {
  const empty = row("2026-10-12T05:05:00+00:00", "붐빔", null, null);
  const half = row("2026-10-12T05:10:00+00:00", "붐빔", 500, undefined);
  const blank = row("2026-10-12T05:12:00+00:00", "붐빔", "", "");
  const ok = row("2026-10-12T05:15:00+00:00", "보통", 1, 3);
  const result = summarize([empty, half, blank, ok]);
  assert.equal(result.peak, ok);
  assert.equal(result.count, 4);
});

test("인구 칸이 모두 비어 있으면 peak는 null, latest는 그대로", () => {
  const a = row("2026-10-12T05:05:00+00:00", "여유", null, null);
  const b = row("2026-10-12T05:10:00+00:00", "여유", null, null);
  const result = summarize([a, b]);
  assert.equal(result.peak, null);
  assert.equal(result.latest, b);
});

test("levels는 네 단계별 횟수이고 없는 단계는 0", () => {
  const rows = [
    row("2026-10-12T05:05:00+00:00", "보통", 1, 2),
    row("2026-10-12T05:10:00+00:00", "붐빔", 1, 2),
    row("2026-10-12T05:15:00+00:00", "보통", 1, 2),
    row("2026-10-12T05:20:00+00:00", "약간 붐빔", 1, 2),
  ];
  assert.deepEqual(summarize(rows).levels, { 여유: 0, 보통: 2, "약간 붐빔": 1, 붐빔: 1 });
});

test("입력 배열을 바꾸지 않는다", () => {
  const rows = [
    row("2026-10-12T05:45:00+00:00", "보통", 1, 2),
    row("2026-10-12T05:05:00+00:00", "보통", 1, 2),
  ];
  const copy = structuredClone(rows);
  summarize(rows);
  assert.deepEqual(rows, copy);
});

test("data/snapshots.json", () => {
  const rows = JSON.parse(readFileSync(new URL("./data/snapshots.json", import.meta.url), "utf8"));
  const result = summarize(rows);
  assert.equal(result.count, 6);
  assert.equal(result.latest.observed_at, "2026-10-12T05:45:00+00:00");
  assert.equal(result.peak.observed_at, "2026-10-12T05:05:00+00:00"); // 전부 43000이라 가장 이른 것
  assert.deepEqual(result.levels, { ...ZERO, 보통: 6 });
});

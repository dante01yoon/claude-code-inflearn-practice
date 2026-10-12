import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarize } from './summary.mjs';

const row = (observed_at, congest_level, population_min, population_max) => ({
  place_code: 'POI009',
  observed_at,
  congest_level,
  population_min,
  population_max,
});

test('data/snapshots.json 실제 기록', () => {
  const rows = JSON.parse(readFileSync(new URL('./data/snapshots.json', import.meta.url)));
  const result = summarize(rows);
  assert.equal(result.count, 6);
  assert.equal(result.latest.observed_at, '2026-10-12T05:45:00+00:00');
  // 가운데값이 모두 같으므로 가장 이른 기록
  assert.equal(result.peak.observed_at, '2026-10-12T05:05:00+00:00');
  assert.deepEqual(result.levels, { 여유: 0, 보통: 6, '약간 붐빔': 0, 붐빔: 0 });
});

test('기록 순서가 섞여 있어도 결과가 같다', () => {
  const a = row('2026-10-12T05:00:00+00:00', '여유', 10, 20);
  const b = row('2026-10-12T05:10:00+00:00', '붐빔', 90, 100);
  const c = row('2026-10-12T05:20:00+00:00', '붐빔', 90, 100);
  const d = row('2026-10-12T05:30:00+00:00', '보통', 30, 40);
  const result = summarize([d, c, a, b]);
  assert.equal(result.latest, d);
  assert.equal(result.peak, b); // b와 c가 같으면 더 이른 b
  assert.deepEqual(result.levels, { 여유: 1, 보통: 1, '약간 붐빔': 0, 붐빔: 2 });
});

test('peak는 최댓값이 아니라 (min+max)/2 기준', () => {
  const wide = row('2026-10-12T05:00:00+00:00', '보통', 0, 100000); // 50000
  const narrow = row('2026-10-12T05:05:00+00:00', '보통', 49000, 52000); // 50500
  assert.equal(summarize([wide, narrow]).peak, narrow);
});

test('인구 칸이 비어 있으면 peak 후보에서 제외, 나머지 집계에는 포함', () => {
  const empty = row('2026-10-12T05:30:00+00:00', '붐빔', null, null);
  const onlyMin = row('2026-10-12T05:20:00+00:00', '붐빔', 99999, undefined);
  const blank = row('2026-10-12T05:10:00+00:00', '붐빔', '', '');
  const zero = row('2026-10-12T05:00:00+00:00', '여유', 0, 0);
  const result = summarize([empty, onlyMin, blank, zero]);
  assert.equal(result.count, 4);
  assert.equal(result.latest, empty);
  assert.equal(result.peak, zero); // 0명은 빈 값이 아니라 실제 값
  assert.deepEqual(result.levels, { 여유: 1, 보통: 0, '약간 붐빔': 0, 붐빔: 3 });
});

test('인구 칸이 전부 비면 peak는 null', () => {
  const rows = [row('2026-10-12T05:00:00+00:00', '보통', null, null)];
  assert.equal(summarize(rows).peak, null);
});

test('오프셋이 달라도 실제 시각으로 비교한다', () => {
  const kst = row('2026-10-12T14:00:00+09:00', '보통', 10, 10); // 05:00Z
  const utc = row('2026-10-12T05:30:00+00:00', '보통', 10, 10); // 05:30Z
  const result = summarize([utc, kst]);
  assert.equal(result.latest, utc); // 문자열 비교였다면 kst가 뽑힌다
  assert.equal(result.peak, kst); // 같은 가운데값이면 실제로 더 이른 kst
});

test('빈 배열', () => {
  assert.deepEqual(summarize([]), {
    count: 0,
    latest: null,
    peak: null,
    levels: { 여유: 0, 보통: 0, '약간 붐빔': 0, 붐빔: 0 },
  });
});

test('입력 배열을 바꾸지 않는다', () => {
  const rows = [
    row('2026-10-12T05:10:00+00:00', '보통', 1, 2),
    row('2026-10-12T05:00:00+00:00', '여유', 1, 2),
  ];
  const before = structuredClone(rows);
  summarize(rows);
  assert.deepEqual(rows, before);
});

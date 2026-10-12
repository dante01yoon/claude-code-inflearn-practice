import { test } from 'node:test';
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

test('빈 배열', () => {
  assert.deepEqual(summarize([]), {
    count: 0,
    latest: null,
    peak: null,
    levels: { 여유: 0, 보통: 0, '약간 붐빔': 0, 붐빔: 0 },
  });
});

test('순서가 섞여 있어도 latest는 observed_at 기준', () => {
  const a = row('2026-10-12T05:05:00+00:00', '여유', 100, 200);
  const b = row('2026-10-12T05:45:00+00:00', '보통', 100, 200);
  const c = row('2026-10-12T05:20:00+00:00', '붐빔', 100, 200);
  assert.equal(summarize([c, b, a]).latest, b);
});

test('오프셋이 다른 시각도 실제 시각으로 비교', () => {
  const a = row('2026-10-12T14:00:00+09:00', '보통', 1, 1); // 05:00Z
  const b = row('2026-10-12T05:30:00+00:00', '보통', 1, 1);
  assert.equal(summarize([b, a]).latest, b);
});

test('peak는 가운데값 최대, 동률이면 더 이른 기록', () => {
  const early = row('2026-10-12T05:05:00+00:00', '붐빔', 90, 110); // 100
  const late = row('2026-10-12T05:50:00+00:00', '붐빔', 80, 120); // 100
  const low = row('2026-10-12T05:20:00+00:00', '여유', 10, 20);
  assert.equal(summarize([late, low, early]).peak, early);
  assert.equal(summarize([early, low, late]).peak, early);
});

test('인구 칸이 빈 기록은 peak에서 제외(0으로 취급하지 않음)', () => {
  const empty1 = row('2026-10-12T05:05:00+00:00', '여유', null, null);
  const empty2 = row('2026-10-12T05:10:00+00:00', '여유', '', '');
  const half = row('2026-10-12T05:15:00+00:00', '여유', 500, undefined);
  const ok = row('2026-10-12T05:20:00+00:00', '보통', 0, 2);
  const result = summarize([empty1, empty2, half, ok]);
  assert.equal(result.peak, ok);
  assert.equal(summarize([empty1, empty2, half]).peak, null);
  // 인구가 비어도 count, levels, latest에는 포함
  assert.equal(result.count, 4);
  assert.equal(result.levels['여유'], 3);
  assert.equal(result.latest, ok);
});

test('levels는 네 단계 횟수', () => {
  const rows = [
    row('2026-10-12T05:05:00+00:00', '여유', 1, 2),
    row('2026-10-12T05:10:00+00:00', '붐빔', 1, 2),
    row('2026-10-12T05:15:00+00:00', '붐빔', 1, 2),
    row('2026-10-12T05:20:00+00:00', '약간 붐빔', 1, 2),
  ];
  assert.deepEqual(summarize(rows).levels, { 여유: 1, 보통: 0, '약간 붐빔': 1, 붐빔: 2 });
});

test('data/snapshots.json', () => {
  const rows = JSON.parse(readFileSync(new URL('./data/snapshots.json', import.meta.url), 'utf8'));
  const result = summarize(rows);
  assert.equal(result.count, 6);
  assert.equal(result.latest.observed_at, '2026-10-12T05:45:00+00:00');
  assert.equal(result.peak.observed_at, '2026-10-12T05:05:00+00:00');
  assert.deepEqual(result.levels, { 여유: 0, 보통: 6, '약간 붐빔': 0, 붐빔: 0 });
});

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

test('실제 기록 요약', () => {
  const rows = JSON.parse(readFileSync(new URL('./data/snapshots.json', import.meta.url), 'utf8'));
  const s = summarize(rows);
  assert.equal(s.count, 6);
  assert.equal(s.latest.observed_at, '2026-10-12T05:45:00+00:00');
  assert.equal(s.peak.observed_at, '2026-10-12T05:05:00+00:00');
  assert.deepEqual(s.levels, { 여유: 0, 보통: 6, '약간 붐빔': 0, 붐빔: 0 });
});

test('순서가 섞여 있어도 latest·peak를 찾고 같은 값이면 더 이른 기록이 peak', () => {
  const rows = [
    row('2026-10-12T05:20:00+00:00', '붐빔', 100, 200),
    row('2026-10-12T05:40:00+00:00', '약간 붐빔', 150, 250),
    row('2026-10-12T05:05:00+00:00', '여유', 100, 300),
    row('2026-10-12T05:50:00+00:00', '보통', 10, 20),
  ];
  const s = summarize(rows);
  assert.equal(s.latest, rows[3]);
  assert.equal(s.peak, rows[2]);
  assert.deepEqual(s.levels, { 여유: 1, 보통: 1, '약간 붐빔': 1, 붐빔: 1 });
});

test('인구 칸이 비면 peak에서 제외하되 count·levels·latest에는 포함', () => {
  const rows = [
    row('2026-10-12T05:10:00+00:00', '보통', 10, 20),
    row('2026-10-12T05:30:00+00:00', '붐빔', null, null),
    row('2026-10-12T05:20:00+00:00', '붐빔', '', 900),
    row('2026-10-12T05:25:00+00:00', '붐빔', undefined, undefined),
  ];
  const s = summarize(rows);
  assert.equal(s.count, 4);
  assert.equal(s.latest, rows[1]);
  assert.equal(s.peak, rows[0]);
  assert.equal(s.levels['붐빔'], 3);
});

test('시간대 오프셋이 달라도 실제 시각으로 비교', () => {
  const rows = [
    row('2026-10-12T14:30:00+09:00', '보통', 1, 1), // 05:30Z
    row('2026-10-12T05:10:00+00:00', '보통', 1, 1),
  ];
  assert.equal(summarize(rows).latest, rows[0]);
});

test('빈 배열 또는 인구값이 전혀 없으면 latest·peak는 null', () => {
  assert.deepEqual(summarize([]), {
    count: 0,
    latest: null,
    peak: null,
    levels: { 여유: 0, 보통: 0, '약간 붐빔': 0, 붐빔: 0 },
  });
  const only = row('2026-10-12T05:00:00+00:00', '여유', null, null);
  const s = summarize([only]);
  assert.equal(s.latest, only);
  assert.equal(s.peak, null);
});

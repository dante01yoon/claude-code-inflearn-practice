import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { summarize } from './summary.mjs';

const row = (observed_at, congest_level, population_min, population_max) => ({
  place_code: 'POI009',
  observed_at,
  congest_level,
  population_min,
  population_max,
});

const NO_LEVELS = { 여유: 0, 보통: 0, '약간 붐빔': 0, 붐빔: 0 };

test('data/snapshots.json 실제 기록 6행', () => {
  const rows = JSON.parse(readFileSync(new URL('./data/snapshots.json', import.meta.url), 'utf8'));
  const { count, latest, peak, levels } = summarize(rows);

  assert.equal(count, 6);
  assert.equal(latest.observed_at, '2026-10-12T05:45:00+00:00');
  assert.equal(peak.observed_at, '2026-10-12T05:05:00+00:00'); // 가운데값이 전부 43000이라 가장 이른 기록
  assert.deepEqual(levels, { ...NO_LEVELS, 보통: 6 });
});

test('기록 순서가 섞여 있어도 observed_at 기준으로 latest를 고른다', () => {
  const rows = [
    row('2026-10-12T05:20:00+00:00', '약간 붐빔', 45000, 47000),
    row('2026-10-12T05:45:00+00:00', '보통', 40000, 42000),
    row('2026-10-12T05:00:00+00:00', '여유', 10000, 12000),
    row('2026-10-12T05:30:00+00:00', '붐빔', 50000, 52000),
  ];
  const result = summarize(rows);

  assert.equal(result.count, 4);
  assert.equal(result.latest, rows[1]);
  assert.equal(result.peak, rows[3]);
  assert.deepEqual(result.levels, { 여유: 1, 보통: 1, '약간 붐빔': 1, 붐빔: 1 });
});

test('peak는 max나 min이 아니라 (min+max)/2가 가장 큰 기록', () => {
  const rows = [
    row('2026-10-12T05:00:00+00:00', '붐빔', 1000, 9000), // 가운데값 5000, max가 가장 큼
    row('2026-10-12T05:05:00+00:00', '붐빔', 6000, 8000), // 가운데값 7000
    row('2026-10-12T05:10:00+00:00', '붐빔', 6500, 6600), // 가운데값 6550, min이 가장 큼
  ];

  assert.equal(summarize(rows).peak, rows[1]);
});

test('가운데값이 같으면 배열 순서와 상관없이 observed_at이 더 이른 기록', () => {
  const rows = [
    row('2026-10-12T05:40:00+00:00', '보통', 41000, 43000),
    row('2026-10-12T05:10:00+00:00', '보통', 40000, 44000), // 셋 다 42000, 이 기록이 가장 이름
    row('2026-10-12T05:25:00+00:00', '보통', 41500, 42500),
  ];

  assert.equal(summarize(rows).peak, rows[1]);
});

test('UTC 오프셋이 달라도 실제 시각 순서로 비교한다', () => {
  const rows = [
    row('2026-10-12T14:00:00+09:00', '보통', 40000, 44000), // 05:00Z
    row('2026-10-12T06:00:00+00:00', '보통', 41000, 43000), // 06:00Z, 가운데값은 같음
  ];
  const result = summarize(rows);

  assert.equal(result.latest, rows[1]);
  assert.equal(result.peak, rows[0]);
});

test('observed_at을 해석할 수 없는 기록은 latest가 되지 못하고 동률에서도 진다', () => {
  const rows = [
    row('not a date', '보통', 40000, 44000), // 가운데값 42000, 시각 불명
    row('2026-10-12T05:00:00+00:00', '보통', 41000, 43000), // 가운데값 42000
    row(undefined, '보통', 10000, 12000),
  ];

  for (const order of [rows, [...rows].reverse()]) {
    const result = summarize(order);
    assert.equal(result.count, 3);
    assert.equal(result.latest, rows[1]);
    assert.equal(result.peak, rows[1]);
  }
  assert.equal(summarize([rows[0], rows[2]]).latest, null);
});

test('인구 칸이 빈 기록은 peak 후보에서 빼고 count와 levels에는 센다', () => {
  const rows = [
    row('2026-10-12T05:00:00+00:00', '붐빔', null, null),
    { place_code: 'POI009', observed_at: '2026-10-12T05:05:00+00:00', congest_level: '붐빔' }, // 키 자체가 없음
    row('2026-10-12T05:10:00+00:00', '여유', 0, 0), // 0은 빈 값이 아니다
    row('2026-10-12T05:15:00+00:00', '붐빔', '', ''),
    row('2026-10-12T05:20:00+00:00', '붐빔', 90000, null), // 한쪽만 비면 가운데값을 못 구한다
  ];
  const result = summarize(rows);

  assert.equal(result.count, 5);
  assert.equal(result.latest, rows[4]);
  assert.equal(result.peak, rows[2]);
  assert.deepEqual(result.levels, { ...NO_LEVELS, 여유: 1, 붐빔: 4 });
});

test('인구 칸이 전부 비어 있으면 peak는 null', () => {
  const rows = [row('2026-10-12T05:00:00+00:00', '보통', null, null)];
  const result = summarize(rows);

  assert.equal(result.peak, null);
  assert.equal(result.latest, rows[0]);
});

test('빈 배열', () => {
  assert.deepEqual(summarize([]), { count: 0, latest: null, peak: null, levels: NO_LEVELS });
});

test('네 단계가 아닌 congest_level은 levels에 세지 않는다', () => {
  const rows = [
    row('2026-10-12T05:00:00+00:00', '알 수 없음', 1000, 2000),
    row('2026-10-12T05:05:00+00:00', undefined, 1000, 2000),
    row('2026-10-12T05:10:00+00:00', 'toString', 1000, 2000),
    row('2026-10-12T05:15:00+00:00', '__proto__', 1000, 2000),
  ];
  const result = summarize(rows);

  assert.equal(result.count, 4);
  assert.deepEqual(result.levels, NO_LEVELS);
});

test('입력 배열을 바꾸지 않는다', () => {
  const rows = [
    row('2026-10-12T05:10:00+00:00', '붐빔', 3000, 4000),
    row('2026-10-12T05:00:00+00:00', '여유', 1000, 2000),
  ];
  const before = structuredClone(rows);
  summarize(rows);

  assert.deepEqual(rows, before);
});

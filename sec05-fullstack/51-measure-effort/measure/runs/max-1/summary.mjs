const LEVELS = ['여유', '보통', '약간 붐빔', '붐빔'];

// 빈 칸(null, undefined, 빈 문자열)은 0이 아니라 "값 없음"이다.
function toNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

// min, max 둘 다 있어야 가운데값을 구할 수 있다.
function midpointOf(row) {
  const min = toNumber(row.population_min);
  const max = toNumber(row.population_max);
  return min === null || max === null ? null : (min + max) / 2;
}

// 문자열로 비교하면 UTC 오프셋이 다를 때 틀리므로 시각(ms)으로 바꾼다. 해석할 수 없으면 null.
function timeOf(row) {
  const time = Date.parse(row.observed_at);
  return Number.isNaN(time) ? null : time;
}

// 시각을 알 수 없는 기록(null)은 가장 늦은 것으로 친다.
function isEarlier(a, b) {
  return a !== null && (b === null || a < b);
}

// 가운데값이 크면 이기고, 같으면 더 이른 기록이 이긴다.
function beatsPeak(mid, time, peak) {
  if (peak === null || mid > peak.mid) return true;
  return mid === peak.mid && isEarlier(time, peak.time);
}

export function summarize(rows) {
  const levels = Object.fromEntries(LEVELS.map((level) => [level, 0]));
  let latest = null;
  let peak = null;

  for (const row of rows) {
    if (Object.hasOwn(levels, row.congest_level)) levels[row.congest_level] += 1;

    // 입력 순서가 섞여 있을 수 있어서 배열 위치가 아니라 observed_at으로 가른다.
    const time = timeOf(row);
    if (time !== null && (latest === null || time > latest.time)) latest = { row, time };

    const mid = midpointOf(row);
    if (mid !== null && beatsPeak(mid, time, peak)) peak = { row, time, mid };
  }

  return { count: rows.length, latest: latest?.row ?? null, peak: peak?.row ?? null, levels };
}

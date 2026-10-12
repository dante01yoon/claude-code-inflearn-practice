const LEVELS = ['여유', '보통', '약간 붐빔', '붐빔'];

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function midpoint(row) {
  const min = toNumber(row.population_min);
  const max = toNumber(row.population_max);
  if (min === null || max === null) return null;
  return (min + max) / 2;
}

export function summarize(rows) {
  const levels = Object.fromEntries(LEVELS.map((level) => [level, 0]));
  let latest = null;
  let latestTime = -Infinity;
  let peak = null;
  let peakMid = -Infinity;
  let peakTime = Infinity;

  for (const row of rows) {
    if (row.congest_level in levels) levels[row.congest_level] += 1;

    const time = Date.parse(row.observed_at);

    if (!Number.isNaN(time) && (latest === null || time > latestTime)) {
      latest = row;
      latestTime = time;
    }

    const mid = midpoint(row);
    if (mid === null) continue;
    // 같은 가운데값이면 더 이른 기록이 peak
    if (mid > peakMid || (mid === peakMid && time < peakTime)) {
      peak = row;
      peakMid = mid;
      peakTime = Number.isNaN(time) ? Infinity : time;
    }
  }

  return { count: rows.length, latest, peak, levels };
}

const LEVELS = ['여유', '보통', '약간 붐빔', '붐빔'];

const toNumber = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const toTime = (v) => {
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : t;
};

export function summarize(rows) {
  const levels = Object.fromEntries(LEVELS.map((l) => [l, 0]));
  let latest = null;
  let latestTime = -Infinity;
  let peak = null;
  let peakMid = -Infinity;
  let peakTime = Infinity;

  for (const row of rows) {
    if (row.congest_level in levels) levels[row.congest_level] += 1;

    const time = toTime(row.observed_at);
    if (time !== null && time > latestTime) {
      latest = row;
      latestTime = time;
    }

    const min = toNumber(row.population_min);
    const max = toNumber(row.population_max);
    if (min === null || max === null) continue;
    const mid = (min + max) / 2;
    const t = time ?? Infinity;
    if (mid > peakMid || (mid === peakMid && t < peakTime)) {
      peak = row;
      peakMid = mid;
      peakTime = t;
    }
  }

  return { count: rows.length, latest, peak, levels };
}

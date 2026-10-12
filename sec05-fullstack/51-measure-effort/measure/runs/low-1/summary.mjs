const LEVELS = ['여유', '보통', '약간 붐빔', '붐빔'];

const toNumber = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const midpoint = (row) => {
  const min = toNumber(row.population_min);
  const max = toNumber(row.population_max);
  return min === null || max === null ? null : (min + max) / 2;
};

export function summarize(rows) {
  const levels = Object.fromEntries(LEVELS.map((l) => [l, 0]));
  let latest = null;
  let latestTime = -Infinity;
  let peak = null;
  let peakValue = -Infinity;
  let peakTime = Infinity;

  for (const row of rows) {
    if (row.congest_level in levels) levels[row.congest_level] += 1;

    const time = Date.parse(row.observed_at);

    if (!Number.isNaN(time) && time > latestTime) {
      latest = row;
      latestTime = time;
    }

    const mid = midpoint(row);
    if (mid === null) continue;
    const t = Number.isNaN(time) ? Infinity : time;
    if (mid > peakValue || (mid === peakValue && t < peakTime)) {
      peak = row;
      peakValue = mid;
      peakTime = t;
    }
  }

  return { count: rows.length, latest, peak, levels };
}

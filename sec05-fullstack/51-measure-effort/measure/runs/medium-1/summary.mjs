const LEVELS = ['여유', '보통', '약간 붐빔', '붐빔'];

function midpoint(row) {
  const { population_min: min, population_max: max } = row;
  if (min == null || max == null || min === '' || max === '') return null;
  const mid = (Number(min) + Number(max)) / 2;
  return Number.isFinite(mid) ? mid : null;
}

export function summarize(rows) {
  const levels = Object.fromEntries(LEVELS.map((name) => [name, 0]));
  let latest = null;
  let latestTime = -Infinity;
  let peak = null;
  let peakMid = -Infinity;
  let peakTime = Infinity;

  for (const row of rows) {
    if (row.congest_level in levels) levels[row.congest_level] += 1;

    const time = Date.parse(row.observed_at);

    if (latest === null || time > latestTime) {
      latest = row;
      latestTime = time;
    }

    const mid = midpoint(row);
    if (mid !== null && (mid > peakMid || (mid === peakMid && time < peakTime))) {
      peak = row;
      peakMid = mid;
      peakTime = time;
    }
  }

  return { count: rows.length, latest, peak, levels };
}

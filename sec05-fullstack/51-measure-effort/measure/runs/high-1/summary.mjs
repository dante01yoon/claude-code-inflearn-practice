const LEVELS = ['여유', '보통', '약간 붐빔', '붐빔'];

// 비어 있는 값(null, undefined, 빈 문자열)은 0이 아니라 NaN으로 취급한다.
function toNumber(value) {
  if (value == null || (typeof value === 'string' && value.trim() === '')) return NaN;
  return Number(value);
}

function midpoint(row) {
  const min = toNumber(row.population_min);
  const max = toNumber(row.population_max);
  return (min + max) / 2; // 둘 중 하나라도 비면 NaN
}

// ISO 8601 오프셋이 달라도 같은 기준(ms)으로 비교한다.
function timeOf(row) {
  return Date.parse(row.observed_at);
}

export function summarize(rows) {
  const levels = Object.fromEntries(LEVELS.map((level) => [level, 0]));
  let latest = null;
  let latestTime = -Infinity;
  let peak = null;
  let peakValue = -Infinity;
  let peakTime = Infinity;

  for (const row of rows) {
    if (Object.hasOwn(levels, row.congest_level)) levels[row.congest_level] += 1;

    const time = timeOf(row);
    if (!Number.isNaN(time) && time > latestTime) {
      latest = row;
      latestTime = time;
    }

    const value = midpoint(row);
    if (Number.isNaN(value)) continue;
    // 기록 순서가 섞여 있으므로 동률일 때는 순서가 아니라 observed_at으로 더 이른 쪽을 고른다.
    const earlier = !Number.isNaN(time) && time < peakTime;
    if (value > peakValue || (value === peakValue && earlier)) {
      peak = row;
      peakValue = value;
      peakTime = Number.isNaN(time) ? Infinity : time;
    }
  }

  return { count: rows.length, latest, peak, levels };
}

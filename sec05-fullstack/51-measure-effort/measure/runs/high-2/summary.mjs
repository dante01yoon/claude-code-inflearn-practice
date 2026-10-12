const LEVELS = ['여유', '보통', '약간 붐빔', '붐빔'];

const timeOf = (row) => Date.parse(row.observed_at);

// 인구 칸이 비었거나(null·undefined·빈 문자열) 숫자가 아니면 null
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
    if (value === null) continue;
    // 같은 가운데값이면 더 이른 기록이 peak (시각을 알 수 없으면 먼저 나온 기록 유지)
    if (value > peakValue || (value === peakValue && time < peakTime)) {
      peak = row;
      peakValue = value;
      peakTime = Number.isNaN(time) ? Infinity : time;
    }
  }

  return { count: rows.length, latest, peak, levels };
}

const LEVELS = ["여유", "보통", "약간 붐빔", "붐빔"];

// 빈 칸(null·undefined·"")을 0으로 읽지 않도록 숫자가 아니면 null을 돌려준다.
function toNumber(value) {
  if (typeof value === "string" && value.trim() !== "") value = Number(value);
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function midpoint(row) {
  const min = toNumber(row.population_min);
  const max = toNumber(row.population_max);
  return min === null || max === null ? null : (min + max) / 2;
}

export function summarize(rows) {
  const levels = Object.fromEntries(LEVELS.map((level) => [level, 0]));
  let latest = null;
  let latestTime = -Infinity;
  let peak = null;
  let peakValue = -Infinity;
  let peakTime = NaN;

  for (const row of rows) {
    if (Object.hasOwn(levels, row.congest_level)) levels[row.congest_level] += 1;

    // 오프셋이 달라도 같은 기준으로 비교하려고 문자열 대신 시각으로 비교한다.
    const time = Date.parse(row.observed_at);
    if (time > latestTime) {
      latest = row;
      latestTime = time;
    }

    const value = midpoint(row);
    if (value === null) continue;
    if (value > peakValue || (value === peakValue && time < peakTime)) {
      peak = row;
      peakValue = value;
      peakTime = time;
    }
  }

  return { count: rows.length, latest, peak, levels };
}

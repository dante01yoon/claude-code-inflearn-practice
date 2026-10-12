const LEVELS = ['여유', '보통', '약간 붐빔', '붐빔'];

// null·undefined·빈 문자열은 0이 아니라 "값 없음"으로 취급한다.
function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function midpoint(row) {
  const min = toNumber(row.population_min);
  const max = toNumber(row.population_max);
  return min === null || max === null ? null : (min + max) / 2;
}

// 오프셋이 다른 기록도 비교할 수 있도록 epoch 밀리초로 바꾼다.
function timeOf(row) {
  const time = Date.parse(row.observed_at);
  return Number.isNaN(time) ? null : time;
}

export function summarize(rows) {
  const levels = Object.fromEntries(LEVELS.map((level) => [level, 0]));
  let latest = null;
  let latestTime = -Infinity;
  let peak = null;
  let peakMid = -Infinity;
  let peakTime = Infinity;

  for (const row of rows) {
    if (Object.hasOwn(levels, row.congest_level)) levels[row.congest_level] += 1;

    const time = timeOf(row);
    if (time !== null && time > latestTime) {
      latest = row;
      latestTime = time;
    }

    const mid = midpoint(row);
    if (mid === null) continue;
    // 가운데값이 같으면 더 이른 기록. 시각을 읽을 수 없는 기록은 가장 늦은 것으로 본다.
    const rowTime = time ?? Infinity;
    if (mid > peakMid || (mid === peakMid && rowTime < peakTime)) {
      peak = row;
      peakMid = mid;
      peakTime = rowTime;
    }
  }

  return { count: rows.length, latest, peak, levels };
}

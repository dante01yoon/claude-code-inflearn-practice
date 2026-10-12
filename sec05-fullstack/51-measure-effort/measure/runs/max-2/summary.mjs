const LEVELS = ['여유', '보통', '약간 붐빔', '붐빔'];

// 빈 칸(null, undefined, '')은 NaN으로 돌려준다.
// Number(null)과 Number('')는 0이라서, 그대로 쓰면 빈 칸이 인구 0으로 읽힌다.
function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
}

/**
 * 붐빔 기록 배열을 요약한다. 기록 순서는 상관없고, 입력 배열은 바꾸지 않는다.
 *
 * - count: 기록 수
 * - latest: observed_at이 가장 늦은 기록 (없으면 null)
 * - peak: 인구 가운데값 (min+max)/2가 가장 큰 기록. 같으면 observed_at이 더 이른 쪽.
 *   min이나 max가 비어 있는 기록은 후보에서 빠진다. 후보가 없으면 null.
 * - levels: 여유·보통·약간 붐빔·붐빔 각각의 횟수. 없는 등급은 0.
 *
 * @param {Array<object>} rows
 */
export function summarize(rows) {
  const levels = Object.fromEntries(LEVELS.map((level) => [level, 0]));
  let latest = null;
  let latestTime = 0;
  let peak = null;
  let peakMid = 0;
  let peakTime = 0;

  for (const row of rows) {
    if (LEVELS.includes(row.congest_level)) levels[row.congest_level] += 1;

    // 문자열이 아니라 시각(ms)으로 비교한다. 오프셋이 다른 기록이 섞여도 순서가 맞다.
    const time = Date.parse(row.observed_at);
    if (!Number.isNaN(time) && (latest === null || time > latestTime)) {
      latest = row;
      latestTime = time;
    }

    const mid = (toNumber(row.population_min) + toNumber(row.population_max)) / 2;
    if (Number.isFinite(mid)) {
      // 가운데값이 같으면 시각이 더 이른 기록이 이긴다. 시각을 모르는 기록은 가장 늦은 것으로 본다.
      const when = Number.isNaN(time) ? Infinity : time;
      if (peak === null || mid > peakMid || (mid === peakMid && when < peakTime)) {
        peak = row;
        peakMid = mid;
        peakTime = when;
      }
    }
  }

  return { count: rows.length, latest, peak, levels };
}

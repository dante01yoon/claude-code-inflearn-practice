// 역 요약 카드에 쓰는 계산. 브라우저(index.html)와 테스트가 함께 쓴다.

// 운행 하루는 04시에 시작해서 다음 날 03시에 끝난다.
export const HOURS = [...Array(24)].map((_, i) => (i + 4) % 24);

// kind는 "ON"(승차) 또는 "OFF"(하차)
export const count = (row, h, kind) => row[`HR_${h}_GET_${kind}_NOPE`];
export const total = (row, h) => count(row, h, "ON") + count(row, h, "OFF");

// value가 가장 앞서는(better) 시간대를 모두 HOURS 순서로 돌려준다. 동률이면 여러 개다.
function bestHours(hours, value, better) {
  let best = [];
  for (const h of hours) {
    if (!best.length || better(value(h), value(best[0]))) best = [h];
    else if (value(h) === value(best[0])) best.push(h);
  }
  return best;
}

export const busiestHours = (row, kind) => bestHours(HOURS, (h) => count(row, h, kind), (a, b) => a > b);

// "가장 한가한 때"를 찾는 시간 창 프리셋. hours는 HOURS 순서의 시간대다(06–09시대 = 6·7·8·9시).
export const WINDOW_PRESETS = [
  { id: "morning", label: "출근", hours: [6, 7, 8, 9] },
  { id: "day", label: "낮", hours: [10, 11, 12, 13, 14, 15] },
  { id: "evening", label: "퇴근", hours: [16, 17, 18, 19] },
  { id: "night", label: "저녁", hours: [20, 21, 22, 23] },
];
export const DEFAULT_WINDOW_ID = "day";

// 시간 창(hours) 안에서 승하차가 가장 적은 시간대를 모두 돌려준다. 동률이면 여러 개다.
// 승하차가 0명인 시간대는 운행하지 않는 때라서 후보에서 뺀다. 창 안이 전부 0이면 []다.
// 자정을 넘는 창은 [22, 23, 0, 1]처럼 HOURS 순서로 넘긴다.
export const quietestInWindow = (row, hours) =>
  bestHours(hours.filter((h) => total(row, h) > 0), (h) => total(row, h), (a, b) => a < b);

// 그 시간대 승하차 ÷ 그 역의 하루 전체 최댓값(0~1). 하루 내내 0이면 0이다.
export function peakRatio(row, h) {
  const peak = Math.max(...HOURS.map((x) => total(row, x)));
  return peak > 0 ? total(row, h) / peak : 0;
}

// 데이터 기준 달. USE_MM("202607")을 읽어 연·월·그 달의 일수와 표시 문구를 돌려준다.
// 형식이 맞지 않으면 null이다.
export function usageMonth(row) {
  const m = /^(\d{4})(\d{2})$/.exec(String(row.USE_MM ?? ""));
  if (!m) return null;
  const year = Number(m[1]), month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year, month, days: new Date(year, month, 0).getDate(), label: `${year}년 ${month}월` };
}

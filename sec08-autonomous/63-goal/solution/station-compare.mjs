// 두 역 비교(subway.html의 「두 역 비교」 그래프). a·b는 HOURS 순서의 시간대별 값(하루 평균 승차+하차)이다.

// 가장 큰 값의 칸 번호. 동률이면 앞 칸이다. 전부 0이면 -1이다.
const argMax = (xs) => xs.reduce((best, v, i) => (v > 0 && (best < 0 || v > xs[best]) ? i : best), -1);

// 하루 합계, 각 역 피크 칸, 어느 역이 더 많은 칸 수, 차이가 가장 큰 칸을 돌려준다.
// 둘 다 0인 칸(운행하지 않는 때)은 어느 쪽에도 세지 않는다. 차이가 전부 0이면 widest는 -1이다.
export function compareDaily(a, b) {
  if (a.length !== b.length) throw new Error("두 역의 시간대 수가 다릅니다");
  const sum = (xs) => xs.reduce((s, v) => s + v, 0);
  const gaps = a.map((v, i) => Math.abs(v - b[i]));
  return {
    totalA: sum(a),
    totalB: sum(b),
    peakA: argMax(a),
    peakB: argMax(b),
    moreA: a.filter((v, i) => v > b[i]).length,
    moreB: a.filter((v, i) => v < b[i]).length,
    widest: argMax(gaps),
  };
}

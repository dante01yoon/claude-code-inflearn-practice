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

// ---- 주소로 공유: ?compare=강남,홍대입구 ----
// 쉼표는 그대로 두고 역 이름만 인코딩한다(주소창에서 읽기 쉽게). 다른 검색 파라미터는 건드리지 않는다.
export const COMPARE_PARAM = "compare";

// location.search → 역 이름 최대 2개(앞뒤 공백·빈 칸은 뺀다)
export function readCompareParam(search) {
  const v = new URLSearchParams(search).get(COMPARE_PARAM) ?? "";
  return v.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 2);
}

// 지금 search에서 compare만 names로 바꾼 새 search("" 또는 "?…"). names가 비면 compare를 지운다.
export function compareSearch(search, names) {
  const params = new URLSearchParams(search);
  params.delete(COMPARE_PARAM);
  const parts = [params.toString()];
  if (names.length) parts.push(`${COMPARE_PARAM}=${names.map(encodeURIComponent).join(",")}`);
  const s = parts.filter(Boolean).join("&");
  return s ? `?${s}` : "";
}

// 주소의 역 이름 → entries 항목. 이름이 같거나, 괄호 부역명을 뺀 이름이 같으면("잠실" → 잠실(송파구청)) 맞는다.
// 주소는 고른 결과를 다시 여는 것이므로 초성·부분 일치는 하지 않는다.
export function findStationByName(entries, name) {
  const key = (s) => s.replace(/\s/g, "");
  const k = key(name);
  return entries.find((e) => key(e.name) === k)
    ?? entries.find((e) => key(e.name.replace(/\(.*?\)/g, "")) === k)
    ?? null;
}

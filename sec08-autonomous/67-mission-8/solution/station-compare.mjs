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

// ---- 피크 이름표 배치 ----
// points: [{ x, y, text }](피크 점의 SVG 좌표). 이름표 상자가 서로 겹치지 않게 자리를 찾는다:
// 점 바로 위 → 먼저 단 이름표나 점의 옆(같은 줄) → 점 아래 → 한 줄씩 더 위·아래. 위쪽 끝에 붙는 후보도 상자로 다시 검사한다.
// 글자 폭은 SVG 밖에서 잴 수 없어 한 글자 charW(px)로 어림한다(한글 10px 글꼴 ≈ 10px). y는 글자 기준선이다.
// 돌려주는 값: [{ x, y, anchor }] (points와 같은 순서)
export function placePeakLabels(points, { width, top, bottom, charW = 10, fontSize = 10, gap = 4 } = {}) {
  // 피크 점(반지름 4 + 테두리)도 처음부터 자리 차지로 넣어 이름표가 다른 역의 점을 덮지 않게 한다.
  const boxes = points.map((p) => ({ l: p.x - 6, r: p.x + 6, t: p.y - 6, b: p.y + 6 }));
  const overlaps = (b) => boxes.some((o) => b.l < o.r && o.l < b.r && b.t < o.b && o.t < b.b);
  const fit = (y) => Math.min(Math.max(y, top + fontSize), bottom);
  const step = fontSize + gap;
  return points.map((p) => {
    const w = [...p.text].length * charW;
    const anchor = p.x < width * 0.25 ? "start" : p.x > width * 0.75 ? "end" : "middle";
    const l = anchor === "start" ? p.x : anchor === "end" ? p.x - w : p.x - w / 2;
    // 후보 = 글자 왼쪽 끝 left, 기준선 y
    const above = fit(p.y - 8);
    const cands = [{ left: l, y: above }];
    for (const o of boxes) cands.push({ left: o.r + gap / 2, y: above }, { left: o.l - gap / 2 - w, y: above });
    cands.push({ left: l, y: fit(p.y + 16) });
    for (let k = 1; k <= 4; k++) cands.push({ left: l, y: fit(p.y - 8 - k * step) }, { left: l, y: fit(p.y + 16 + k * step) });
    const boxAt = (c) => ({ l: c.left - gap / 2, r: c.left + w + gap / 2, t: c.y - fontSize, b: c.y + 2 });
    const inside = (c) => c.left >= 0 && c.left + w <= width;
    const c = cands.find((c) => inside(c) && !overlaps(boxAt(c))) ?? cands[0];
    boxes.push(boxAt(c));
    if (c.left === l) return { x: p.x, y: c.y, anchor };
    return { x: c.left, y: c.y, anchor: "start" };
  });
}

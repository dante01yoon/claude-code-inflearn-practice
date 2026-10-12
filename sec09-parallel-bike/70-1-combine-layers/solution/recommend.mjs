// 고른 시각에 "어디로 무엇을 타고 갈까" 추천. 브라우저(subway.html)와 테스트가 함께 쓴다.
// 어디로: 주요 121장소 중 그 시각 혼잡도(실시간 도시데이터의 지금·12시간 예측)가 낮은 곳.
//   그 시각 값이 한 곳도 없으면(지금보다 앞이거나 12시간 넘게 뒤) 장소에서 가장 가까운 역의
//   그 시간대 승하차(9월 통계, 그 역 피크 대비)가 낮은 곳으로 대신 고른다.
// 무엇을: 걸어서 · 따릉이 · 지하철. 출발 역에서의 거리, 지하철 운행 여부, 도착 역 붐빔, 근처 따릉이 대여소로 정한다.
//   실제 경로·소요 시간·남은 자전거 수는 보지 않는 단순 규칙이다.

import { CONGEST_LEVELS } from "./citydata-areas.mjs";

export const WALK_MAX_M = 700;        // 출발 역에서 장소까지 이 안이면 걸어서
export const BIKE_MAX_M = 4000;       // 이 안이면 따릉이(출발·도착 근처에 대여소가 있을 때)
export const BIKE_BUSY_MAX_M = 7000;  // 도착 역이 붐비는 시간이면 이 안까지 따릉이
export const BUSY_RATIO = 0.6;        // 역 붐빔: 피크의 60% 이상(하루 띠의 "붐"과 같은 기준)
export const TRIP_MAX_M = 10_000;     // 출발 역이 있으면 이 안의 장소만(한 곳도 없으면 전체)
export const DOCK_RADIUS_M = 300;     // 장소·역에서 이 안의 따릉이 대여소를 "근처"로 센다
export const RECOMMEND_LIMIT = 3;

// "2026-10-12 15:00" → 15
const hourOf = (time) => Number(String(time ?? "").slice(11, 13));
const rank = (level) => CONGEST_LEVELS.indexOf(level);

// 장소 실시간 값(toCitydata 결과)에서 그 시(0–23)의 값. 지금(now)이 그 시면 지금, 아니면 그 시 예측.
// 없으면 null. 돌려주는 값에 forecast(예측인지)를 붙인다.
export function crowdAtHour(live, hour) {
  if (!live) return null;
  const pick = (v, forecast) => (v && rank(v.level) >= 0 && hourOf(v.time) === hour ? { ...v, forecast } : null);
  return pick(live.now, false) ?? (live.forecast ?? []).map((f) => pick(f, true)).find(Boolean) ?? null;
}

// 장소 하나에 갈 수단.
//   station: 장소에서 가장 가까운 역 { ratio(그 시간대 ÷ 피크), running(그 시간대에 다니는지) } 또는 null(500m 안에 역 없음)
//   docks: 장소 근처 따릉이 대여소 수
//   distanceM: 출발 역에서 장소까지(m). 출발 역이 없으면 null
//   origin: 출발 역 { running, docks } 또는 null
// why: close(가까움) · short(짧은 거리) · busyStation(역이 붐빔) · noSubway(지하철 안 다님) · noStation(근처 역 없음)
//      · default(지하철) · busy(붐비지만 따릉이가 어려워 지하철)
export function chooseMode({ station = null, docks = 0, distanceM = null }, origin = null) {
  if (distanceM !== null && distanceM <= WALK_MAX_M) return { mode: "walk", why: "close" };
  const bikeOk = docks > 0 && (!origin || origin.docks > 0);
  const subwayOk = Boolean(station?.running) && (!origin || origin.running);
  if (!subwayOk) return { mode: bikeOk ? "bike" : "none", why: station ? "noSubway" : "noStation" };
  if (bikeOk && distanceM !== null && distanceM <= BIKE_MAX_M) return { mode: "bike", why: "short" };
  const busy = station.ratio >= BUSY_RATIO;
  if (busy && bikeOk && (distanceM === null || distanceM <= BIKE_BUSY_MAX_M)) return { mode: "bike", why: "busyStation" };
  return { mode: "subway", why: busy ? "busy" : "default" };
}

// 후보 [{ area, crowd(crowdAtHour 결과 또는 null), station, docks, distanceM, … }] → { basis, items }
//   basis: "crowd"(그 시각 혼잡도로 고름) 또는 "station"(가까운 역 승하차로 대신 고름)
//   items: 후보에 { mode, why }를 붙여 limit개까지. 덜 붐비는 순, 같으면 가까운 순, 같으면 역이 한가한 순.
//   갈 수단이 없는 곳(mode "none")은 갈 수 있는 곳이 모자랄 때만 넣는다.
export function recommend(candidates, { origin = null, limit = RECOMMEND_LIMIT } = {}) {
  const withCrowd = candidates.filter((c) => c.crowd && rank(c.crowd.level) >= 0);
  const basis = withCrowd.length ? "crowd" : "station";
  let pool = basis === "crowd" ? withCrowd : candidates.filter((c) => c.station?.running);
  const near = pool.filter((c) => c.distanceM !== null && c.distanceM <= TRIP_MAX_M);
  if (near.length) pool = near;
  const score = basis === "crowd" ? (c) => rank(c.crowd.level) : (c) => c.station.ratio;
  const items = pool
    .map((c) => ({ ...c, ...chooseMode(c, origin) }))
    .sort((a, b) => (a.mode === "none") - (b.mode === "none")
      || score(a) - score(b)
      || (a.distanceM ?? 0) - (b.distanceM ?? 0)
      || (a.station?.ratio ?? 1) - (b.station?.ratio ?? 1)
      || a.area.name.localeCompare(b.area.name, "ko"));
  return { basis, items: items.slice(0, limit) };
}

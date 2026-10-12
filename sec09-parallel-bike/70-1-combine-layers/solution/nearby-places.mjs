// 역 근처의 도시데이터 장소 찾기. 브라우저(subway.html, 답 카드)와 테스트가 함께 쓴다.
// 점과 영역은 [경도, 위도], 영역은 citydata-areas.mjs의 polygons 모양([[바깥 고리, 구멍 고리…], …])이다.
// 몇 km 안쪽만 다루므로 기준점 둘레를 평면(등장방형)으로 펴서 m 단위로 잰다.

export const NEARBY_RADIUS_M = 500; // 역 좌표에서 영역 경계까지 이 안이면 "가까운 장소"
export const NEARBY_LIMIT = 3;      // 답 카드에 보여 줄 최대 개수

const M_PER_DEG = (6_371_008.8 * Math.PI) / 180;

// 반직선 교차 수로 고리 안인지 본다(점은 평면 좌표 [x, y]).
function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// 원점에서 선분 a–b까지의 거리
function segmentDistance([ax, ay], [bx, by]) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
  return Math.hypot(ax + t * dx, ay + t * dy);
}

// 점에서 영역까지의 거리(m). 영역 안(구멍 밖)이면 0.
export function distanceToArea([lng, lat], polygons) {
  const kx = M_PER_DEG * Math.cos((lat * Math.PI) / 180);
  const toXY = ([x, y]) => [(x - lng) * kx, (y - lat) * M_PER_DEG];
  let best = Infinity;
  for (const polygon of polygons) {
    const rings = polygon.map((ring) => ring.map(toXY));
    if (inRing([0, 0], rings[0]) && !rings.slice(1).some((hole) => inRing([0, 0], hole))) return 0;
    for (const ring of rings) {
      for (let i = 1; i < ring.length; i++) best = Math.min(best, segmentDistance(ring[i - 1], ring[i]));
    }
  }
  return best;
}

// 점에서 radiusM 안의 장소를 가까운 순서로 limit개까지. [{ area, distanceM }]
export function nearbyAreas(point, areas, { radiusM = NEARBY_RADIUS_M, limit = NEARBY_LIMIT } = {}) {
  return areas
    .map((area) => ({ area, distanceM: distanceToArea(point, area.polygons) }))
    .filter((n) => n.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, limit);
}

// 두 점 사이 거리(m). 몇 km 안쪽만 다루므로 평면으로 편다.
export function distanceM([lng1, lat1], [lng2, lat2]) {
  const kx = M_PER_DEG * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  return Math.hypot((lng2 - lng1) * kx, (lat2 - lat1) * M_PER_DEG);
}

// 영역에서 radiusM 안에 있는 항목을 가까운 순으로. [{ item, distanceM }]
// 따릉이 대여소처럼 항목이 많을 때를 위해 영역 둘레 사각형 밖은 거리를 재지 않고 뺀다.
export function itemsNearArea(polygons, items, radiusM, positionOf = (d) => d) {
  const pts = polygons.flatMap((p) => p[0]);
  const lats = pts.map((p) => p[1]), lngs = pts.map((p) => p[0]);
  const dLat = radiusM / M_PER_DEG;
  const dLng = radiusM / (M_PER_DEG * Math.cos((Math.max(...lats.map(Math.abs)) * Math.PI) / 180));
  const [w, e, s, n] = [Math.min(...lngs) - dLng, Math.max(...lngs) + dLng, Math.min(...lats) - dLat, Math.max(...lats) + dLat];
  return items
    .filter((d) => { const [x, y] = positionOf(d); return x >= w && x <= e && y >= s && y <= n; })
    .map((item) => ({ item, distanceM: distanceToArea(positionOf(item), polygons) }))
    .filter((n) => n.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM);
}

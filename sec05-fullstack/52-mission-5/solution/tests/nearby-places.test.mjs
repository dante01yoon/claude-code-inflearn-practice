import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { CITYDATA_AREAS_ZIP, parseAreasZip } from "../citydata-areas.mjs";
import { NEARBY_LIMIT, NEARBY_RADIUS_M, distanceToArea, nearbyAreas } from "../nearby-places.mjs";
import { STATION_MASTER_CSV, decodeCsv, parseCsv, stationLocator } from "../subway-csv.mjs";

// 서울시청 근처 기준점. 위도 0.001도 ≈ 111m, 이 위도에서 경도 0.001도 ≈ 88m.
const O = [126.978, 37.566];
const M_PER_LAT = 111_195; // 지구 반지름 6,371,008.8m 기준 1도
const M_PER_LNG = M_PER_LAT * Math.cos((O[1] * Math.PI) / 180);
// 기준점에서 동쪽 dx m, 북쪽 dy m 떨어진 [경도, 위도]
const at = (dx, dy) => [O[0] + dx / M_PER_LNG, O[1] + dy / M_PER_LAT];
// 가운데 (cx, cy) m, 한 변 size m인 정사각형 고리(닫힘)
const square = (cx, cy, size) => {
  const h = size / 2;
  return [at(cx - h, cy - h), at(cx + h, cy - h), at(cx + h, cy + h), at(cx - h, cy + h), at(cx - h, cy - h)];
};
const near = (actual, expected, tol = 1) => assert.ok(Math.abs(actual - expected) <= tol, `${actual} ≠ ${expected}±${tol}`);

test("영역 안의 점은 거리 0", () => {
  assert.equal(distanceToArea(O, [[square(0, 0, 200)]]), 0);
  assert.equal(distanceToArea(at(90, -90), [[square(0, 0, 200)]]), 0);
});

test("영역 밖의 점은 가장 가까운 변까지의 거리(m)", () => {
  near(distanceToArea(O, [[square(400, 0, 200)]]), 300);     // 서쪽 변까지
  near(distanceToArea(O, [[square(0, -250, 100)]]), 200);    // 북쪽 변까지
  near(distanceToArea(O, [[square(400, 400, 200)]]), Math.hypot(300, 300), 2); // 모서리까지
});

test("구멍 안의 점은 영역 밖이고, 거리는 구멍 변까지", () => {
  const donut = [[square(0, 0, 400), square(0, 0, 200)]];
  near(distanceToArea(O, donut), 100);
});

test("여러 조각이면 가장 가까운 조각까지", () => {
  near(distanceToArea(O, [[square(1000, 0, 200)], [square(0, 300, 200)]]), 200);
});

test("반경 안의 장소만 가까운 순서로, 최대 개수까지", () => {
  const area = (name, cx, cy) => ({ name, polygons: [[square(cx, cy, 100)]] });
  const areas = [area("멀리", 2000, 0), area("둘째", 0, 350), area("안", 0, 0), area("셋째", -450, 0), area("넷째", 0, -500)];
  const got = nearbyAreas(O, areas, { radiusM: 500, limit: 3 });
  assert.deepEqual(got.map((n) => n.area.name), ["안", "둘째", "셋째"]);
  assert.equal(got[0].distanceM, 0);
  near(got[1].distanceM, 300);
  near(got[2].distanceM, 400);
  assert.deepEqual(nearbyAreas(O, areas, { radiusM: 100 }).map((n) => n.area.name), ["안"]);
  assert.deepEqual(nearbyAreas(O, [area("멀리", 2000, 0)]), []);
});

test("기본 반경과 개수", () => {
  assert.equal(NEARBY_RADIUS_M, 500);
  assert.equal(NEARBY_LIMIT, 3);
});

test("실제 데이터: 역 이름을 딴 장소는 그 역 좌표를 품는다", async () => {
  const areas = await parseAreasZip(await readFile(new URL(`../${CITYDATA_AREAS_ZIP}`, import.meta.url)));
  const master = parseCsv(decodeCsv(await readFile(new URL(`../${STATION_MASTER_CSV}`, import.meta.url))));
  const locate = stationLocator(master);
  // stationLocator는 [위도, 경도]를 돌려주고, 영역과 지도는 [경도, 위도]를 쓴다.
  const point = (STTN, SBWY_ROUT_LN_NM) => locate({ STTN, SBWY_ROUT_LN_NM }).toReversed();
  for (const [station, line, place] of [["강남", "2호선", "강남역"], ["홍대입구", "2호선", "홍대입구역(2호선)"], ["서울역", "1호선", "서울역"]]) {
    const got = nearbyAreas(point(station, line), areas);
    assert.ok(got.length >= 1 && got.length <= NEARBY_LIMIT, station);
    assert.equal(got[0].area.name, place, station);
    assert.equal(got[0].distanceM, 0, station);
    for (const n of got) assert.ok(n.distanceM <= NEARBY_RADIUS_M, `${station} → ${n.area.name} ${n.distanceM}m`);
  }
});

// 실시간 열차 위치(서울 열린데이터광장 realtimePosition) → 지도 좌표. 브라우저(subway.html)와 Node(server.mjs, 테스트)가 함께 쓴다.
//
// - API는 열차가 "어느 역에 진입·도착·출발했는지"만 준다. 좌표는 SUBWAY_LINES의 역 순서와 역사마스터 좌표로 정한다.
// - API의 statnId(예: 1001000131 종각)는 역사_ID(0152)와 체계가 달라서 역 이름으로 맞춘다.
// - 진행 방향은 종착역(statnTnm)이 경로의 어느 쪽에 있는지로 정한다. 종착역이 다른 경로(지선)에 있으면 갈라지는 역 쪽이다.
//   순환선은 2호선은 updnLine으로, 6호선 응암순환은 한 방향으로만 돈다.
// - 노선 순서에 없는 역(경춘선 열차의 용산 등)은 다른 노선의 같은 역 자리에 방향 없이 놓는다.

import { SUBWAY_LINES, DUPLICATE_STATIONS, parseStop } from "./subway-lines.mjs";

// API에서 열차 위치를 주지 않는 노선(2026-10 확인: 응답이 INFO-200 "해당하는 데이터가 없습니다").
const NO_REALTIME = new Set(["김포골드라인", "의정부경전철", "용인에버라인", "인천1호선", "인천2호선"]);
export const REALTIME_LINES = Object.keys(SUBWAY_LINES).filter((line) => !NO_REALTIME.has(line));

// trainSttus 값
export const TRAIN_STATUS = { 0: "진입", 1: "도착", 2: "출발", 3: "전역 출발" };

// API 역 이름이 역사마스터와 다른 곳. 괄호 부역명은 stopKey가 따로 뺀다.
const API_NAME_ALIASES = {
  서울: "서울역",
  한국항공대: "화전", // 경의중앙선. 역사마스터(2026년 9월)에는 옛 이름으로 있다
};

// 역 이름 → 비교용 키. 괄호 부역명과 공백을 빼고, 종착역 표기의 "종착"·"순환"(예: "성수종착", "응암순환(상선)")도 뺀다.
export function stopKey(name) {
  const key = name.replace(/\(.*?\)/g, "").replace(/\s/g, "").replace(/(종착|순환)$/, "");
  return API_NAME_ALIASES[key] ?? key;
}

// 노선별 경로 좌표와 역 이름 찾기표. masterRecords는 역사마스터 CSV 레코드.
// → { lines: Map(노선 → { branches: [{ name, loop, keys, coords: [[경도, 위도]…] }], index: Map(키 → [{ b, i }]) }),
//     stations: Map(키 → [경도, 위도]) }  stations는 노선과 상관없이 찾는 표다.
export function lineGeometry(masterRecords) {
  const byId = new Map(masterRecords.map((r) => [r["역사_ID"], [Number(r["경도"]), Number(r["위도"])]]));
  const lines = new Map();
  const stations = new Map();
  for (const [line, branches] of Object.entries(SUBWAY_LINES)) {
    const index = new Map();
    const bs = branches.map((branch, b) => {
      const stops = branch.stops.map(parseStop);
      stops.forEach(({ name }, i) => {
        const key = stopKey(name);
        if (!index.has(key)) index.set(key, []);
        index.get(key).push({ b, i });
      });
      return {
        name: branch.name, loop: !!branch.loop,
        keys: stops.map((s) => stopKey(s.name)),
        coords: stops.map(({ id }) => byId.get(DUPLICATE_STATIONS[id] ?? id)),
      };
    });
    for (const br of bs) br.keys.forEach((k, i) => stations.has(k) || stations.set(k, br.coords[i]));
    lines.set(line, { branches: bs, index });
  }
  return { lines, stations };
}

// 경로 b에서 종착역 end 쪽으로 가려면 향할 역의 순번. 모르면 -1.
// 종착역이 지선에 있으면 그 지선이 갈라지는 역을, 이 경로가 지선이고 종착역이 바깥에 있으면 갈라져 나온 첫 역을 향한다.
function targetIndex(g, b, end) {
  const keys = g.branches[b].keys;
  if (keys.includes(end)) return keys.indexOf(end);
  if (!g.index.has(end)) return -1;
  let k = end;
  for (let hop = 0; hop < g.branches.length; hop++) {
    const other = g.branches.find((br) => br.keys.includes(k) && br.keys[0] !== k);
    if (!other) break;
    k = other.keys[0];
    if (keys.includes(k)) return keys.indexOf(k);
  }
  return b > 0 ? 0 : -1;
}

// 상행·하행 열차가 겹치지 않게 진행 방향 오른쪽으로 밀어 그리는 거리(m)
const SIDE_OFFSET_M = 90;
// 상태별로 역에서 얼마나 떨어져 그릴지(이웃 역까지 거리에 대한 비율). 앞은 이전 역 쪽, 뒤는 다음 역 쪽이다.
const STATUS_FRACTION = { 0: ["prev", 0.3], 1: [null, 0], 2: ["next", 0.25], 3: ["prev", 0.7] };

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// 경도·위도 a → b 방향의 오른쪽으로 m미터 민 점
function shiftRight(p, a, b, m) {
  const kx = 111320 * Math.cos((p[1] * Math.PI) / 180), ky = 110540;
  const dx = (b[0] - a[0]) * kx, dy = (b[1] - a[1]) * ky;
  const len = Math.hypot(dx, dy);
  if (!len) return p;
  return [p[0] + ((dy / len) * m) / kx, p[1] + ((-dx / len) * m) / ky];
}

// API 행 하나 → { position: [경도, 위도], line, station, status, dir } 또는 못 찾으면 null.
// dir은 경로 순서로 +1·-1, 방향을 모르면 0(역 위치에 그대로 그린다).
export function placeTrain(geo, t) {
  const g = geo.lines.get(t.subwayNm);
  if (!g) return null;
  const key = stopKey(t.statnNm);
  const hits = g.index.get(key);
  const base = { line: t.subwayNm, station: t.statnNm, status: TRAIN_STATUS[t.trainSttus] ?? "" };
  if (!hits) {
    const at = geo.stations.get(key);
    return at ? { ...base, position: at, dir: 0 } : null;
  }

  // 같은 노선에 같은 역이 여러 경로에 있으면(지선이 갈라지는 역) 종착역 쪽으로 움직일 수 있는 경로를 쓴다.
  const end = stopKey(t.statnTnm ?? "");
  const withTarget = hits.map((h) => ({ ...h, ti: targetIndex(g, h.b, end) }));
  const hit = withTarget.find((h) => h.ti >= 0 && h.ti !== h.i) ?? withTarget[0];
  const br = g.branches[hit.b];
  const n = br.coords.length;
  const here = br.coords[hit.i];
  if (!here) return null;

  let dir = 0;
  if (br.loop) {
    // 2호선 순환선은 시청 → 을지로입구 순서로 적었고, 이 방향이 외선(updnLine 1)이다.
    // 6호선 응암순환은 응암 → 역촌 → … → 구산 → 응암 한 방향으로만 돈다.
    dir = t.subwayNm === "6호선" || t.updnLine === "1" ? 1 : -1;
  } else if (hit.ti >= 0 && hit.ti !== hit.i) {
    dir = Math.sign(hit.ti - hit.i);
  }
  const neighbor = (d) => {
    const j = hit.i + d;
    return br.loop ? br.coords[(j + n) % n] : br.coords[j];
  };
  const prev = dir ? neighbor(-dir) : null;
  const next = dir ? neighbor(dir) : null;

  const [side, frac] = STATUS_FRACTION[t.trainSttus] ?? [null, 0];
  const toward = side === "prev" ? prev : side === "next" ? next : null;
  let position = toward ? lerp(here, toward, frac) : here;
  // 진행 방향: 이전 역 → 다음 역(끝 역이면 있는 쪽만 쓴다)
  const from = prev ?? here, to = next ?? here;
  if (dir) position = shiftRight(position, from, to, SIDE_OFFSET_M);

  return { ...base, position, dir };
}

// 따릉이 하루(2026-06-13) 대여이력 전처리. 브라우저(bike.html)와 Node(테스트)가 함께 쓴다.
// 원본 CSV(data/bike/, git에 없음)는 고치지 않고, scripts/build-bike-trips.mjs가 재생에 필요한 값만
// 작은 JSON(BIKE_TRIPS_JSON)으로 뽑는다. 브라우저는 그 JSON에 대여소 좌표를 붙여 이동(trip) 목록으로 바꾼다.
import { decodeCsv, parseCsv } from "./subway-csv.mjs";

export const BIKE_CSV = "data/bike/bike-rentals-20260613.csv";
export const BIKE_TRIPS_JSON = "data/bike/bike-trips-20260613.json";
export const BIKE_COORDS = "data/bike/station-coords-202606.json";
export const BIKE_DAY = "2026-06-13";

// CSV의 대여소번호("01028", 5자리 0 채움) → 좌표 JSON 키("1028", 0 없는 정수 문자열).
// 반납 대여소번호가 빈 행이 있어서 숫자가 아니면 빈 문자열을 돌려준다.
export const stationKey = (no) => (/^\d+$/.test(no) ? String(Number(no)) : "");

// "2026-06-13 00:00:35" → BIKE_DAY 00:00(KST) 기준 초. 다음 날이면 86400 이상, 형식이 이상하면 NaN.
const DATETIME = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
const DAY_UTC = Date.parse(`${BIKE_DAY}T00:00:00Z`);
export function toSeconds(datetime) {
  const m = DATETIME.exec(datetime);
  if (!m) return NaN;
  const [y, mo, d, h, mi, s] = m.slice(1).map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 59) return NaN;
  // 시간대 없는 날짜 계산은 UTC로 통일해 서머타임 같은 영향을 받지 않게 한다.
  return (Date.UTC(y, mo - 1, d, h, mi, s) - DAY_UTC) / 1000;
}

// 숫자만 있는 문자열("12", "88.16")을 숫자로. 아니면 NaN.
const toNumber = (v) => (/^\d+(\.\d+)?$/.test(v) ? Number(v) : NaN);

// parseCsv 결과 행 + 좌표 JSON → 이동 목록.
// 버리는 행은 먼저 걸린 이유 하나로만 센다(순서: badTime → noReturn → noCoords).
//   badTime: 대여·반납 시각 파싱 실패, 또는 반납이 대여보다 앞섬
//   noReturn: 반납 대여소번호가 비어 있음(반납 정보 없음)
//   noCoords: 대여 또는 반납 대여소 좌표가 없음
export function toTrips(rows, coords) {
  const trips = [];
  const skipped = { noCoords: 0, noReturn: 0, badTime: 0 };
  for (const rec of rows) {
    const start = toSeconds(rec["대여일시"]);
    const end = toSeconds(rec["반납일시"]);
    if (!(end >= start)) { skipped.badTime++; continue; } // NaN도 여기서 걸린다
    const fromNo = stationKey(rec["대여 대여소번호"]);
    const toNo = stationKey(rec["반납대여소번호"]);
    if (!toNo) { skipped.noReturn++; continue; }
    const a = coords[fromNo];
    const b = coords[toNo];
    if (!a || !b) { skipped.noCoords++; continue; }
    trips.push({
      bike: rec["자전거번호"],
      fromNo,
      toNo,
      from: [a.lng, a.lat],
      to: [b.lng, b.lat],
      start,
      end,
      minutes: toNumber(rec["이용시간(분)"]),
      meters: toNumber(rec["이용거리(M)"]),
      round: fromNo === toNo,
    });
  }
  return { trips, skipped };
}

// 시(0–23)별 대여 시작 건수.
export function hourlyStarts(trips) {
  const counts = new Array(24).fill(0);
  for (const t of trips) counts[Math.floor(t.start / 3600) % 24]++;
  return counts;
}

// 원본 CSV 바이트 → 이동 목록. total = CSV 데이터 행 수.
export function tripsFromCsv(buf, coords) {
  const rows = parseCsv(decodeCsv(buf));
  return { ...toTrips(rows, coords), total: rows.length };
}

// 이동 목록 → 재생용 JSON. 이용자 정보(생년·성별·이용자종류)와 재생에 쓰지 않는 값(자전거번호·
// 대여소명·거치대·이용시간·이용거리)은 넣지 않는다. 열마다 배열 하나(i번째 값끼리 한 이동),
// 대여소는 좌표 JSON 키를 숫자로, 시각은 BIKE_DAY 00:00(KST) 기준 초. 순서는 CSV 순서 그대로.
export function toTripsJson({ trips, skipped, total }) {
  return {
    day: BIKE_DAY,
    source: "서울특별시 공공자전거 대여이력 정보(2026년 6월) — 서울특별시, 공공누리 제1유형",
    total,
    skipped,
    from: trips.map((t) => Number(t.fromNo)),
    to: trips.map((t) => Number(t.toNo)),
    start: trips.map((t) => t.start),
    end: trips.map((t) => t.end),
  };
}

// 재생용 JSON + 좌표 JSON → 이동 목록. 좌표 없는 행은 만들 때 이미 뺐다.
export function fromTripsJson(data, coords) {
  const trips = data.start.map((start, i) => {
    const fromNo = String(data.from[i]), toNo = String(data.to[i]);
    const a = coords[fromNo], b = coords[toNo];
    if (!a || !b) throw new Error(`대여소 좌표 없음: ${a ? toNo : fromNo}`);
    return { fromNo, toNo, from: [a.lng, a.lat], to: [b.lng, b.lat], start, end: data.end[i], round: fromNo === toNo };
  });
  return { trips, skipped: data.skipped, total: data.total };
}

// 브라우저용: 재생용 JSON과 좌표 JSON을 받아 이동 목록으로. coords는 대여소 점을 그릴 때도 쓴다.
export async function loadBikeTrips(baseUrl = "") {
  const get = async (path) => {
    const res = await fetch(encodeURI(baseUrl + path));
    if (!res.ok) throw new Error(`${path}: ${res.status} ${res.statusText}`);
    return res.json();
  };
  const [data, coords] = await Promise.all([get(BIKE_TRIPS_JSON), get(BIKE_COORDS)]);
  return { ...fromTripsJson(data, coords), coords };
}

// 운행 하루(04:00–다음 날 04:00). 지하철 시간대(HOURS)와 같은 하루로 맞춰 subway.html에서 함께 재생한다.
export const SERVICE_START_S = 4 * 3600;
const DAY_S = 86400;

// 04:00 전에 시작한 이동(그날 새벽)은 하루 끝(다음 날 새벽)으로 옮긴다. 기록이 하루뿐이라
// 같은 날 새벽 기록으로 다음 날 새벽을 대신한다. 그러면 시각이 SERVICE_START_S부터 이어진다.
export const toServiceDay = (trips, startS = SERVICE_START_S) =>
  trips.map((t) => (t.start < startS ? { ...t, start: t.start + DAY_S, end: t.end + DAY_S } : t));

// 대여소별, 운행 시간대(HOURS 순서 0–23)별 대여+반납 건수. Map 대여소 키 → 24칸 배열.
// 대여는 대여소·대여 시각, 반납은 반납소·반납 시각으로 센다. 운행 하루 밖(다음 날 04시 이후 반납)은 세지 않는다.
export function dockActivity(trips, startS = SERVICE_START_S) {
  const byDock = new Map();
  const add = (key, s) => {
    const i = Math.floor((s - startS) / 3600);
    if (!(i >= 0 && i < 24)) return;
    let counts = byDock.get(key);
    if (!counts) byDock.set(key, (counts = new Array(24).fill(0)));
    counts[i]++;
  };
  for (const t of trips) {
    add(t.fromNo, t.start);
    add(t.toNo, t.end);
  }
  return byDock;
}

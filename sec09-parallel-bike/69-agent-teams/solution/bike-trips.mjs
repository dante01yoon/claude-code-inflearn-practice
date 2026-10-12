// 따릉이 하루(2026-06-13) 대여이력 전처리. 브라우저(bike.html)와 Node(테스트)가 함께 쓴다.
// 원본(data/bike/)은 고치지 않고, 읽을 때 대여소 좌표를 붙여 이동(trip) 목록으로 바꾼다.
import { decodeCsv, parseCsv } from "./subway-csv.mjs";

export const BIKE_CSV = "data/bike/bike-rentals-20260613.csv";
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

// 브라우저용: 두 파일을 받아 이동 목록으로. total = CSV 데이터 행 수.
export async function loadBikeTrips(baseUrl = "") {
  const get = async (path) => {
    const res = await fetch(encodeURI(baseUrl + path));
    if (!res.ok) throw new Error(`${path}: ${res.status} ${res.statusText}`);
    return res;
  };
  const [csvRes, coordsRes] = await Promise.all([get(BIKE_CSV), get(BIKE_COORDS)]);
  const rows = parseCsv(decodeCsv(await csvRes.arrayBuffer()));
  const { trips, skipped } = toTrips(rows, await coordsRes.json());
  return { trips, skipped, total: rows.length };
}

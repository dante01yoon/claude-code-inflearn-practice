// 서울 열린데이터광장 Open API 호출(MCP 도구용). 승하차는 CardSubwayTime, 장소 붐빔은 citydata_ppltn.
// 인증키는 SEOUL_OPENAPI_KEY 환경 변수(.mcp.json의 env로 넘긴다). 없으면 공개 sample 키를 쓴다.
// 도구 결과와 오류 문구에는 키를 넣지 않는다(scrub).
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { CITYDATA_AREAS_ZIP, parseAreasZip } from "../../citydata-areas.mjs";
import { fetchCitydataArea } from "../../realtime-citydata.mjs";

type Row = Record<string, any>;

const KEY = process.env.SEOUL_OPENAPI_KEY?.trim() || "sample";
export const isSample = KEY === "sample";
export const scrub = (s: unknown) => String(s).replaceAll(KEY, "***").replaceAll(encodeURIComponent(KEY), "***");

// sample 키는 한 번에 5행까지만 준다. 역 하나는 노선 수만큼 행이 있다(서울역 5개).
const PAGE_SIZE = isSample ? 5 : 20;

// 결과 코드 INFO-200(데이터 없음)은 빈 배열로, 그 밖의 코드는 오류로 본다.
async function fetchCardSubwayTime(month: string, line: string, station: string): Promise<{ rows: Row[]; total: number }> {
  // 호선을 비우면 그 역의 모든 노선. 빈 경로 칸은 무시되므로 공백 한 칸을 넣는다.
  const path = [month, line || " ", station].map(encodeURIComponent).join("/");
  const url = `http://openapi.seoul.go.kr:8088/${encodeURIComponent(KEY)}/json/CardSubwayTime/1/${PAGE_SIZE}/${path}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  const result = body.CardSubwayTime?.RESULT ?? body.RESULT ?? {};
  if (result.CODE === "INFO-200") return { rows: [], total: 0 };
  if (result.CODE !== "INFO-000") throw new Error(`${result.CODE} ${result.MESSAGE}`);
  return { rows: body.CardSubwayTime.row, total: body.CardSubwayTime.list_total_count };
}

// KST 기준 지난달부터 거슬러 n달("YYYYMM"). 통계는 다음 달 초에 올라온다.
function recentMonths(n: number) {
  const kst = new Date(Date.now() + 9 * 3600_000);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth() - 1 - i, 1));
    return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

// names: 시도할 역 이름(API는 "서울대입구(관악구청)"처럼 정확한 이름만 받는다). 처음으로 행이 나온 이름을 쓴다.
// month를 비우면 지난달부터 석 달 안에서 데이터가 있는 가장 최근 달을 쓴다.
export async function stationHourly(names: string[], month?: string, line = "") {
  for (const m of month ? [month] : recentMonths(3)) {
    for (const name of names) {
      const { rows, total } = await fetchCardSubwayTime(m, line, name);
      if (rows.length) return { month: m, rows, truncated: total > rows.length };
    }
  }
  return null;
}

export const monthLabel = (m: string) => `${m.slice(0, 4)}년 ${Number(m.slice(4))}월`;

// 주요 121장소 목록(코드·분류·이름). 영역 zip은 처음 쓸 때 한 번만 읽는다.
type Place = { code: string; category: string; name: string };
let places: Promise<Place[]> | null = null;
export const loadPlaces = () =>
  (places ??= readFile(fileURLToPath(new URL(`../../${CITYDATA_AREAS_ZIP}`, import.meta.url)))
    .then(parseAreasZip)
    .then((areas: Place[]) => areas.map(({ code, category, name }) => ({ code, category, name }))));

// 장소 코드(POI009) 또는 이름으로 찾는다. 공백·가운뎃점·대소문자는 무시하고, 정확히 같은 이름 → 포함 관계 순.
// 하나로 정해지면 match, 아니면 후보 목록(최대 10곳)을 돌려준다.
export async function findPlace(query: string): Promise<{ match?: Place; candidates: Place[] }> {
  const all = await loadPlaces();
  const norm = (s: string) => s.toLowerCase().replace(/[\s·.,]/g, "");
  const q = norm(query);
  const exact = all.find((p) => p.code.toLowerCase() === q || norm(p.name) === q);
  if (exact) return { match: exact, candidates: [] };
  const partial = all.filter((p) => q && (norm(p.name).includes(q) || q.includes(norm(p.name))));
  return partial.length === 1 ? { match: partial[0], candidates: [] } : { candidates: partial.slice(0, 10) };
}

export const placeCrowd = (code: string) => fetchCitydataArea(KEY, code);

// 따릉이 대여소 실시간 현황(bikeList). 이름으로 거르는 인자가 없어서 전체(약 2,700곳)를 받아 두고 찾는다.
// 한 번에 1,000건까지라 나눠 받고, list_total_count는 그 응답의 행 수라서 1,000건보다 적게 오면 끝으로 본다.
// sample 키는 1~5번째 행(망원·합정 5곳)만 받을 수 있다.
export type BikeStation = { id: string; name: string; bikes: number; racks: number; shared: number; lat: number; lng: number };
const BIKE_PAGE = isSample ? 5 : 1000;
const BIKE_MAX_PAGES = 10;
export const BIKE_CACHE_MS = 60_000;

async function fetchBikePage(start: number): Promise<Row[]> {
  const url = `http://openapi.seoul.go.kr:8088/${encodeURIComponent(KEY)}/json/bikeList/${start}/${start + BIKE_PAGE - 1}/`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  const result = body.rentBikeStatus?.RESULT ?? body.RESULT ?? {};
  if (result.CODE === "INFO-200") return [];
  if (result.CODE !== "INFO-000") throw new Error(`${result.CODE} ${result.MESSAGE}`);
  return body.rentBikeStatus.row;
}

const toBikeStation = (r: Row): BikeStation => ({
  id: r.stationId,
  name: String(r.stationName).trim(),
  bikes: Number(r.parkingBikeTotCnt),
  racks: Number(r.rackTotCnt),
  shared: Number(r.shared),
  lat: Number(r.stationLatitude),
  lng: Number(r.stationLongitude),
});

let bikeCache: { at: number; stations: Promise<BikeStation[]> } | null = null;
export function loadBikeStations(): Promise<BikeStation[]> {
  if (bikeCache && Date.now() - bikeCache.at < BIKE_CACHE_MS) return bikeCache.stations;
  const stations = (async () => {
    const all: Row[] = [];
    for (let page = 0; page < (isSample ? 1 : BIKE_MAX_PAGES); page++) {
      const rows = await fetchBikePage(page * BIKE_PAGE + 1);
      all.push(...rows);
      if (rows.length < BIKE_PAGE) break;
    }
    return all.map(toBikeStation);
  })();
  bikeCache = { at: Date.now(), stations };
  stations.catch(() => { bikeCache = null; }); // 실패는 캐시하지 않는다
  return stations;
}

// 대여소 번호(102), ID(ST-4), 이름 일부(망원역, 합정역 7번출구)로 찾는다. 공백은 무시하고, 끝의 "역"을 뺀 이름도 시도한다.
// 이름은 "102. 망원역 1번출구 앞"처럼 번호가 앞에 붙어 있다.
export const bikeStationNo = (name: string) => name.match(/^(\d+)\./)?.[1] ?? "";
export function findBikeStations(stations: BikeStation[], query: string): BikeStation[] {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
  const q = norm(query);
  if (!q) return [];
  const byNo = stations.filter((s) => bikeStationNo(s.name) === q || s.id.toLowerCase() === q);
  if (byNo.length) return byNo;
  for (const key of new Set([q, q.replace(/역$/, "")])) {
    const hit = stations.filter((s) => key && norm(s.name.replace(/^\d+\.\s*/, "")).includes(key));
    if (hit.length) return hit;
  }
  return [];
}

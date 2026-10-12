// 따릉이 대여소 실시간 현황(bikeList)을 열린데이터광장에서 받아 온다. 아침 리포트(scripts/daily-report.mjs)가 쓴다.
// 인증키는 일반 인증키(SEOUL_OPENAPI_KEY)이고, 오류 문구에는 키를 넣지 않는다(scrub).
// mcp-server/src/openapi.ts의 get_bike_stations와 같은 API·같은 방식이다.

// 한 번에 1,000건까지라 나눠 받고, list_total_count는 그 응답의 행 수라서 1,000건보다 적게 오면 끝으로 본다.
// sample 키는 1~5번째 행(망원·합정 5곳)만 받을 수 있다.
const PAGE = 1000;
const SAMPLE_PAGE = 5;
const MAX_PAGES = 10;

// 대여소 행 → { id, name, bikes(주차된 자전거), racks(거치대), shared(거치율 %), lat, lng }
export const toBikeStation = (r) => ({
  id: r.stationId,
  name: String(r.stationName).trim(),
  bikes: Number(r.parkingBikeTotCnt),
  racks: Number(r.rackTotCnt),
  shared: Number(r.shared),
  lat: Number(r.stationLatitude),
  lng: Number(r.stationLongitude),
});

// 반환값: { isSample, stations(), scrub(s) }
export function createBikeSource(key) {
  const KEY = key || "sample";
  const isSample = KEY === "sample";
  const size = isSample ? SAMPLE_PAGE : PAGE;
  const scrub = (s) => String(s).replaceAll(KEY, "***").replaceAll(encodeURIComponent(KEY), "***");

  async function fetchPage(start) {
    const url = `http://openapi.seoul.go.kr:8088/${encodeURIComponent(KEY)}/json/bikeList/${start}/${start + size - 1}/`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const result = body.rentBikeStatus?.RESULT ?? body.RESULT ?? {};
    if (result.CODE === "INFO-200") return [];
    if (result.CODE !== "INFO-000") throw new Error(`${result.CODE} ${result.MESSAGE}`);
    return body.rentBikeStatus.row;
  }

  async function stations() {
    const all = [];
    for (let page = 0; page < (isSample ? 1 : MAX_PAGES); page++) {
      const rows = await fetchPage(page * size + 1).catch((err) => { throw new Error(scrub(err.message)); });
      all.push(...rows);
      if (rows.length < size) break;
    }
    return all.map(toBikeStation);
  }

  return { isSample, stations, scrub };
}

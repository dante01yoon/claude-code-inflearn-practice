// 서울 실시간 도시데이터(장소별 인구·혼잡도와 12시간 예측)를 열린데이터광장에서 받아 온다.
// server.mjs(로컬)와 api/citydata.js(Vercel)가 함께 쓴다. 인증키는 일반 인증키(SEOUL_OPENAPI_KEY)이고 서버 쪽에서만 넘겨받는다.
// 돌려주는 값과 오류 문구에는 키가 들어가지 않는다.

import { readFile } from "node:fs/promises";
import { CITYDATA_AREAS_ZIP, CONGEST_LEVELS, parseAreasZip } from "./citydata-areas.mjs";

// API는 5분마다 갱신된다. 여러 사람이 열어도 이 간격에 한 번만 121곳을 묻는다.
export const CITYDATA_CACHE_MS = 5 * 60_000;
// 한 번에 동시에 보내는 요청 수(121곳을 이 개수씩 나눠 묻는다).
const CONCURRENCY = 8;

export { CONGEST_LEVELS };

const toNum = (v) => (v === undefined || v === null || v === "" ? null : Number(v));

// API 행(citydata_ppltn) → 화면에 쓰는 값만. now와 forecast 항목은 { time, level, min, max } 같은 모양이다.
export function toCitydata(row) {
  return {
    code: row.AREA_CD,
    name: row.AREA_NM,
    message: row.AREA_CONGEST_MSG,
    now: { time: row.PPLTN_TIME, level: row.AREA_CONGEST_LVL, min: toNum(row.AREA_PPLTN_MIN), max: toNum(row.AREA_PPLTN_MAX) },
    forecast: row.FCST_YN === "Y"
      ? (row.FCST_PPLTN ?? []).map((f) => ({ time: f.FCST_TIME, level: f.FCST_CONGEST_LVL, min: toNum(f.FCST_PPLTN_MIN), max: toNum(f.FCST_PPLTN_MAX) }))
      : [],
  };
}

// 저장소의 영역 zip에서 장소 코드 121개를 읽는다.
export async function areaCodesFromZip(path) {
  return (await parseAreasZip(await readFile(path ?? new URL(CITYDATA_AREAS_ZIP, import.meta.url)))).map((a) => a.code);
}

// 장소 1곳의 실시간 인구(citydata_ppltn). 키를 가리는 일은 부르는 쪽이 한다(오류 문구에 주소가 섞이지 않게 상태만 적는다).
export async function fetchCitydataArea(key, code) {
  const url = `http://openapi.seoul.go.kr:8088/${encodeURIComponent(key)}/json/citydata_ppltn/1/5/${encodeURIComponent(code)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  const result = body.RESULT ?? {};
  const resultCode = result["RESULT.CODE"] ?? result.CODE;
  if (resultCode !== "INFO-000") throw new Error(`${resultCode} ${result["RESULT.MESSAGE"] ?? result.MESSAGE}`);
  const [row] = body["SeoulRtd.citydata_ppltn"] ?? [];
  if (!row) throw new Error("응답에 장소가 없습니다");
  return toCitydata(row);
}

// key가 없으면 공개 sample 키를 쓴다. sample 키는 어느 장소를 물어도 광화문·덕수궁 1곳만 돌려주므로 한 번만 묻는다.
// cacheMs: 이 간격 안의 요청은 지난 결과를 돌려준다. 5분마다 도는 수집기는 0을 넘겨 매번 새로 묻는다
// (같은 간격이면 타이머가 조금만 일찍 와도 캐시에 걸려 한 번을 건너뛴다).
// 반환값: { isSample, citydata(), scrub(s) }
export function createCitydataSource(key, loadCodes = areaCodesFromZip, cacheMs = CITYDATA_CACHE_MS) {
  const KEY = key || "sample";
  const isSample = KEY === "sample";
  const scrub = (s) => String(s).replaceAll(KEY, "***").replaceAll(encodeURIComponent(KEY), "***");

  const fetchArea = (code) => fetchCitydataArea(KEY, code);

  let codes = null;
  let cache = null; // { at, promise }
  function citydata() {
    if (cache && Date.now() - cache.at < cacheMs) return cache.promise;
    const promise = (async () => {
      codes ??= await loadCodes();
      const ask = isSample ? codes.slice(0, 1) : codes;
      const results = new Array(ask.length);
      let next = 0;
      const worker = async () => {
        while (next < ask.length) {
          const i = next++;
          results[i] = await fetchArea(ask[i]).then((value) => ({ value }), (reason) => ({ reason }));
        }
      };
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, ask.length) }, worker));
      const out = { updatedAt: new Date().toISOString(), sample: isSample, areas: [], errors: [] };
      results.forEach((r, i) => {
        if (r.value) out.areas.push(r.value);
        else out.errors.push({ code: ask[i], message: scrub(r.reason?.message ?? r.reason) });
      });
      if (out.errors.length) console.warn(`실시간 도시데이터 오류 ${out.errors.length}곳`, out.errors.slice(0, 5));
      return out;
    })();
    // 실패하면 캐시하지 않고 다음 요청에서 다시 묻는다.
    promise.catch(() => (cache = null));
    cache = { at: Date.now(), promise };
    return promise;
  }

  return { isSample, citydata, scrub };
}

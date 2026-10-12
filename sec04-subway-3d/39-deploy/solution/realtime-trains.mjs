// 실시간 열차 위치를 서울 열린데이터광장에서 받아 온다. server.mjs(로컬)와 api/trains.js(Vercel)가 함께 쓴다.
// 인증키는 서버 쪽에서만 넘겨받는다. 돌려주는 값과 오류 문구에는 키가 들어가지 않는다.

import { REALTIME_LINES } from "./train-positions.mjs";

// 여러 사람이 열어도 위 API는 이 간격에 한 번만 부른다(노선마다 1회).
export const CACHE_MS = 20_000;
const FIELDS = ["subwayNm", "trainNo", "statnNm", "statnTnm", "updnLine", "trainSttus", "directAt", "lstcarAt", "recptnDt"];

// key가 없으면 공개 sample 키를 쓴다. 반환값: { isSample, trains(), scrub(s) }
export function createTrainsSource(key) {
  const KEY = key || "sample";
  const isSample = KEY === "sample";
  const ROWS = isSample ? 5 : 500; // sample 키는 0–5행만 받을 수 있다

  // 오류 문구에 요청 주소(=키)가 섞여 나가지 않게 한다.
  const scrub = (s) => String(s).replaceAll(KEY, "***").replaceAll(encodeURIComponent(KEY), "***");

  async function fetchLine(line) {
    const url = `http://swopenapi.seoul.go.kr/api/subway/${encodeURIComponent(KEY)}/json/realtimePosition/0/${ROWS}/${encodeURIComponent(line)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const info = body.errorMessage ?? body;
    if (info.code === "INFO-200") return []; // 지금 다니는 열차가 없다(심야 등)
    if (info.code !== "INFO-000") throw new Error(`${info.code} ${info.message}`);
    return (body.realtimePositionList ?? []).map((t) => Object.fromEntries(FIELDS.map((k) => [k, t[k]])));
  }

  let cache = null; // { at, promise }
  function trains() {
    if (cache && Date.now() - cache.at < CACHE_MS) return cache.promise;
    const promise = Promise.allSettled(REALTIME_LINES.map(fetchLine)).then((results) => {
      const out = { updatedAt: new Date().toISOString(), sample: isSample, trains: [], errors: [] };
      results.forEach((r, i) => {
        if (r.status === "fulfilled") out.trains.push(...r.value);
        else out.errors.push({ line: REALTIME_LINES[i], message: scrub(r.reason?.message ?? r.reason) });
      });
      if (out.errors.length) console.warn("실시간 열차 위치 오류", out.errors);
      return out;
    });
    cache = { at: Date.now(), promise };
    return promise;
  }

  return { isSample, trains, scrub };
}

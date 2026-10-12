// 실시간 도시데이터를 Supabase에 쌓는다. 공공 API는 지금 값과 예측만 주고 지난 기록은 주지 않으므로, 5분마다 받아 둔 값이 곧 시계열이 된다.
// scripts/collect-citydata.mjs가 쓴다. 쓰기는 RLS를 우회하는 service_role(비밀) 키로만 하므로 서버 쪽에서만 부른다.
// PostgREST에 fetch로 바로 보낸다(의존성 없음). 키는 헤더에만 넣고 오류 문구에는 넣지 않는다.

import { CONGEST_LEVELS } from "./realtime-citydata.mjs";
import { DbUnavailableError } from "./db-status.mjs";

// API의 PPLTN_TIME("2026-10-12 13:40", KST) → ISO 8601(+09:00). 모양이 다르면 null.
export function kstToIso(time) {
  const m = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})(?::(\d{2}))?$/.exec(String(time ?? "").trim());
  return m ? `${m[1]}T${m[2]}:${m[3] ?? "00"}+09:00` : null;
}

// 영역 zip의 장소 → places 행
export const toPlaceRows = (areas) => areas.map(({ code, name, category }) => ({ code, name, category }));

// citydata() 결과의 areas → crowd_snapshots 행. 테이블 check에 걸릴 행(시각·혼잡도·인구 범위가 이상한 것)은 skipped로 뺀다.
export function toSnapshotRows(areas) {
  const rows = [];
  const skipped = [];
  for (const a of areas) {
    const observed_at = kstToIso(a.now.time);
    const { min, max } = a.now;
    const reason = !observed_at ? `시각 ${a.now.time}`
      : !CONGEST_LEVELS.includes(a.now.level) ? `혼잡도 ${a.now.level}`
      : min !== null && max !== null && !(min >= 0 && min <= max) ? `인구 ${min}~${max}`
      : null;
    if (reason) skipped.push({ code: a.code, reason });
    else rows.push({ place_code: a.code, observed_at, congest_level: a.now.level, population_min: min, population_max: max, message: a.message ?? null });
  }
  return { rows, skipped };
}

// 수집 한 번 → collect_runs 행(관리자 화면이 호출 수·실패를 센다). data는 citydata() 결과, 실행 전체가 실패했으면 null과 error.
// api_errors는 자주 나는 오류를 보기 위한 표본이라 앞쪽 몇 곳만 남긴다.
export const RUN_ERROR_SAMPLES = 10;
export function toRunRow({ startedAt, finishedAt, sample, data = null, inserted = 0, skipped = 0, error = null }) {
  const errors = data?.errors ?? [];
  return {
    started_at: new Date(startedAt).toISOString(),
    finished_at: new Date(finishedAt).toISOString(),
    sample: Boolean(sample),
    api_calls: data ? data.areas.length + errors.length : 0,
    api_failed: errors.length,
    inserted,
    skipped,
    error: error === null ? null : String(error).slice(0, 500),
    api_errors: errors.slice(0, RUN_ERROR_SAMPLES).map(({ code, message }) => ({ code, message: String(message).slice(0, 200) })),
  };
}

// 반환값: { savePlaces(areas), saveSnapshots(rows), saveRun(row) }. saveSnapshots는 새로 들어간 행 수를 돌려준다.
export function createCrowdStore({ url, serviceKey }) {
  if (!url || !serviceKey) throw new Error("SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다");
  const base = `${url.replace(/\/+$/, "")}/rest/v1`;

  async function post(table, query, prefer, rows) {
    const res = await fetch(`${base}/${table}${query}`, {
      method: "POST",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: prefer },
      body: JSON.stringify(rows),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`${table} 저장 실패 HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
    return res;
  }

  async function upsert(table, onConflict, resolution, rows) {
    if (!rows.length) return 0;
    // return=representation: 실제로 들어간 행만 돌아온다(ignore-duplicates면 이미 있던 행은 빠진다).
    const res = await post(table, `?on_conflict=${onConflict}&select=${onConflict.split(",")[0]}`, `resolution=${resolution},return=representation`, rows);
    return (await res.json()).length;
  }

  return {
    // 장소 이름·분류가 바뀌었으면 고친다.
    savePlaces: (areas) => upsert("places", "code", "merge-duplicates", toPlaceRows(areas)),
    // API가 5분 안에 같은 시각 값을 다시 주면 (place_code, observed_at) unique에 걸려 건너뛴다.
    saveSnapshots: (rows) => upsert("crowd_snapshots", "place_code,observed_at", "ignore-duplicates", rows),
    saveRun: async (row) => void (await post("collect_runs", "", "return=minimal", row)),
  };
}

// ---- 읽기: 장소 하나의 지난 기록 ----
// server.mjs와 api/crowd-history.js가 쓴다. crowd_snapshots는 누구나 읽을 수 있으므로(RLS select) 공개용 publishable 키로 충분하다.

export const HISTORY_HOURS = 24;
const HISTORY_CACHE_MS = 60_000; // 수집은 5분 간격이라 1분만 캐시해도 충분하다
export const isPlaceCode = (code) => /^POI\d{3}$/.test(String(code ?? ""));

// 반환값: { configured, history(code) }. history는 { code, from, to, points: [{ time, level, min, max }] }(시각 오름차순)
export function createCrowdHistory({ url, key }, hours = HISTORY_HOURS) {
  const configured = Boolean(url && key);
  const base = configured ? `${url.replace(/\/+$/, "")}/rest/v1` : "";
  const cache = new Map(); // code → { at, promise }

  async function load(code) {
    const to = new Date();
    const from = new Date(to.getTime() - hours * 3600_000);
    const qs = new URLSearchParams({
      select: "observed_at,congest_level,population_min,population_max",
      place_code: `eq.${code}`,
      observed_at: `gte.${from.toISOString()}`,
      order: "observed_at.asc",
    });
    // DB가 꺼졌거나(PostgREST 5xx) Supabase에 닿지 않으면(fetch 실패·시간 초과) DbUnavailableError로 알린다.
    const res = await fetch(`${base}/crowd_snapshots?${qs}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    }).catch((err) => { throw new DbUnavailableError(`crowd_snapshots 읽기 실패: ${err.message}`); });
    if (res.status >= 500) throw new DbUnavailableError(`crowd_snapshots 읽기 실패 HTTP ${res.status}`);
    if (!res.ok) throw new Error(`crowd_snapshots 읽기 실패 HTTP ${res.status}`);
    const rows = await res.json();
    return {
      code, from: from.toISOString(), to: to.toISOString(),
      points: rows.map((r) => ({ time: r.observed_at, level: r.congest_level, min: r.population_min, max: r.population_max })),
    };
  }

  function history(code) {
    if (!configured) throw new Error("SUPABASE_URL과 SUPABASE_PUBLISHABLE_KEY가 없습니다");
    if (!isPlaceCode(code)) throw new Error("장소 코드가 아닙니다");
    const hit = cache.get(code);
    if (hit && Date.now() - hit.at < HISTORY_CACHE_MS) return hit.promise;
    const promise = load(code);
    promise.catch(() => cache.delete(code));
    cache.set(code, { at: Date.now(), promise });
    return promise;
  }

  return { configured, history };
}

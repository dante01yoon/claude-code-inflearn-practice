// 아침 서울 데이터 리포트 계산: 실시간 도시데이터·따릉이 현황 → 요약에 넘길 사실(facts), claude -p 프롬프트와 출력 스키마,
// 저장할 리포트와 목록(reports/index.json). 받아 오기와 claude 실행은 scripts/daily-report.mjs가 한다.

import { CONGEST_LEVELS } from "./citydata-areas.mjs";

// 사실에 넣는 목록 길이(프롬프트를 짧게 유지한다).
export const TOP_PLACES = 10;
export const TOP_CALM = 5;
export const TOP_BIKE = 5;

const KST_MS = 9 * 3600_000;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// KST 날짜 "YYYY-MM-DD"와 요일.
export function kstDate(now = new Date()) {
  const d = new Date(now.getTime() + KST_MS);
  return { date: d.toISOString().slice(0, 10), weekday: WEEKDAYS[d.getUTCDay()] };
}

const levelIdx = (level) => CONGEST_LEVELS.indexOf(level);
const mid = (p) => (Number.isFinite(p.min) && Number.isFinite(p.max) ? (p.min + p.max) / 2 : null);
const population = (p) => (Number.isFinite(p.min) && Number.isFinite(p.max) ? { min: p.min, max: p.max } : null);

// citydata: createCitydataSource().citydata() 결과, categories: 장소 코드 → 분류, bikes: createBikeSource().stations() 결과.
// 어느 한쪽을 받지 못했으면 { error }를 넘긴다.
export function reportFacts({ citydata, categories = new Map(), bikes, now = new Date() }) {
  return { ...kstDate(now), generatedAt: now.toISOString(), places: placeFacts(citydata, categories), bikes: bikeFacts(bikes) };
}

function placeFacts(citydata, categories) {
  if (!citydata || citydata.error) return { error: citydata?.error ?? "받지 못함" };
  const known = citydata.areas.filter((a) => levelIdx(a.now.level) >= 0);
  const row = (a) => ({ name: a.name, category: categories.get(a.code) ?? null, level: a.now.level, population: population(a.now), time: a.now.time });

  const levels = Object.fromEntries(CONGEST_LEVELS.map((l) => [l, known.filter((a) => a.now.level === l).length]));
  const byCategory = new Map();
  for (const a of known) {
    const c = categories.get(a.code) ?? "기타";
    const s = byCategory.get(c) ?? { category: c, count: 0, crowded: 0 };
    s.count++;
    if (levelIdx(a.now.level) >= 2) s.crowded++;
    byCategory.set(c, s);
  }

  // 붐비는 순: 단계가 높고, 같으면 추정 인구(범위 가운데)가 많은 곳 먼저.
  const byCrowd = [...known].sort((a, b) => levelIdx(b.now.level) - levelIdx(a.now.level) || (mid(b.now) ?? 0) - (mid(a.now) ?? 0));
  const calm = [...known].sort((a, b) => levelIdx(a.now.level) - levelIdx(b.now.level) || (mid(a.now) ?? Infinity) - (mid(b.now) ?? Infinity));

  // 예측(12시간) 안에서 지금보다 단계가 오르는 곳. 가장 높은 단계와 처음 그 단계가 되는 시각.
  const rising = known.flatMap((a) => {
    const peak = a.forecast.reduce((best, f) => (levelIdx(f.level) > levelIdx(best?.level) ? f : best), null);
    return peak && levelIdx(peak.level) > levelIdx(a.now.level) ? [{ name: a.name, now: a.now.level, peak: peak.level, peakTime: peak.time }] : [];
  }).sort((a, b) => levelIdx(b.peak) - levelIdx(a.peak) || a.peakTime.localeCompare(b.peakTime));

  return {
    sample: citydata.sample,
    received: citydata.areas.length,
    failed: citydata.errors.length,
    levels,
    byCategory: [...byCategory.values()].sort((a, b) => b.crowded - a.crowded || b.count - a.count),
    mostCrowded: byCrowd.slice(0, TOP_PLACES).map(row),
    calmest: calm.slice(0, TOP_CALM).map(row),
    rising: rising.slice(0, TOP_PLACES),
  };
}

function bikeFacts(bikes) {
  if (!bikes || bikes.error) return { error: bikes?.error ?? "받지 못함" };
  const ok = bikes.stations.filter((s) => Number.isFinite(s.bikes) && Number.isFinite(s.racks));
  const row = (s) => ({ name: s.name, bikes: s.bikes, racks: s.racks, shared: s.shared });
  return {
    sample: bikes.sample,
    stations: ok.length,
    bikes: ok.reduce((n, s) => n + s.bikes, 0),
    racks: ok.reduce((n, s) => n + s.racks, 0),
    empty: ok.filter((s) => s.bikes === 0).length,
    low: ok.filter((s) => s.bikes > 0 && s.bikes <= 2).length,
    full: ok.filter((s) => s.shared >= 100).length,
    // 거치율(%)이 높은 곳: 자전거가 몰려 반납이 어려울 수 있는 대여소.
    fullest: [...ok].sort((a, b) => b.shared - a.shared || b.bikes - a.bikes).slice(0, TOP_BIKE).map(row),
  };
}

// claude -p --json-schema로 받는 요약 모양.
export const REPORT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "overview", "crowd", "bike", "tips"],
  properties: {
    headline: { type: "string", description: "오늘 아침 서울을 한 문장으로" },
    overview: { type: "string", description: "전체 요약 2~3문장" },
    crowd: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "hotspots"],
      properties: {
        summary: { type: "string" },
        hotspots: {
          type: "array",
          maxItems: 5,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["place", "note"],
            properties: { place: { type: "string" }, note: { type: "string" } },
          },
        },
      },
    },
    bike: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "notes"],
      properties: { summary: { type: "string" }, notes: { type: "array", maxItems: 4, items: { type: "string" } } },
    },
    tips: { type: "array", maxItems: 4, items: { type: "string" }, description: "오늘 다닐 때 참고할 짧은 조언" },
  },
};

export function reportPrompt(facts) {
  return [
    `아래 JSON은 ${facts.date}(${facts.weekday}) 아침에 받은 서울 실시간 데이터를 정리한 것입니다.`,
    "- places: 서울시 주요 121장소의 실시간 혼잡도(여유·보통·약간 붐빔·붐빔)와 추정 인구 범위(population), 12시간 예측에서 단계가 오르는 곳(rising).",
    "- bikes: 따릉이 대여소 현황. empty = 자전거 0대, low = 1~2대, full = 거치율 100% 이상인 대여소 수, shared = 거치율(%).",
    "- sample이 true면 공개 sample 키로 받은 일부 데이터뿐이니 그렇다고 밝히세요. error가 있으면 그 부분은 받지 못했다고만 쓰세요.",
    "",
    "이 데이터만 근거로 한국어 아침 리포트를 스키마에 맞춰 써 주세요.",
    "- 데이터에 없는 사실(날씨, 행사, 원인 추측)은 지어내지 마세요.",
    "- 숫자는 데이터 값을 그대로 쓰고 천 단위 쉼표를 찍으세요(예: 12,345).",
    "- 문장은 짧고 담백하게 쓰세요.",
    "",
    JSON.stringify(facts),
  ].join("\n");
}

// claude -p --output-format json 결과 → { summary, model, costUsd }. 실패나 스키마 밖이면 던진다.
export function parseClaudeResult(stdout) {
  const out = JSON.parse(stdout);
  if (out.is_error || out.subtype !== "success") throw new Error(`claude 실행 실패: ${out.subtype ?? ""} ${out.result ?? ""}`.trim());
  const summary = out.structured_output;
  if (!summary || typeof summary.headline !== "string") throw new Error("claude 결과에 structured_output이 없습니다");
  return { summary, model: Object.keys(out.modelUsage ?? {})[0] ?? null, costUsd: out.total_cost_usd ?? null };
}

// 목록(reports/index.json)에 리포트 하나를 넣는다. 같은 날짜는 바꾸고, 최근 날짜가 앞에 온다.
export function upsertIndex(index, report) {
  const entry = { date: report.date, weekday: report.weekday, generatedAt: report.generatedAt, headline: report.summary?.headline ?? null };
  return [entry, ...index.filter((e) => e.date !== report.date)].sort((a, b) => b.date.localeCompare(a.date));
}

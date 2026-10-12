import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { afterEach, test } from "node:test";
import { CITYDATA_AREAS_ZIP, parseAreasZip } from "../citydata-areas.mjs";
import { CONGEST_LEVELS, createCitydataSource, toCitydata } from "../realtime-citydata.mjs";

const areas = await parseAreasZip(await readFile(new URL(`../${CITYDATA_AREAS_ZIP}`, import.meta.url)));

test("영역 zip에서 주요 121장소를 읽는다", () => {
  assert.equal(areas.length, 121);
  assert.equal(new Set(areas.map((a) => a.code)).size, 121);
  for (const a of areas) assert.match(a.code, /^POI\d{3}$/);
  const byCategory = Object.groupBy(areas, (a) => a.category);
  assert.deepEqual(Object.fromEntries(Object.entries(byCategory).map(([k, v]) => [k, v.length])),
    { 관광특구: 7, "고궁·문화유산": 5, 인구밀집지역: 48, 발달상권: 28, 공원: 33 });
  const gwanghwamun = areas.find((a) => a.code === "POI009");
  assert.equal(gwanghwamun.name, "광화문·덕수궁");
  assert.equal(gwanghwamun.category, "고궁·문화유산");
});

test("영역은 모두 서울 안의 닫힌 다각형이다", () => {
  for (const a of areas) {
    assert.ok(a.polygons.length > 0, a.name);
    for (const ring of a.polygons.flat()) {
      assert.ok(ring.length >= 4, `${a.name} 고리 점 ${ring.length}개`);
      assert.deepEqual(ring[0], ring.at(-1), `${a.name} 고리가 닫혀 있지 않다`);
      for (const [lng, lat] of ring) {
        assert.ok(lng > 126.7 && lng < 127.3 && lat > 37.4 && lat < 37.75, `${a.name} [${lng}, ${lat}]`);
      }
    }
  }
});

test("여러 조각인 장소는 조각마다 다각형 하나다(북서울꿈의숲)", () => {
  const multi = areas.filter((a) => a.polygons.length > 1);
  assert.deepEqual(multi.map((a) => a.name), ["북서울꿈의숲"]);
  assert.equal(multi[0].polygons.length, 2);
});

// 2026-10-12 sample 키 응답에서 예측을 2개만 남긴 것
const ROW = {
  AREA_NM: "광화문·덕수궁", AREA_CD: "POI009", AREA_CONGEST_LVL: "보통",
  AREA_CONGEST_MSG: "사람이 몰려있을 수 있지만 크게 붐비지는 않아요.", AREA_PPLTN_MIN: "44000", AREA_PPLTN_MAX: "46000",
  PPLTN_TIME: "2026-10-12 13:40", FCST_YN: "Y",
  FCST_PPLTN: [
    { FCST_TIME: "2026-10-12 15:00", FCST_CONGEST_LVL: "약간 붐빔", FCST_PPLTN_MIN: "42000", FCST_PPLTN_MAX: "44000" },
    { FCST_TIME: "2026-10-12 16:00", FCST_CONGEST_LVL: "여유", FCST_PPLTN_MIN: "8000", FCST_PPLTN_MAX: "8500" },
  ],
};

test("API 행을 지금·예측 값으로 바꾼다", () => {
  const c = toCitydata(ROW);
  assert.equal(c.code, "POI009");
  assert.deepEqual(c.now, { time: "2026-10-12 13:40", level: "보통", min: 44000, max: 46000 });
  assert.deepEqual(c.forecast[0], { time: "2026-10-12 15:00", level: "약간 붐빔", min: 42000, max: 44000 });
  assert.equal(c.forecast.length, 2);
  for (const v of [c.now, ...c.forecast]) assert.ok(CONGEST_LEVELS.includes(v.level));
  assert.deepEqual(toCitydata({ ...ROW, FCST_YN: "N" }).forecast, []);
});

const realFetch = globalThis.fetch;
afterEach(() => (globalThis.fetch = realFetch));
const reply = (body) => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
const OK = { "RESULT.CODE": "INFO-000", "RESULT.MESSAGE": "정상 처리되었습니다." };

test("sample 키는 한 번만 묻는다", async () => {
  const urls = [];
  globalThis.fetch = async (url) => (urls.push(url), reply({ "SeoulRtd.citydata_ppltn": [ROW], RESULT: OK }));
  const { isSample, citydata } = createCitydataSource(undefined, async () => ["POI001", "POI002", "POI009"]);
  assert.ok(isSample);
  const out = await citydata();
  assert.equal(urls.length, 1);
  assert.ok(out.sample);
  assert.deepEqual(out.areas.map((a) => a.code), ["POI009"]);
});

test("장소마다 묻고, 실패한 장소는 키를 가린 오류로 돌려준다", async () => {
  const KEY = "secret-key-123";
  const codes = Array.from({ length: 20 }, (_, i) => `POI${String(i + 1).padStart(3, "0")}`);
  globalThis.fetch = async (url) => {
    assert.ok(url.includes(KEY));
    const code = url.split("/").at(-1);
    if (code === "POI005") throw new Error(`connect failed ${url}`);
    if (code === "POI006") return reply({ RESULT: { "RESULT.CODE": "ERROR-500", "RESULT.MESSAGE": "서버 오류" } });
    return reply({ "SeoulRtd.citydata_ppltn": [{ ...ROW, AREA_CD: code }], RESULT: OK });
  };
  const { citydata } = createCitydataSource(KEY, async () => codes);
  const out = await citydata();
  assert.equal(out.sample, false);
  assert.equal(out.areas.length, 18);
  assert.deepEqual(out.errors.map((e) => e.code), ["POI005", "POI006"]);
  assert.ok(!JSON.stringify(out).includes(KEY));
  assert.match(out.errors[0].message, /\*\*\*/);
  // 캐시 동안에는 다시 묻지 않는다
  globalThis.fetch = async () => assert.fail("캐시 동안 다시 물었다");
  assert.equal(await citydata(), out);
});

test("캐시를 0으로 주면(수집기) 부를 때마다 새로 묻는다", async () => {
  let asked = 0;
  globalThis.fetch = async () => (asked++, reply({ "SeoulRtd.citydata_ppltn": [ROW], RESULT: OK }));
  const { citydata } = createCitydataSource(undefined, async () => ["POI009"], 0);
  await citydata();
  await citydata();
  assert.equal(asked, 2);
});

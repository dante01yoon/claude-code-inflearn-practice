// 실시간 도시데이터 121곳을 받아 Supabase의 crowd_snapshots에 쌓는다.
//
//   npm run collect              한 번만 (crontab 같은 외부 스케줄러용)
//   npm run collect -- --watch   5분마다 계속 (Ctrl+C로 멈춤)
//
// .env(또는 환경 변수): SEOUL_OPENAPI_KEY(없으면 sample 키, 광화문·덕수궁 1곳),
//   SUPABASE_URL(로컬은 http://127.0.0.1:54421), SUPABASE_SERVICE_ROLE_KEY(`npx supabase status`의 Secret 키).
// 시작할 때 영역 zip의 121장소를 places에 맞춰 넣는다(crowd_snapshots가 places를 참조하므로).

import { readFile } from "node:fs/promises";
import { CITYDATA_AREAS_ZIP, parseAreasZip } from "../citydata-areas.mjs";
import { CITYDATA_CACHE_MS, createCitydataSource } from "../realtime-citydata.mjs";
import { createCrowdStore, toSnapshotRows } from "../citydata-store.mjs";

try {
  process.loadEnvFile(new URL("../.env", import.meta.url));
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

const watch = process.argv.includes("--watch");
const city = createCitydataSource(process.env.SEOUL_OPENAPI_KEY);
if (city.isSample) console.warn("SEOUL_OPENAPI_KEY가 없어 공개 sample 키를 씁니다. 광화문·덕수궁 1곳만 쌓입니다.");
const store = createCrowdStore({ url: process.env.SUPABASE_URL, serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY });

const areas = await parseAreasZip(await readFile(new URL(`../${CITYDATA_AREAS_ZIP}`, import.meta.url)));
await store.savePlaces(areas);
console.log(`장소 ${areas.length}곳을 places에 맞춤`);

async function collectOnce() {
  const data = await city.citydata();
  const { rows, skipped } = toSnapshotRows(data.areas);
  const inserted = await store.saveSnapshots(rows);
  const parts = [`받음 ${data.areas.length}곳`, `새 기록 ${inserted}행`, `이미 있음 ${rows.length - inserted}행`];
  if (skipped.length) parts.push(`건너뜀 ${skipped.length}곳`);
  if (data.errors.length) parts.push(`API 오류 ${data.errors.length}곳`);
  console.log(`[${new Date().toISOString()}] ${parts.join(", ")}`);
  if (skipped.length) console.warn("건너뛴 장소", skipped.slice(0, 5));
  return data.areas.length > 0;
}

if (!watch) {
  process.exitCode = (await collectOnce().catch((err) => (console.error(city.scrub(err.message)), false))) ? 0 : 1;
} else {
  // API가 5분마다 갱신되므로 같은 간격으로 묻는다. 한 번 실패해도 멈추지 않고 다음 차례에 다시 묻는다.
  // 끝난 뒤가 아니라 시작 시각부터 5분씩 세야 수집 시간만큼 밀려서 갱신 한 번을 건너뛰는 일이 없다.
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    await collectOnce().catch((err) => console.error(`[${new Date().toISOString()}] 수집 실패: ${city.scrub(err.message)}`));
    running = false;
  };
  tick();
  setInterval(tick, CITYDATA_CACHE_MS);
}

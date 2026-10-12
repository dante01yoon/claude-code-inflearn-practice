// 아침 서울 데이터 리포트: 실시간 도시데이터 121곳과 따릉이 대여소 현황을 받아 claude -p로 요약(JSON)을 받고
// reports/YYYY-MM-DD.json에 저장한다(같은 날 다시 돌리면 덮어쓴다). 목록은 reports/index.json, 보기는 http://127.0.0.1:8000/reports/
//
//   npm run report                 받기 → 요약 → 저장
//   npm run report -- --no-claude  요약 없이 숫자만 저장(claude를 부르지 않는다)
//
// .env(또는 환경 변수): SEOUL_OPENAPI_KEY(없으면 sample 키: 도시데이터는 광화문·덕수궁 1곳, 따릉이는 5곳).
// REPORT_MODEL을 주면 claude --model로 넘기고, CLAUDE_BIN으로 claude 실행 파일 경로를 바꿀 수 있다(cron은 PATH가 짧다).
// claude에는 .env 값을 넘기지 않는다(.env를 읽기 전의 환경만 넘긴다). 프롬프트에도 키가 들어가지 않는다.

import { spawn } from "node:child_process";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { CITYDATA_AREAS_ZIP, parseAreasZip } from "../citydata-areas.mjs";
import { areaCodesFromZip, createCitydataSource } from "../realtime-citydata.mjs";
import { createBikeSource } from "../realtime-bikes.mjs";
import { REPORT_SCHEMA, parseClaudeResult, reportFacts, reportPrompt, upsertIndex } from "../daily-report.mjs";

const childEnv = { ...process.env };
try {
  process.loadEnvFile(new URL("../.env", import.meta.url));
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

const REPORTS = new URL("../reports/", import.meta.url);
const CLAUDE_TIMEOUT_MS = 5 * 60_000;
const useClaude = !process.argv.includes("--no-claude");

const city = createCitydataSource(process.env.SEOUL_OPENAPI_KEY, areaCodesFromZip, 0);
const bike = createBikeSource(process.env.SEOUL_OPENAPI_KEY);
if (city.isSample) console.warn("SEOUL_OPENAPI_KEY가 없어 공개 sample 키를 씁니다. 도시데이터 1곳, 따릉이 5곳만 받습니다.");

const areas = await parseAreasZip(await readFile(new URL(`../${CITYDATA_AREAS_ZIP}`, import.meta.url)));
const categories = new Map(areas.map((a) => [a.code, a.category]));

const [citydata, bikes] = await Promise.all([
  city.citydata().catch((err) => ({ error: city.scrub(err.message) })),
  bike.stations().then((stations) => ({ sample: bike.isSample, stations }), (err) => ({ error: bike.scrub(err.message) })),
]);
const facts = reportFacts({ citydata, categories, bikes });
console.log(`도시데이터: ${facts.places.error ?? `${facts.places.received}곳(오류 ${facts.places.failed}곳)`}, 따릉이: ${facts.bikes.error ?? `대여소 ${facts.bikes.stations}곳`}`);
if (facts.places.error && facts.bikes.error) {
  console.error("두 데이터를 모두 받지 못해 리포트를 만들지 않습니다.");
  process.exit(1);
}

// 프롬프트는 stdin으로 넘긴다. 도구는 쓰지 않고(--tools ""), 이 저장소의 CLAUDE.md를 읽지 않도록 임시 폴더에서 실행한다.
function runClaude(prompt) {
  const args = ["-p", "--output-format", "json", "--json-schema", JSON.stringify(REPORT_SCHEMA), "--tools", ""];
  if (process.env.REPORT_MODEL) args.push("--model", process.env.REPORT_MODEL);
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.CLAUDE_BIN || "claude", args, { cwd: tmpdir(), env: childEnv, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill(), CLAUDE_TIMEOUT_MS);
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (err) => (clearTimeout(timer), reject(err)));
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        resolve(parseClaudeResult(stdout));
      } catch (err) {
        reject(new Error(code ? `claude 종료 코드 ${code}: ${stderr.trim() || stdout.trim()}` : err.message));
      }
    });
    child.stdin.end(prompt);
  });
}

let summary = null;
let summaryError = null;
let meta = {};
if (useClaude) {
  try {
    const started = Date.now();
    const { summary: s, model, costUsd } = await runClaude(reportPrompt(facts));
    summary = s;
    meta = { model, costUsd, seconds: Math.round((Date.now() - started) / 1000) };
    console.log(`요약 받음(${model ?? "모델 모름"}, ${meta.seconds}초${costUsd != null ? `, $${costUsd.toFixed(4)}` : ""})`);
  } catch (err) {
    summaryError = err.message;
    console.error(`요약 실패: ${summaryError}`);
  }
}

// 쓰다가 멈춰도 반쯤 쓴 파일이 남지 않게 임시 파일에 쓰고 이름을 바꾼다.
async function writeJson(name, data) {
  const file = new URL(name, REPORTS);
  const tmp = new URL(`.${name}.tmp`, REPORTS);
  await writeFile(tmp, JSON.stringify(data, null, 2) + "\n");
  await rename(tmp, file);
}

const report = { date: facts.date, weekday: facts.weekday, generatedAt: facts.generatedAt, ...meta, summary, summaryError, facts };
await mkdir(REPORTS, { recursive: true });
await writeJson(`${report.date}.json`, report);
const index = await readFile(new URL("index.json", REPORTS), "utf8").then(JSON.parse, () => []);
await writeJson("index.json", upsertIndex(index, report));
console.log(`저장: reports/${report.date}.json`);
if (summaryError) process.exitCode = 1;

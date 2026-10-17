// 📏 하네스 적용 전(cc3d56f, 섹션 10 끝) / 적용 후(지금 커밋, 섹션 11 하네스)에 같은 부탁을 보내 숫자로 비교한다.
// 조건마다 ROUNDS번, 모두 동시에. 사용: 앱 폴더에서 node ~/bench87/before-after.mjs  (결과는 이 파일 옆 results/)
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const PROMPT = "답 카드에 '지금부터 가장 가까운 한가한 시간대'도 보여 줘. 한가함은 하루 띠의 '한' 기준이야. "
  + "계산은 next-quiet.mjs의 nextQuietHour(row, date)로 빼고 테스트도 써 줘. 질문하지 말고 끝나면 npm test로 확인해 줘.";
const ROUNDS = Number(process.env.ROUNDS ?? 3);
const ARMS = { "적용 전": "cc3d56f", "적용 후": execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim() };
const HERE = new URL(".", import.meta.url).pathname;
const sh = (cmd, args, cwd, env) => { try { return execFileSync(cmd, args, { cwd, env: env ?? process.env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { return (e.stdout ?? "") + (e.stderr ?? ""); } };

// 한 번 실행: 그 커밋을 깨끗한 복사본으로 → 같은 부탁(claude -p, JSON 결과) → 숫자와 버그 세기
function run(arm, round) {
  const dir = `/tmp/ba87/${arm === "적용 전" ? "before" : "after"}-${round}`;
  rmSync(dir, { recursive: true, force: true });
  execFileSync("git", ["clone", "-q", ".", dir]);
  execFileSync("git", ["checkout", "-q", ARMS[arm]], { cwd: dir });
  const t0 = Date.now();
  console.log(`${arm} #${round}: 시작`);
  return new Promise((resolve) => {
    const p = spawn("claude", ["-p", PROMPT, "--output-format", "json", "--permission-mode", "auto"], { cwd: dir });
    let out = "";
    p.stdout.on("data", (b) => (out += b));
    p.on("close", () => {
      const min = +((Date.now() - t0) / 60000).toFixed(1);
      let r = {};
      try { r = JSON.parse(out); } catch { r = { is_error: true, result: out.slice(0, 200) }; }
      const u = r.usage ?? {};
      // 버그 세기 ① 숨은 채점(실제 역 6곳 × 서울 시간대·한국과 다른 시간대) ② 그 복사본의 npm test 실패
      const acc = JSON.parse(sh("node", [`${HERE}accept.mjs`, dir]).trim().split("\n").pop() || "{}");
      const test = sh("npm", ["test"], dir);
      const n = (k) => Number(test.match(new RegExp(`ℹ ${k} (\\d+)`))?.[1] ?? NaN);
      const tf = Number.isNaN(n("fail")) ? 1 : n("fail");  // 테스트가 아예 못 돌면 실패 1로
      const trace = `${dir}/.claude/trace.log`;
      const stops = existsSync(trace) ? readFileSync(trace, "utf8").split("\n").filter((l) => l.includes("Stop")).length : null;
      sh("git", ["add", "-A"], dir);  // 새 파일도 세도록 (버리는 복사본)
      const diff = sh("git", ["diff", "--cached", "--shortstat", ARMS[arm]], dir).trim();
      console.log(`${arm} #${round}: 끝 (${min}분)`);
      resolve({
        조건: arm, 회: round, 분: min, 비용$: +(r.total_cost_usd ?? 0).toFixed(2), 턴: r.num_turns ?? 0,
        토큰k: Math.round(((u.input_tokens ?? 0) + (u.output_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0)) / 1000),
        출력토큰: u.output_tokens ?? 0, 숨은검사: `${acc.pass}/${acc.total}`, 테스트실패: tf,
        버그: (acc.total - acc.pass) + tf, 바뀐줄: `${diff.match(/(\d+) insertion/)?.[1] ?? 0}+`,
        Stop막음: stops === null ? "-" : Math.max(0, stops - 1),
        _: { dir, start: ARMS[arm], is_error: r.is_error, duration_ms: r.duration_ms, duration_api_ms: r.duration_api_ms, usage: u,
          models: Object.keys(r.modelUsage ?? {}), tests: `${n("pass")}/${n("tests")}`, fails: acc.fails, diff, result: String(r.result ?? "").slice(0, 600) },
      });
    });
  });
}

const jobs = [];
for (let r = 1; r <= ROUNDS; r++) for (const arm of Object.keys(ARMS)) jobs.push(run(arm, r));
const rows = (await Promise.all(jobs)).sort((a, b) => a.조건.localeCompare(b.조건) || a.회 - b.회);

// 표로 보고, 조건별 평균, 파일로 남긴다
console.table(rows.map(({ _, ...r }) => r));
const avg = Object.keys(ARMS).map((arm) => {
  const rs = rows.filter((r) => r.조건 === arm), m = (k) => +(rs.reduce((s, r) => s + r[k], 0) / rs.length).toFixed(2);
  return { 조건: arm, 평균분: m("분"), 평균비용$: m("비용$"), 평균턴: m("턴"), 평균토큰k: Math.round(m("토큰k")), 버그합계: rs.reduce((s, r) => s + r.버그, 0) };
});
console.table(avg);
mkdirSync(`${HERE}results`, { recursive: true });
writeFileSync(`${HERE}results/before-after.json`, JSON.stringify({ arms: ARMS, prompt: PROMPT, rows, avg }, null, 2));

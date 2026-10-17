// 📏 같은 부탁을 하네스 키트 없이 / 있게 실행해 숫자로 비교한다. 조건마다 ROUNDS번씩, 모두 동시에.
// 사용: node bench/kit-ab.mjs  (저장소 루트에서. 결과는 bench/results/kit-ab.json)
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const PROMPT = "SPEC.md 2단계를 구현해 줘. 질문하지 말고 스펙대로 진행하고, 끝나면 npm test로 확인해 줘";
const ROUNDS = 2;
const ARMS = {
  "키트 없음": { enabledPlugins: { "superpowers@claude-plugins-official": false } },
  "키트 있음": {},
};
const START = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const sh = (cmd, args, cwd) => { try { return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { return e.stdout ?? ""; } };

// 한 번 실행: 지금 커밋을 깨끗한 복사본으로 → 같은 부탁 → 숫자 모으기. 다른 건 플러그인 설정 한 가지뿐
function run(arm, round) {
  const dir = `/tmp/kit-ab/${arm === "키트 있음" ? "kit" : "nokit"}-${round}`;
  rmSync(dir, { recursive: true, force: true });
  execFileSync("git", ["clone", "-q", ".", dir]);
  const t0 = Date.now();
  console.log(`${arm} #${round}: 시작`);
  return new Promise((resolve) => {
    const p = spawn("claude", ["-p", PROMPT, "--output-format", "stream-json", "--verbose", "--permission-mode", "auto",
      "--settings", JSON.stringify(ARMS[arm])], { cwd: dir });
    let buf = "", result = null;
    const skills = new Set();
    p.stdout.on("data", (b) => {
      buf += b;
      const lines = buf.split("\n"); buf = lines.pop();
      for (const l of lines) {
        const e = JSON.parse(l);
        if (e.type === "result") result = e;
        for (const c of e.message?.content ?? []) if (c.type === "tool_use" && c.name === "Skill") skills.add(c.input.skill);
      }
    });
    p.on("close", () => {
      const test = sh("npm", ["test"], dir);
      const n = (k) => Number(test.match(new RegExp(`ℹ ${k} (\\d+)`))?.[1] ?? NaN);
      sh("git", ["add", "-A"], dir);  // 새 파일도 세도록 (버리는 복사본)
      const diff = sh("git", ["diff", "--cached", "--shortstat", START], dir).trim();
      const min = (Date.now() - t0) / 60000;
      console.log(`${arm} #${round}: 끝 (${min.toFixed(1)}분)`);
      resolve({ 조건: arm, 회: round, 분: +min.toFixed(1), 비용달러: +result.total_cost_usd.toFixed(2), 턴: result.num_turns,
        출력토큰: result.usage.output_tokens, 테스트: `${n("pass")}/${n("tests")} · 실패 ${n("fail")}`,
        바뀐줄: (diff.match(/(\d+) insertion/)?.[1] ?? 0) + "+ " + (diff.match(/(\d+) deletion/)?.[1] ?? 0) + "-",
        쓴스킬: [...skills].join(", ") || "-" });
    });
  });
}

const jobs = [];
for (let r = 1; r <= ROUNDS; r++) for (const arm of Object.keys(ARMS)) jobs.push(run(arm, r));
const rows = await Promise.all(jobs);

// 표로 보고, 조건별 평균, 파일로 남긴다
console.table(rows);
const avg = Object.keys(ARMS).map((arm) => {
  const rs = rows.filter((r) => r.조건 === arm), m = (k) => +(rs.reduce((s, r) => s + r[k], 0) / rs.length).toFixed(2);
  return { 조건: arm, 평균분: m("분"), 평균비용달러: m("비용달러"), 평균턴: m("턴"), 평균출력토큰: Math.round(m("출력토큰")) };
});
console.table(avg);
mkdirSync("bench/results", { recursive: true });
writeFileSync("bench/results/kit-ab.json", JSON.stringify({ start: START, prompt: PROMPT, rows, avg }, null, 2));

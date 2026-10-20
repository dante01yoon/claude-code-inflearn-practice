// Sum every "result" event across one condition's stream-json logs into one session.json.
// duration: sum of each result's duration_ms (agent working time; time a person took to approve is not counted).
// cost/tokens: from the last result's cumulative modelUsage (resumed sessions report running totals).
import fs from "node:fs";
const [out, ...logs] = process.argv.slice(2);
let duration = 0, turns = 0, last = null;
for (const log of logs) {
  for (const line of fs.readFileSync(log, "utf8").split("\n")) {
    let j; try { j = JSON.parse(line); } catch { continue; }
    if (j.type !== "result") continue;
    duration += j.duration_ms ?? 0; turns += j.num_turns ?? 0; last = j;
  }
}
const mu = Object.values(last.modelUsage ?? {});
const sum = (k) => mu.reduce((a, m) => a + (m[k] ?? 0), 0);
const session = {
  duration_ms: duration, num_turns: turns, total_cost_usd: last.total_cost_usd,
  usage: { input_tokens: sum("inputTokens"), output_tokens: sum("outputTokens"), cache_read_input_tokens: sum("cacheReadInputTokens"), cache_creation_input_tokens: sum("cacheCreationInputTokens") },
  models: Object.keys(last.modelUsage ?? {}), logs: logs.map((l) => l.split("/").slice(-2).join("/")),
};
fs.writeFileSync(out, JSON.stringify(session, null, 2) + "\n");
console.log(JSON.stringify(session));

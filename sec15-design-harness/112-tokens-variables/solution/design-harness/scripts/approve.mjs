#!/usr/bin/env node
// Record a person's approval for a human gate: npm run approve -- system --by 단테 [--note "..."]
import fs from "node:fs";
import { HUMAN_GATES, exists, gateHash, paths, projectName, readJson } from "./lib.mjs";

const phase = process.argv[2];
const arg = (k) => { const i = process.argv.indexOf(k); return i === -1 ? undefined : process.argv[i + 1]; };
const by = arg("--by");
if (!HUMAN_GATES.includes(phase) || !by) {
  console.error(`사용법: npm run approve -- <${HUMAN_GATES.join("|")}> --by <이름> [--note 메모]`);
  process.exit(1);
}
const p = paths(projectName());
const approvals = exists(p.approvals) ? readJson(p.approvals) : {};
approvals[phase] = { by, at: new Date().toISOString(), note: arg("--note") ?? "", hash: gateHash(p, phase) };
fs.writeFileSync(p.approvals, JSON.stringify(approvals, null, 2) + "\n");
console.log(`승인 기록: ${phase} (${by})`);

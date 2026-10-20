#!/usr/bin/env node
// use_figma returns at most 20 KB, so frames are exported one per call into figma/parts/*.json
// ({ frames, next } as returned by export-nodes.js). This joins them into figma/nodes.json.
// Usage: npm run nodes:merge [-- --dir <parts dir> --out <file> --file-key <key>]
import fs from "node:fs";
import path from "node:path";
import { exists, paths, projectName, readJson } from "./lib.mjs";

const arg = (k) => { const i = process.argv.indexOf(k); return i === -1 ? undefined : process.argv[i + 1]; };
const p = arg("--dir") ? null : paths(projectName());
const dir = arg("--dir") ?? path.join(p.work, "figma", "parts");
const out = arg("--out") ?? p.nodes;
const fileKey = arg("--file-key") ?? (p && exists(p.figma) ? readJson(p.figma).fileKey : null);

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
if (!files.length) throw new Error(`${dir}에 프레임 파일이 없습니다`);
const frames = [];
let oldest = Infinity;
for (const f of files) {
  const part = readJson(path.join(dir, f));
  if (!Array.isArray(part.frames)) throw new Error(`${f}: export-nodes.js 결과가 아닙니다 (frames 없음)`);
  frames.push(...part.frames);
  oldest = Math.min(oldest, fs.statSync(path.join(dir, f)).mtimeMs);
}
// The export is only as fresh as its oldest frame.
fs.writeFileSync(out, JSON.stringify({ fileKey, exportedAt: new Date(oldest).toISOString(), frames }, null, 2) + "\n");
console.log(`${frames.length}개 프레임 → ${out}`);

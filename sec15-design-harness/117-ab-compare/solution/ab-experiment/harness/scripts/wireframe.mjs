#!/usr/bin/env node
// Gray-box SVG per screen from wireframes.json, for the human wireframe gate.
// Thicker outline = higher priority (1 is the thing the eye should land on first).
import fs from "node:fs";
import path from "node:path";
import { paths, projectName, readJson } from "./lib.mjs";

const p = paths(projectName());
const { viewport, screens } = readJson(p.ia);
const wf = readJson(p.wireframes);
const dir = path.join(p.out, "wireframes");
fs.mkdirSync(dir, { recursive: true });
const esc = (s) => s.replace(/[<&>]/g, (c) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;" })[c]);

for (const s of screens) {
  let y = 0;
  const boxes = (wf[s.id] ?? []).map((r) => {
    const box = `<rect x="8" y="${y + 4}" width="${viewport.width - 16}" height="${r.height - 8}" rx="6" fill="#F2F2F2" stroke="#333" stroke-width="${6 - Math.min(r.priority, 5)}"/>
${r.height < 56
  ? // Short regions get one line so text never spills out of the box.
    `<text x="20" y="${y + r.height / 2 + 4}" font-size="12" font-family="sans-serif" fill="#111">${r.priority}. ${esc(r.region)} — <tspan fill="#555">${esc(r.content).slice(0, 34)}</tspan></text>`
  : `<text x="20" y="${y + 26}" font-size="13" font-family="sans-serif" fill="#111">${r.priority}. ${esc(r.region)}</text>
<text x="20" y="${y + 46}" font-size="12" font-family="sans-serif" fill="#555">${esc(r.content).slice(0, 48)}</text>`}`;
    y += r.height;
    return box;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewport.width}" height="${viewport.height}" viewBox="0 0 ${viewport.width} ${viewport.height}">
<rect width="100%" height="100%" fill="#FFF"/>
${boxes.join("\n")}
${y > viewport.height ? `<text x="20" y="${viewport.height - 12}" font-size="12" fill="#B3261E">영역 높이 합 ${y}px > 화면 ${viewport.height}px (스크롤)</text>` : ""}
</svg>\n`;
  fs.writeFileSync(path.join(dir, `${s.id}.svg`), svg);
  console.log(`와이어프레임 ${s.id}.svg (영역 ${wf[s.id]?.length ?? 0}개, 높이 ${y}px)`);
}

#!/usr/bin/env node
// Writes HANDOFF.md from the artifacts, so the handoff never says more than the files do.
import fs from "node:fs";
import { exists, flattenTokens, paths, projectName, readJson } from "./lib.mjs";
import { lintFigma, loadLintInput } from "./lint-figma.mjs";

const project = projectName();
const p = paths(project);
const ia = readJson(p.ia);
const flat = flattenTokens(readJson(p.tokens));
const components = readJson(p.components).components;
const figma = exists(p.figma) ? readJson(p.figma) : {};
const nodes = exists(p.nodes) ? readJson(p.nodes) : null;
const review = exists(p.review) ? readJson(p.review) : null;
const findings = nodes ? lintFigma(loadLintInput(project)) : [];

const lines = [];
const out = (s = "") => lines.push(s);
out(`# 핸드오프: ${project}`);
out();
out(`- Figma: ${figma.fileKey ? `https://www.figma.com/design/${figma.fileKey}` : "아직 없음"}${nodes?.fixture ? " (린트는 예시 픽스처 기준)" : ""}`);
out(`- 노드 내보낸 시각: ${nodes?.exportedAt ?? "-"}`);
out(`- 화면 크기: ${ia.viewport.width}×${ia.viewport.height}`);
out();
out("## 화면과 상태");
out();
out("| 화면 | 기능 | " + ia.requiredStates.join(" | ") + " |");
out("|---|---|" + ia.requiredStates.map(() => "---").join("|") + "|");
const frameNames = new Set(nodes?.frames.map((f) => f.name) ?? []);
for (const s of ia.screens)
  out(`| ${s.title} (\`${s.id}\`) | ${s.features.join(", ")} | ` + ia.requiredStates.map((st) => (!(s.states ?? ia.requiredStates).includes(st) ? "해당 없음" : frameNames.has(`${s.id}/${st}`) ? "있음" : "없음")).join(" | ") + " |");
out();
out("## 흐름");
out();
for (const f of ia.flows) out(`- ${f.goal}: ${f.steps.join(" → ")}`);
out();
out("## 토큰");
out();
out("| 토큰 | 값 | 종류 |");
out("|---|---|---|");
for (const [k, t] of Object.entries(flat)) if (!k.startsWith("primitive.")) out(`| \`${k}\` | ${Array.isArray(t.value) ? t.value.join(", ") : t.value} | ${t.type} |`);
out();
out("## 컴포넌트");
out();
for (const c of components)
  out(`- **${c.name}**${c.variants ? ` (${c.variants.join(", ")})` : ""}${c.interactive ? ", 누를 수 있음" : ""}: ${Object.entries(c.tokens).map(([k, v]) => `${k}=\`${v}\``).join(", ")}`);
out();
out("## 기계 검사 결과");
out();
const errors = findings.filter((f) => f.severity === "error");
out(`오류 ${errors.length}개, 경고 ${findings.length - errors.length}개`);
for (const f of findings) out(`- ${f.severity === "error" ? "오류" : "경고"} \`${f.rule}\` ${f.where}: ${f.message}`);
out();
out("## 사람 검토");
out();
if (!review) out("아직 없음 (`npm run review`)");
else {
  const scored = review.checklist.filter((c) => c.score != null);
  out(`검토자: ${review.reviewer ?? "-"}, 점수 ${scored.reduce((a, c) => a + c.score, 0)}/${review.checklist.length * 2} (채점 ${scored.length}/${review.checklist.length})`);
  for (const c of review.checklist) out(`- [${c.score ?? " "}] ${c.question}${c.note ? ` — ${c.note}` : ""}`);
  for (const f of review.findings ?? []) out(`- **${f.severity}** ${f.where}: ${f.issue}`);
}
fs.writeFileSync(p.handoff, lines.join("\n") + "\n");
console.log(`HANDOFF.md 작성 (${lines.length}줄)`);

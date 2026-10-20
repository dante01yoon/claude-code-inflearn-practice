import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// HARNESS: where this code lives (repo or installed plugin). ROOT: the project whose work/ we gate.
export const HARNESS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ROOT = path.resolve(process.env.DESIGN_HARNESS_ROOT || process.env.CLAUDE_PROJECT_DIR || process.cwd());

// Order matters: each phase's gate assumes the earlier ones passed.
export const PHASES = ["prd", "research", "ia", "wireframe", "system", "figma", "verify", "handoff"];
// Phases a person must approve before the next one starts.
export const HUMAN_GATES = ["wireframe", "system", "verify"];

// --project <name>, or the only folder under work/.
export function projectName(argv = process.argv) {
  const i = argv.indexOf("--project");
  if (i !== -1 && argv[i + 1]) return argv[i + 1];
  if (process.env.HARNESS_PROJECT) return process.env.HARNESS_PROJECT;
  const active = path.join(ROOT, "work", ".active");
  if (fs.existsSync(active)) return fs.readFileSync(active, "utf8").trim();
  if (!hasWorkspace()) throw new Error(`${ROOT}에 work/ 폴더가 없습니다. design-harness new <이름>으로 프로젝트를 만드세요.`);
  const dirs = fs.readdirSync(path.join(ROOT, "work"), { withFileTypes: true }).filter((d) => d.isDirectory());
  if (dirs.length !== 1) throw new Error(`프로젝트가 ${dirs.length}개입니다. --project <이름>을 주거나 work/.active에 적으세요.`);
  return dirs[0].name;
}

// False in projects that have the plugin enabled but never started a design: hooks stay out of the way.
export const hasWorkspace = () => fs.existsSync(path.join(ROOT, "work"));

export function paths(project) {
  const work = path.join(ROOT, "work", project);
  return {
    work,
    out: path.join(ROOT, "out", project),
    prd: path.join(work, "PRD.md"),
    research: path.join(work, "research.md"),
    references: path.join(work, "references.json"),
    refShots: path.join(work, "references"),
    ia: path.join(work, "ia.json"),
    wireframes: path.join(work, "wireframes.json"),
    tokens: path.join(work, "tokens.json"),
    components: path.join(work, "components.json"),
    copy: path.join(work, "copy.json"),
    figma: path.join(work, "figma.json"),
    nodes: path.join(work, "figma", "nodes.json"),
    review: path.join(work, "review.json"),
    handoff: path.join(work, "HANDOFF.md"),
    approvals: path.join(work, "approvals.json"),
    failures: path.join(work, "failures.jsonl"),
  };
}

// What a person looked at when approving each human gate. Approval goes stale if these change.
export const GATE_FILES = { wireframe: ["ia", "wireframes"], system: ["tokens", "components", "copy"], verify: ["nodes", "review"] };
export function gateHash(p, phase) {
  const h = crypto.createHash("sha256");
  for (const k of GATE_FILES[phase]) h.update(fs.existsSync(p[k]) ? fs.readFileSync(p[k]) : "");
  return h.digest("hex").slice(0, 16);
}

export const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
export const exists = (file) => fs.existsSync(file);

// Append one line per failed check so repeated mistakes can be turned into rules.
export function logFailure(project, phase, check, message) {
  const line = JSON.stringify({ at: new Date().toISOString(), phase, check, message });
  fs.appendFileSync(paths(project).failures, line + "\n");
}

// Flatten DTCG tokens to { "color.brand": { value, type } } with aliases resolved.
export function flattenTokens(doc) {
  const raw = {};
  const walk = (node, prefix, inheritedType) => {
    const type = node.$type ?? inheritedType;
    if ("$value" in node) {
      raw[prefix.join(".")] = { value: node.$value, type };
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("$") || typeof child !== "object" || child === null) continue;
      walk(child, [...prefix, key], type);
    }
  };
  walk(doc, [], undefined);
  const resolve = (name, seen = []) => {
    if (seen.includes(name)) throw new Error(`토큰 별칭 순환: ${[...seen, name].join(" -> ")}`);
    const token = raw[name];
    if (!token) throw new Error(`없는 토큰을 참조: {${name}}`);
    const m = typeof token.value === "string" && token.value.match(/^\{(.+)\}$/);
    return m ? resolve(m[1], [...seen, name]) : token.value;
  };
  const out = {};
  for (const [name, token] of Object.entries(raw)) {
    if (!token.type) throw new Error(`$type을 알 수 없는 토큰: ${name}`);
    out[name] = { value: resolve(name), type: token.type };
  }
  return out;
}

export function resolveRef(flat, ref) {
  const m = ref.match(/^\{(.+)\}$/);
  if (!m || !flat[m[1]]) throw new Error(`없는 토큰을 참조: ${ref}`);
  return flat[m[1]].value;
}

// WCAG 2.x relative luminance / contrast ratio.
export function contrastRatio(hexA, hexB) {
  const lum = (hex) => {
    const n = hex.replace("#", "");
    const full = n.length === 3 ? [...n].map((c) => c + c).join("") : n;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const [hi, lo] = [lum(hexA), lum(hexB)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

// Figma colors are {r,g,b} in 0..1.
export const figmaHex = ({ r, g, b }) =>
  "#" + [r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
// A paint from export-nodes.js carries hex; older exports and fixtures carry color {r,g,b}.
export const paintHex = (p) => (p.hex ?? figmaHex(p.color)).toUpperCase();

export function report(results) {
  let failed = 0;
  for (const r of results) {
    const mark = { pass: "PASS", fail: "FAIL", wait: "WAIT", skip: "SKIP", todo: "TODO" }[r.status];
    if (r.status === "fail") failed++;
    console.log(`${mark.padEnd(4)} ${r.phase.padEnd(10)} ${r.check}${r.message ? " — " + r.message : ""}`);
  }
  return failed;
}

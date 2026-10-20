#!/usr/bin/env node
// Writes DESIGN.md (google-labs-code/design.md format) from tokens.json, components.json and copy.json,
// then runs the official linter on it. Tokens the format has no slot for go into the prose, never dropped.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { contrastRatio, flattenTokens, logFailure, paths, projectName, readJson, resolveRef } from "./lib.mjs";

// tokens.json group -> DESIGN.md front matter group. Only semantic tokens: code never uses primitives.
const GROUPS = { color: "colors", space: "spacing", radius: "rounded", "font-size": "typography" };
// components.json token key -> DESIGN.md component sub-token. Other keys stay in the prose.
const PROPS = { fill: "backgroundColor", background: "backgroundColor", color: "textColor", radius: "rounded", padding: "padding", minSize: "size", size: "size", height: "height", width: "width" };
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const show = (v) => (Array.isArray(v) ? v.join(", ") : String(v));

// The official CLI ships as a dependency; `design-harness setup` installs it for local-path plugins.
export function designMdCli(args, input) {
  let bin;
  try {
    bin = fileURLToPath(import.meta.resolve("@google/design.md"));
  } catch {
    throw new Error("@google/design.md가 없습니다. design-harness setup을 먼저 실행하세요.");
  }
  const run = spawnSync(process.execPath, [bin, ...args], { input, encoding: "utf8" });
  if (run.error) throw run.error;
  return run;
}

// Returns the markdown plus a ledger: which token went to which DTCG path, and which live only in prose.
export function buildDesignMd({ project, tokens, components, copy }) {
  const flat = flattenTokens(tokens);
  const exported = {}; // "color.brand" -> "color.brand" (path in the DTCG export)
  const proseOnly = [];
  const yaml = { colors: {}, typography: {}, rounded: {}, spacing: {} };
  const refOf = {}; // token path -> "{group.name}" usable inside components
  const family = flat["font-family.base"]?.value;
  const firstFamily = Array.isArray(family) ? family[0] : family;

  for (const [k, t] of Object.entries(flat)) {
    const [group, ...rest] = k.split(".");
    const name = rest.join("-");
    const target = GROUPS[group];
    if (!target || rest.length === 0) {
      proseOnly.push(k);
      continue;
    }
    if (target === "typography") {
      yaml.typography[name] = { ...(firstFamily ? { fontFamily: firstFamily } : {}), fontSize: t.value };
      exported[k] = `typography.${name}.fontSize`;
    } else {
      yaml[target][name] = t.value;
      exported[k] = `${{ colors: "color", spacing: "spacing", rounded: "rounded" }[target]}.${name}`;
    }
    refOf[k] = `{${target}.${name}}`;
  }
  // Typography levels carry the first family; the fallback stack is prose.
  if (firstFamily && Object.keys(yaml.typography).length) exported["font-family.base"] = "typography.*.fontFamily";
  const aliases = {};
  // DESIGN.md expects a `primary` color; point it at the brand color instead of inventing one.
  if (!yaml.colors.primary && yaml.colors.brand) {
    yaml.colors = { primary: "{colors.brand}", ...yaml.colors };
    aliases["color.primary"] = "color.brand";
  }
  const leftovers = proseOnly.filter((k) => !(k === "font-family.base" && exported[k]));

  const comps = {};
  const unmapped = {}; // component name -> [[key, token]]
  for (const c of components.components) {
    const props = {};
    for (const [key, token] of Object.entries(c.tokens ?? {})) {
      const t = flat[token];
      let prop = PROPS[key];
      if (key === "text") prop = t?.type === "color" ? "textColor" : token.startsWith("font-size.") ? "typography" : undefined;
      if ((prop === "backgroundColor" || prop === "textColor") && t?.type !== "color") prop = undefined;
      if (prop === "typography" && !refOf[token]) prop = undefined;
      if (!prop || props[prop] || !t) {
        (unmapped[c.name] ??= []).push([key, token]);
        continue;
      }
      // Tokens without a DESIGN.md group (size.*) go in as their literal value.
      props[prop] = refOf[token] ?? show(t.value);
    }
    if (Object.keys(props).length) comps[kebab(c.name)] = props;
  }

  const front = { version: "alpha", name: project, ...(tokens.$description ? { description: tokens.$description } : {}) };
  for (const [g, v] of Object.entries(yaml)) if (Object.keys(v).length) front[g] = v;
  if (Object.keys(comps).length) front.components = comps;

  const lines = ["---", ...toYaml(front), "---", ""];
  const out = (s = "") => lines.push(s);
  const ext = tokens.$extensions ?? {};
  const mentioned = new Set(); // prose-only tokens already written out
  // " ← `primitive.x`" for an alias; the primitive then counts as written out.
  const src = (k) => {
    const raw = rawValue(tokens, k);
    if (typeof raw !== "string" || !/^\{.+\}$/.test(raw)) return "";
    mentioned.add(raw.slice(1, -1));
    return ` ← \`${raw.slice(1, -1)}\``;
  };
  const listToken = (k) => (mentioned.add(k), out(`- \`${k}\`: ${show(flat[k].value)}${src(k)}`));
  out(`# ${project} 디자인 시스템`);
  out();
  out("> `design-harness design-md`가 `tokens.json`·`components.json`·`copy.json`에서 만든 파일이다. 여기를 고치지 말고 원본을 고친 뒤 다시 만든다.");
  out();
  out("## Overview");
  out();
  if (tokens.$description) out(tokens.$description);
  if (copy.tone) out(`\n문구 톤: ${copy.tone}`);
  out();
  out("## Colors");
  out();
  out("코드와 화면은 아래 semantic 색만 쓴다. primitive 값은 출처로만 적는다.");
  out();
  for (const [k, t] of Object.entries(flat)) if (k.startsWith("color.")) out(`- **${k.slice(6)}** (${t.value})${src(k)}`);
  for (const [a, b] of Object.entries(aliases)) out(`- **${a.slice(6)}**: \`${b}\`의 별칭 (DESIGN.md의 대표 색 자리)`);
  const pairs = ext["harness.contrastPairs"] ?? [];
  if (pairs.length) {
    out();
    out("지켜야 할 명도 대비:");
    out();
    for (const pr of pairs) {
      const ratio = contrastRatio(resolveRef(flat, pr.fg), resolveRef(flat, pr.bg));
      out(`- \`${pr.fg.slice(1, -1)}\` / \`${pr.bg.slice(1, -1)}\`: ${pr.min}:1 이상 (현재 ${ratio.toFixed(2)}:1)`);
    }
  }
  out();
  out("## Typography");
  out();
  if (family) out(`- 글꼴: ${show(family)} (\`font-family.base\`, 토큰에는 첫 글꼴만 적는다)`);
  for (const k of Object.keys(exported)) if (k.startsWith("font-size.")) out(`- \`${k}\`: ${flat[k].value}${src(k)}`);
  for (const k of leftovers.filter((k) => /^(font-family|font-weight|line-height)\./.test(k))) listToken(k);
  out();
  out("굵기와 행간은 tokens.json에서 글자 크기와 짝지어 정하지 않았으므로 front matter의 typography에는 크기와 글꼴만 있다.");
  out();
  out("## Layout");
  out();
  const grid = ext["harness.grid"];
  if (grid) out(`- 격자: 기준 ${grid.base}px, 좌우 여백 ${grid.margin}px${grid.columns ? `, ${grid.columns}열` : ""}${grid.gutter ? `, 열 간격 ${grid.gutter}px` : ""}`);
  for (const k of Object.keys(exported)) if (k.startsWith("space.")) out(`- \`${k}\`: ${flat[k].value}${src(k)}`);
  for (const k of leftovers.filter((k) => k.startsWith("size."))) listToken(k);
  out();
  out("## Shapes");
  out();
  for (const k of Object.keys(exported)) if (k.startsWith("radius.")) out(`- \`${k}\`: ${flat[k].value}${src(k)}`);
  if (ext["harness.allowRawRadius"]) out(`- 토큰 밖에서 허용하는 모서리: ${ext["harness.allowRawRadius"].map((r) => `${r}px`).join(", ")}`);
  out();
  out("## Components");
  out();
  for (const c of components.components) {
    const bits = [c.interactive ? "누를 수 있음" : null, c.variants?.length ? `변형 ${c.variants.join(", ")}` : null].filter(Boolean);
    out(`- **${c.name}** (\`${kebab(c.name)}\`)${bits.length ? `: ${bits.join(", ")}` : ""}`);
    for (const [key, token] of unmapped[c.name] ?? []) out(`  - ${key}: \`${token}\` (${show(flat[token]?.value ?? "없는 토큰")})`);
    if (c.note) out(`  - ${c.note}`);
  }
  out();
  out("## Do's and Don'ts");
  out();
  out("- Do: primitive 값 대신 semantic 토큰을 쓴다.");
  if (flat["size.touch"]) out(`- Do: 누를 수 있는 요소는 ${flat["size.touch"].value} 이상으로 만든다.`);
  if (copy.maxButtonChars) out(`- Do: 버튼 문구는 ${copy.maxButtonChars}자 이내로 쓴다.`);
  for (const b of copy.banned ?? []) out(`- Don't: 「${b}」 표현을 쓰지 않는다.`);
  // Unknown headings are allowed after the canonical eight.
  const examples = Object.entries(copy.examples ?? {});
  if (examples.length) {
    out();
    out("## 문구 예");
    out();
    out("| 자리 | 문구 |");
    out("|---|---|");
    for (const [k, v] of examples) out(`| ${k} | ${v.replace(/\|/g, "\\|")} |`);
  }
  // Groups this script has no section for (e.g. shadow) still reach the reader.
  const rest = leftovers.filter((k) => !mentioned.has(k));
  if (rest.length) {
    out();
    out("## 그 밖의 토큰");
    out();
    for (const k of rest) listToken(k);
  }
  lines.push("");
  return { markdown: lines.join("\n"), exported, aliases, proseOnly: leftovers };
}

// DESIGN.md front matter is plain maps of strings and numbers; JSON scalars are valid YAML.
function toYaml(obj, indent = "") {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = /^[A-Za-z_][\w-]*$/.test(k) ? k : JSON.stringify(k);
    return v !== null && typeof v === "object" ? [`${indent}${key}:`, ...toYaml(v, indent + "  ")] : [`${indent}${key}: ${JSON.stringify(v)}`];
  });
}

function rawValue(doc, dotted) {
  const node = dotted.split(".").reduce((n, k) => n?.[k], doc);
  return node?.$value;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const project = projectName();
  const p = paths(project);
  const { markdown, proseOnly } = buildDesignMd({ project, tokens: readJson(p.tokens), components: readJson(p.components), copy: readJson(p.copy) });
  fs.writeFileSync(p.designMd, markdown);
  console.log(`${p.designMd} 작성 (front matter 밖 토큰 ${proseOnly.length}개는 본문에)`);
  const lint = designMdCli(["lint", p.designMd]);
  const { findings = [], summary } = JSON.parse(lint.stdout || "{}");
  for (const f of findings) if (f.severity !== "info") console.log(`${f.severity === "error" ? "ERROR" : "warn "} ${(f.rule ?? "").padEnd(16)} ${f.path ?? ""} — ${f.message}`);
  console.log(`\ndesign.md lint: 오류 ${summary?.errors ?? "?"}개, 경고 ${summary?.warnings ?? "?"}개`);
  if (lint.status !== 0) {
    for (const f of findings.filter((f) => f.severity === "error")) logFailure(project, "system", `design-md:${f.rule}`, `${f.path ?? ""}: ${f.message}`);
    process.exitCode = 1;
  }
}

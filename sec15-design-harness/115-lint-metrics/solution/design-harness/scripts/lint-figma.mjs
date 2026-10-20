#!/usr/bin/env node
// Machine checks on exported Figma nodes (figma/nodes.json). Things a person must judge
// (hierarchy, tone, brand feel) live in review.json instead.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { contrastRatio, paintHex, flattenTokens, paths, projectName, readJson, logFailure } from "./lib.mjs";

const DEFAULT_NAME = /^(Frame|Rectangle|Group|Ellipse|Text|Vector|Line|Polygon|Star|Instance|Component)( \d+)?$/;
const px = (v) => (typeof v === "string" ? parseFloat(v) : v);

export function lintFigma({ nodes, tokens, ia, components, copy }) {
  const flat = flattenTokens(tokens);
  const values = (prefix) =>
    Object.entries(flat).filter(([k]) => k.startsWith(prefix + ".")).map(([, t]) => t.value);
  const colorByHex = new Map(
    Object.entries(flat).filter(([, t]) => t.type === "color").map(([k, t]) => [t.value.toUpperCase(), k]),
  );
  const fontSizes = values("font-size").map(px);
  const fontWeights = values("font-weight");
  const spaces = [0, ...values("space").map(px)];
  const radii = [...(tokens.$extensions?.["harness.allowRawRadius"] ?? [0]), ...values("radius").map(px)];
  const family = flat["font-family.base"].value[0];
  const touch = px(flat["size.touch"].value);
  const grid = tokens.$extensions?.["harness.grid"] ?? { base: 4, margin: 16 };
  const interactive = new Set(components.components.filter((c) => c.interactive).map((c) => c.name));
  const tokenNames = new Set(Object.keys(flat));
  const hasVariants = new Set(components.components.filter((c) => c.variants?.length).map((c) => c.name));
  const findings = [];
  const add = (rule, severity, where, message) => findings.push({ rule, severity, where, message });

  const isInteractive = (n) => interactive.has(n.component ?? n.name.split("/")[0]);
  const solid = (paints = []) => paints.find((p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0);

  function visit(node, trail, bgHex, frame) {
    const where = [...trail, node.name].join(" > ");
    if (DEFAULT_NAME.test(node.name)) add("layer-name", "warn", where, "기본 레이어 이름 — 역할이 드러나게 바꾸세요");

    for (const [kind, paints] of [["fill", node.fills], ["stroke", node.strokes]]) {
      const paint = solid(paints);
      if (!paint) continue;
      const hex = paintHex(paint);
      const bound = node.boundVariables?.[kind === "fill" ? "fills" : "strokes"];
      if (bound) {
        const name = bound.replace(/\//g, ".");
        if (!tokenNames.has(name)) add("unknown-variable", "error", where, `토큰에 없는 변수 ${bound}`);
      } else if (colorByHex.has(hex)) {
        add("unbound-color", "warn", where, `${hex}는 ${colorByHex.get(hex)}와 같지만 변수에 연결되지 않음`);
      } else {
        add("color-off-token", "error", where, `${kind} ${hex}는 토큰에 없는 색`);
      }
    }
    const ownFill = solid(node.fills);
    const bg = node.type !== "TEXT" && ownFill ? paintHex(ownFill) : bgHex;

    if (node.type === "TEXT") {
      if (!fontSizes.includes(node.fontSize)) add("font-size-off-scale", "error", where, `글자 크기 ${node.fontSize}px는 타입 스케일 밖`);
      if (!fontWeights.includes(node.fontWeight)) add("font-weight-off-scale", "error", where, `굵기 ${node.fontWeight}는 토큰 밖`);
      if (node.fontFamily && node.fontFamily !== family) add("font-family", "error", where, `서체 ${node.fontFamily} (기준 ${family})`);
      const fg = solid(node.fills);
      if (fg && bg) {
        const ratio = contrastRatio(paintHex(fg), bg);
        const large = node.fontSize >= 24 || (node.fontSize >= 18.66 && node.fontWeight >= 700);
        const min = large ? 3 : 4.5;
        if (ratio < min) add("contrast", "error", where, `명도 대비 ${ratio.toFixed(2)}:1 < ${min}:1`);
      }
      const text = node.characters ?? "";
      for (const word of copy.banned) if (text.includes(word)) add("copy-banned", "error", where, `금지 표현 "${word}"`);
      if (trail.some((t) => t.startsWith("Button")) && [...text].length > copy.maxButtonChars)
        add("copy-button-length", "warn", where, `버튼 문구 ${[...text].length}자 > ${copy.maxButtonChars}자`);
    }

    if (node.layoutMode && node.layoutMode !== "NONE") {
      for (const key of ["itemSpacing", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom"]) {
        if (node[key] != null && !spaces.includes(node[key]))
          add("spacing-off-scale", "error", where, `${key} ${node[key]}px는 간격 토큰 밖`);
      }
    }
    if (node.cornerRadius != null && !radii.includes(node.cornerRadius))
      add("radius-off-scale", "error", where, `모서리 ${node.cornerRadius}px는 토큰 밖`);

    if (isInteractive(node) && (node.width < touch || node.height < touch))
      add("touch-target", "error", where, `터치 영역 ${node.width}×${node.height} < ${touch}×${touch}`);

    // Direct children of a screen frame sit inside the side margins unless they are full-bleed
    // (covering the whole width, including oversized backgrounds such as a panned map image).
    if (frame && trail.length === 1) {
      const right = frame.width - (node.x + node.width);
      const fullBleed = node.x <= 0 && right <= 0;
      if (!fullBleed && (node.x < grid.margin || right < grid.margin))
        add("grid-margin", "warn", where, `좌우 여백 ${grid.margin}px 밖 (x=${node.x}, w=${node.width})`);
      // Right-anchored nodes are measured from the right edge: frame widths like 390 are not on the grid.
      if (!fullBleed) {
        if (right < node.x ? right % grid.base !== 0 : node.x % grid.base !== 0)
          add("grid-base", "warn", where, right < node.x ? `오른쪽 여백 ${right}가 ${grid.base}px 격자에 안 맞음` : `x=${node.x}가 ${grid.base}px 격자에 안 맞음`);
        if (node.y % grid.base !== 0) add("grid-base", "warn", where, `y=${node.y}가 ${grid.base}px 격자에 안 맞음`);
      }
    }

    for (const child of node.children ?? []) visit(child, [...trail, node.name], bg, frame);
  }

  // Screen frames are named "<screen-id>/<state>".
  const frames = nodes.frames ?? [];
  const seen = new Set();
  const byComponent = new Map();
  for (const f of frames) {
    const [screen, state] = f.name.split("/");
    const spec = ia.screens.find((s) => s.id === screen);
    if (!spec || !(spec.states ?? ia.requiredStates).includes(state)) {
      add("frame-name", "error", f.name, `화면 프레임 이름은 "<화면 id>/<상태>" (${ia.requiredStates.join(", ")})`);
    }
    seen.add(f.name);
    if (f.width !== ia.viewport.width || f.height !== ia.viewport.height)
      add("frame-size", "error", f.name, `프레임 ${f.width}×${f.height} ≠ ${ia.viewport.width}×${ia.viewport.height}`);
    const frameFill = solid(f.fills);
    visit(f, [], frameFill ? paintHex(frameFill) : "#FFFFFF", f);
    const collect = (n) => {
      if (n.component) {
        const list = byComponent.get(n.component) ?? [];
        list.push({ frame: f.name, height: n.height, fill: solid(n.fills) ? paintHex(solid(n.fills)) : null });
        byComponent.set(n.component, list);
      }
      (n.children ?? []).forEach(collect);
    };
    collect(f);
  }
  for (const s of ia.screens)
    for (const state of s.states ?? ia.requiredStates)
      if (!seen.has(`${s.id}/${state}`)) add("missing-state", "error", `${s.id}/${state}`, "필수 상태 화면이 없음");

  // Same component should look the same on every screen.
  for (const [name, uses] of byComponent) {
    const heights = new Set(uses.map((u) => u.height));
    const fills = new Set(uses.map((u) => u.fill));
    if (heights.size > 1) add("consistency", "warn", name, `화면마다 높이가 다름: ${[...heights].join(", ")}`);
    if (fills.size > 1 && !hasVariants.has(name)) add("consistency", "warn", name, `화면마다 배경색이 다름: ${[...fills].join(", ")}`);
  }
  return findings;
}

export function loadLintInput(project, withNodes = true) {
  const p = paths(project);
  return {
    nodes: withNodes ? readJson(p.nodes) : null,
    tokens: readJson(p.tokens),
    ia: readJson(p.ia),
    components: readJson(p.components),
    copy: readJson(p.copy),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const project = projectName();
  // --nodes <file> lints another export (e.g. tests/fixtures/bad-nodes.json) against this project's rules.
  const i = process.argv.indexOf("--nodes");
  const nodesFile = i === -1 ? paths(project).nodes : process.argv[i + 1];
  if (!fs.existsSync(nodesFile)) {
    console.error(`${nodesFile} 없음 — Figma에서 export-nodes.js로 내보내거나 --nodes tests/fixtures/good-nodes.json`);
    process.exit(1);
  }
  const input = { ...loadLintInput(project, false), nodes: readJson(nodesFile) };
  const findings = lintFigma(input);
  for (const f of findings) console.log(`${f.severity === "error" ? "ERROR" : "warn "} ${f.rule.padEnd(20)} ${f.where} — ${f.message}`);
  const errors = findings.filter((f) => f.severity === "error");
  console.log(`\n오류 ${errors.length}개, 경고 ${findings.length - errors.length}개`);
  if (errors.length) {
    if (i === -1) for (const e of errors) logFailure(project, "verify", e.rule, `${e.where}: ${e.message}`);
    process.exitCode = 1;
  }
}

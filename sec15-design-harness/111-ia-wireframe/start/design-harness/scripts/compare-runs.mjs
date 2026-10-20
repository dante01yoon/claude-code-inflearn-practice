#!/usr/bin/env node
// Same yardstick for a design made with and without the harness. Token-agnostic on purpose:
// a run without a design system has no tokens to violate, so we count how many distinct
// values it invented instead, plus checks that do not depend on tokens.
//
// node scripts/compare-runs.mjs --run A=<dir> --run B=<dir> [--out <file.md>]
// Each run dir holds: nodes.json (export-nodes.js output), frame-map.json ({"<frame name>": "<screen>/<state>"}),
// and optionally session.json (claude -p --output-format json result) and review.json.
import fs from "node:fs";
import path from "node:path";
import { contrastRatio, paintHex, readJson } from "./lib.mjs";

// Default yardstick; pass --required <json array of "screen/state"> to use another one.
const DEFAULT_REQUIRED = ["station-list", "station-detail"].flatMap((s) => ["default", "empty", "error", "loading"].map((st) => `${s}/${st}`));
const DEFAULT_NAME = /^(Frame|Rectangle|Group|Ellipse|Text|Vector|Line|Polygon|Star|Instance|Component)( \d+)?$/;
// Same tap heuristic for both runs, by layer/component name.
const TAPPABLE = /button|btn|버튼|row|item|link|back|tab|탭|retry|cta/i;
const TOUCH = 44;

export function measure(nodes, frameMap = {}, required = DEFAULT_REQUIRED) {
  const colors = new Set(), sizes = new Set(), spacings = new Set(), radii = new Set();
  let contrastFails = 0, touchFails = 0, defaultNames = 0, layers = 0, unbound = 0, solidPaints = 0;
  const solid = (paints = []) => paints.find((p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0);
  const byComponent = new Map();

  const visit = (n, bg) => {
    layers++;
    if (DEFAULT_NAME.test(n.name)) defaultNames++;
    for (const kind of ["fills", "strokes"]) {
      const p = solid(n[kind]);
      if (!p) continue;
      solidPaints++;
      colors.add(paintHex(p));
      if (!n.boundVariables?.[kind]) unbound++;
    }
    const own = solid(n.fills);
    const nextBg = n.type !== "TEXT" && own ? paintHex(own) : bg;
    if (n.type === "TEXT") {
      if (n.fontSize != null) sizes.add(n.fontSize);
      const fg = solid(n.fills);
      if (fg && bg) {
        const large = n.fontSize >= 24 || (n.fontSize >= 18.66 && n.fontWeight >= 700);
        if (contrastRatio(paintHex(fg), bg) < (large ? 3 : 4.5)) contrastFails++;
      }
    }
    if (n.layoutMode) for (const k of ["itemSpacing", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom"]) if (n[k]) spacings.add(n[k]);
    if (n.cornerRadius) radii.add(n.cornerRadius);
    if (TAPPABLE.test(n.component ?? n.name) && n.type !== "TEXT" && (n.width < TOUCH || n.height < TOUCH)) touchFails++;
    const key = n.component ?? (n.type === "INSTANCE" ? n.name : null);
    if (key) {
      const list = byComponent.get(key) ?? [];
      list.push(n.height);
      byComponent.set(key, list);
    }
    for (const c of n.children ?? []) visit(c, nextBg);
  };

  const mapped = new Set();
  // With a map, only the frames it names are measured (component sheets etc. are left out).
  const mapKeys = Object.keys(frameMap);
  const measured = mapKeys.length ? nodes.frames.filter((f) => mapKeys.includes(f.name)) : nodes.frames;
  for (const f of measured) {
    const target = frameMap[f.name] ?? f.name;
    mapped.add(target);
    const fill = solid(f.fills);
    visit(f, fill ? paintHex(fill) : "#FFFFFF");
  }
  const missingStates = required.filter((k) => !mapped.has(k));
  const inconsistent = [...byComponent].filter(([, h]) => new Set(h).size > 1).map(([k]) => k);
  return {
    frames: measured.length,
    layers,
    distinctColors: colors.size,
    distinctFontSizes: sizes.size,
    distinctSpacings: spacings.size,
    distinctRadii: radii.size,
    unboundColorShare: solidPaints ? +(unbound / solidPaints).toFixed(2) : 0,
    contrastFails,
    touchFails,
    defaultLayerNames: defaultNames,
    inconsistentComponents: inconsistent.length,
    missingStates: missingStates.length,
    missingStateList: missingStates,
  };
}

function sessionStats(file) {
  if (!fs.existsSync(file)) return {};
  const s = readJson(file);
  const u = s.usage ?? {};
  return {
    minutes: s.duration_ms != null ? +(s.duration_ms / 60000).toFixed(1) : null,
    turns: s.num_turns ?? null,
    tokens: (u.input_tokens ?? 0) + (u.output_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) || null,
    costUsd: s.total_cost_usd != null ? +s.total_cost_usd.toFixed(2) : null,
  };
}

function reviewScore(file) {
  if (!fs.existsSync(file)) return {};
  const r = readJson(file);
  const sum = (k) => r.checklist.every((c) => c[k] != null) ? r.checklist.reduce((a, c) => a + c[k], 0) : null;
  return { humanScore: sum("score"), criticScore: sum("suggested"), maxScore: r.checklist.length * 2 };
}

if (process.argv[1]?.endsWith("compare-runs.mjs")) {
  const reqIdx = process.argv.indexOf("--required");
  const required = reqIdx === -1 ? DEFAULT_REQUIRED : readJson(process.argv[reqIdx + 1]);
  const runs = [];
  process.argv.forEach((a, i) => {
    if (a !== "--run") return;
    const [label, dir] = process.argv[i + 1].split("=");
    const map = path.join(dir, "frame-map.json");
    runs.push({
      label,
      ...measure(readJson(path.join(dir, "nodes.json")), fs.existsSync(map) ? readJson(map).map ?? readJson(map) : {}, required),
      ...sessionStats(path.join(dir, "session.json")),
      ...reviewScore(path.join(dir, "review.json")),
    });
  });
  const rows = [
    ["frames", "프레임 수"], ["distinctColors", "서로 다른 색 수"], ["distinctFontSizes", "서로 다른 글자 크기 수"],
    ["distinctSpacings", "서로 다른 간격 값 수"], ["distinctRadii", "서로 다른 모서리 값 수"], ["unboundColorShare", "변수에 안 묶인 색 비율"],
    ["contrastFails", "명도 대비 미달"], ["touchFails", "터치 영역 44px 미달"], ["defaultLayerNames", "기본 레이어 이름"],
    ["inconsistentComponents", "화면마다 높이가 다른 컴포넌트"], ["missingStates", `빠진 상태(${required.length}개 중)`],
    ["minutes", "걸린 시간(분)"], ["turns", "턴 수"], ["tokens", "토큰"], ["costUsd", "비용(USD)"],
    ["criticScore", "비평 에이전트 제안 점수"], ["humanScore", "사람 체크리스트 점수"],
  ];
  const lines = [`| 지표 | ${runs.map((r) => r.label).join(" | ")} |`, `|---|${runs.map(() => "---").join("|")}|`];
  for (const [k, label] of rows) lines.push(`| ${label} | ${runs.map((r) => (r[k] ?? "-") + (k.endsWith("Score") && r[k] != null ? `/${r.maxScore}` : "")).join(" | ")} |`);
  for (const r of runs) if (r.missingStateList.length) lines.push(`\n${r.label} 빠진 상태: ${r.missingStateList.join(", ")}`);
  const outIdx = process.argv.indexOf("--out");
  if (outIdx !== -1) fs.writeFileSync(process.argv[outIdx + 1], lines.join("\n") + "\n");
  console.log(lines.join("\n"));
}

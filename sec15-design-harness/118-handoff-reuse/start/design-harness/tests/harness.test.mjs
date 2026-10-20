import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { contrastRatio, flattenTokens, ROOT } from "../scripts/lib.mjs";
import { lintFigma } from "../scripts/lint-figma.mjs";
import { decide } from "../scripts/hooks/figma-guard.mjs";

const FIX = path.join(ROOT, "tests/fixtures");
const load = (f) => JSON.parse(fs.readFileSync(path.join(FIX, f), "utf8"));
const input = () => ({
  nodes: load("good-nodes.json"),
  tokens: load("project/tokens.json"),
  ia: load("project/ia.json"),
  components: load("project/components.json"),
  copy: load("project/copy.json"),
});
const rules = (findings, severity = "error") => new Set(findings.filter((f) => f.severity === severity).map((f) => f.rule));

test("contrast ratio matches WCAG reference values", () => {
  assert.equal(contrastRatio("#000000", "#FFFFFF").toFixed(1), "21.0");
  assert.equal(contrastRatio("#FFFFFF", "#FFFFFF"), 1);
  assert.ok(Math.abs(contrastRatio("#767676", "#FFFFFF") - 4.54) < 0.01);
});

test("token aliases resolve and cycles are rejected", () => {
  const flat = flattenTokens({ a: { $type: "color", x: { $value: "#111111" }, y: { $value: "{a.x}" } } });
  assert.equal(flat["a.y"].value, "#111111");
  assert.throws(() => flattenTokens({ a: { $type: "color", x: { $value: "{a.y}" }, y: { $value: "{a.x}" } } }), /순환/);
  assert.throws(() => flattenTokens({ a: { $type: "color", x: { $value: "{a.nope}" } } }), /없는 토큰/);
});

test("clean sample export has no lint errors", () => {
  assert.equal(rules(lintFigma(input())).size, 0);
});

test("bad export is caught rule by rule", () => {
  const i = input();
  i.nodes = load("bad-nodes.json");
  const findings = lintFigma(i);
  for (const r of ["color-off-token", "font-size-off-scale", "contrast", "spacing-off-scale", "touch-target", "copy-banned", "missing-state"])
    assert.ok(rules(findings).has(r), `missing error ${r}`);
  for (const r of ["layer-name", "grid-margin", "consistency"]) assert.ok(rules(findings, "warn").has(r), `missing warn ${r}`);
});

test("grid checks allow oversized backgrounds and right-anchored nodes", () => {
  const i = input();
  const frame = structuredClone(i.nodes.frames[0]);
  const box = (name, x, y, width, height) => ({ name, type: "RECTANGLE", x, y, width, height });
  frame.children = [
    box("MapBase", -260, -260, 910, 1704), // bigger than the frame on every side
    box("FloatingButton", 326, 472, 48, 48), // 16px from the right edge of a 390 frame
    box("OffGridRight", 325, 472, 48, 48), // 17px from the right edge
    box("PartialBleed", -20, 100, 200, 48), // spills off the left only
  ];
  i.nodes = { frames: [frame] };
  const grid = lintFigma(i).filter((f) => f.rule.startsWith("grid-"));
  const at = (name) => grid.filter((f) => f.where.endsWith(`> ${name}`)).map((f) => f.rule);
  assert.deepEqual(at("MapBase"), []);
  assert.deepEqual(at("FloatingButton"), []);
  assert.deepEqual(at("OffGridRight"), ["grid-base"]);
  assert.deepEqual(at("PartialBleed"), ["grid-margin"]);
});

test("large text gets the 3:1 contrast threshold", () => {
  const i = input();
  const frame = structuredClone(i.nodes.frames[4]); // station-detail/default, hero number is 56px
  const hero = frame.children.find((c) => c.name === "Hero");
  hero.children[0].fills[0].color = { r: 0x6b / 255, g: 0x8f / 255, b: 0x75 / 255 }; // ~3.5:1 on brand-soft
  delete hero.children[0].boundVariables;
  i.nodes = { frames: [frame] };
  const contrast = lintFigma(i).filter((f) => f.rule === "contrast");
  assert.equal(contrast.length, 0);
});

function tempProject(figma, approvals) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "harness-"));
  fs.writeFileSync(path.join(dir, "figma.json"), JSON.stringify(figma));
  fs.writeFileSync(path.join(dir, "approvals.json"), JSON.stringify(approvals));
  return { figma: path.join(dir, "figma.json"), approvals: path.join(dir, "approvals.json") };
}
const KEY = "a".repeat(22);
const ev = (tool, input) => ({ tool_name: `mcp__abc__${tool}`, tool_input: input });

test("figma guard blocks writes before the design system is approved", () => {
  const p = tempProject({ fileKey: KEY }, {});
  assert.equal(decide(ev("use_figma", { fileKey: KEY, code: "figma.createFrame()" }), p).ok, false);
});

test("figma guard only writes to the file in figma.json", () => {
  const p = tempProject({ fileKey: KEY }, { system: { by: "t", at: "x" } });
  assert.equal(decide(ev("use_figma", { fileKey: KEY, code: "figma.createFrame()" }), p).ok, true);
  assert.equal(decide(ev("use_figma", { fileKey: "b".repeat(22), code: "figma.createFrame()" }), p).ok, false);
});

test("figma guard lets the read-only export through but not a disguised write", () => {
  const p = tempProject({ fileKey: KEY }, {});
  const exportCode = fs.readFileSync(path.join(ROOT, "scripts/figma/export-nodes.js"), "utf8");
  assert.equal(decide(ev("use_figma", { fileKey: KEY, code: exportCode }), p).ok, true);
  assert.equal(decide(ev("use_figma", { fileKey: KEY, code: "// harness:read-only\nnode.name = 'x'" }), p).ok, false);
});

test("new files only go to the plan named in figma.json", () => {
  const p = tempProject({ fileKey: null, planKey: "team::<팀>" }, { system: { by: "t", at: "x" } });
  assert.equal(decide(ev("create_new_file", { planKey: "team::<팀>" }), p).ok, true);
  assert.equal(decide(ev("create_new_file", { planKey: "team::<팀>" }), p).ok, false);
});


test("compare-runs counts invented values and missing states the same way for any run", async () => {
  const { measure } = await import("../scripts/compare-runs.mjs");
  const good = measure(load("good-nodes.json"));
  const bad = measure(load("bad-nodes.json"));
  assert.equal(good.missingStates, 0);
  assert.equal(bad.missingStates, 1);
  assert.ok(bad.distinctFontSizes > good.distinctFontSizes);
  // A frame map lets a run without the naming rule still get credit for states it drew.
  const renamed = { frames: [{ name: "Home", type: "FRAME", width: 390, height: 844, children: [] }] };
  assert.equal(measure(renamed, { Home: "station-list/default" }).missingStates, 7);
});

test("an approval goes stale when the approved files change", async () => {
  const { gateHash } = await import("../scripts/lib.mjs");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "harness-"));
  const p = { tokens: path.join(dir, "t.json"), components: path.join(dir, "c.json"), copy: path.join(dir, "y.json") };
  for (const f of Object.values(p)) fs.writeFileSync(f, "{}");
  const before = gateHash(p, "system");
  fs.writeFileSync(p.tokens, '{"x":1}');
  assert.notEqual(gateHash(p, "system"), before);
});

test("design-metrics: contrast, touch target and type scale from nodes", async () => {
  const { designMetrics } = await import("../scripts/design-metrics.mjs");
  const nodes = { frames: [{ name: "s/default", type: "FRAME", x: 0, y: 0, width: 390, height: 844, fills: [{ type: "SOLID", hex: "#FFFFFF" }], children: [
    { name: "Title", type: "TEXT", x: 16, y: 16, width: 100, height: 28, fontSize: 20, fontWeight: 700, fills: [{ type: "SOLID", hex: "#000000" }] },
    { name: "Body", type: "TEXT", x: 16, y: 48, width: 100, height: 24, fontSize: 16, fontWeight: 400, fills: [{ type: "SOLID", hex: "#999999" }] },
    { name: "Btn", type: "INSTANCE", component: "Button", x: 16, y: 80, width: 100, height: 40 },
  ] }] };
  const m = designMetrics({ nodes, components: { components: [{ name: "Button", interactive: true }] } });
  assert.equal(m["명도 대비 통과율(WCAG AA)"], "50%");
  assert.equal(m["터치 영역 44pt 이상"], "0% (1개)");
  assert.equal(m["글자 크기 단계"], "2단계 (16/20)");
  assert.equal(m["타입 스케일 평균 비율"], 1.25);
});

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { flattenTokens, HARNESS } from "../scripts/lib.mjs";
import { buildDesignMd, designMdCli } from "../scripts/design-md.mjs";

const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
// The fixture project always; real projects under work/ when this checkout has them.
const projects = [["fixture", path.join(HARNESS, "tests/fixtures/project")]];
const work = path.join(HARNESS, "work");
if (fs.existsSync(work))
  for (const d of fs.readdirSync(work, { withFileTypes: true }))
    if (d.isDirectory() && fs.existsSync(path.join(work, d.name, "tokens.json"))) projects.push([d.name, path.join(work, d.name)]);

function build(name, dir) {
  const input = { project: name, tokens: readJson(path.join(dir, "tokens.json")), components: readJson(path.join(dir, "components.json")), copy: readJson(path.join(dir, "copy.json")) };
  const result = buildDesignMd(input);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "design-md-")), "DESIGN.md");
  fs.writeFileSync(file, result.markdown);
  return { ...result, file, flat: flattenTokens(input.tokens) };
}
const dim = (v) => `${v.value}${v.unit}`;

for (const [name, dir] of projects) {
  test(`design-md (${name}): official lint has no errors`, () => {
    const { file } = build(name, dir);
    const run = designMdCli(["lint", file]);
    const report = JSON.parse(run.stdout);
    assert.equal(report.summary.errors, 0, JSON.stringify(report.findings.filter((f) => f.severity === "error"), null, 2));
    assert.equal(run.status, 0);
  });

  test(`design-md (${name}): DTCG export matches tokens.json`, () => {
    const { file, flat, exported, aliases } = build(name, dir);
    const run = designMdCli(["export", "--format", "dtcg", file]);
    assert.equal(run.status, 0, run.stderr);
    const dtcg = JSON.parse(run.stdout);
    const at = (p) => p.split(".").reduce((n, k) => n?.[k], dtcg);
    const family = flat["font-family.base"]?.value;

    for (const [token, target] of Object.entries(exported)) {
      const want = flat[token].value;
      if (token === "font-family.base") {
        for (const [level, t] of Object.entries(dtcg.typography ?? {}))
          if (!level.startsWith("$")) assert.equal(t.$value.fontFamily, Array.isArray(family) ? family[0] : family, `typography.${level}.fontFamily`);
        continue;
      }
      if (target.startsWith("typography.")) {
        assert.equal(dim(at(target.replace(/\.fontSize$/, ".$value.fontSize"))), want, token);
        continue;
      }
      const node = at(target);
      assert.ok(node, `${token} -> ${target} missing from export`);
      if (flat[token].type === "color") {
        assert.equal(node.$value.hex, want.toLowerCase(), token);
        const comps = [1, 3, 5].map((i) => parseInt(want.slice(i, i + 2), 16) / 255);
        node.$value.components.forEach((c, i) => assert.ok(Math.abs(c - comps[i]) < 0.001, `${token} component ${i}`));
      } else assert.equal(dim(node.$value), want, token);
    }

    // Nothing in the export that tokens.json does not have, except declared aliases.
    const targets = new Set(Object.values(exported));
    for (const group of ["color", "spacing", "rounded", "typography"])
      for (const key of Object.keys(dtcg[group] ?? {})) {
        if (key.startsWith("$")) continue;
        const p = `${group}.${key}`;
        if (aliases[p]) assert.deepEqual(at(p).$value, at(exported[aliases[p]]).$value, `alias ${p}`);
        else assert.ok(targets.has(p) || targets.has(`${p}.fontSize`), `unexpected ${p} in export`);
      }
  });

  test(`design-md (${name}): every token is exported or written in the prose`, () => {
    const { markdown, flat, exported, proseOnly } = build(name, dir);
    const body = markdown.slice(markdown.indexOf("\n---\n", 4));
    for (const token of Object.keys(flat)) assert.ok(exported[token] || proseOnly.includes(token), `${token} dropped`);
    for (const token of proseOnly) assert.ok(body.includes(`\`${token}\``), `${token} not in prose`);
  });
}

test("design-md: the official lint rejects a broken reference", () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "design-md-")), "DESIGN.md");
  fs.writeFileSync(file, '---\nname: "x"\ncolors:\n  primary: "#000000"\ncomponents:\n  button:\n    backgroundColor: "{colors.nope}"\n---\n');
  const run = designMdCli(["lint", file]);
  assert.equal(run.status, 1);
  assert.ok(JSON.parse(run.stdout).findings.some((f) => f.rule === "broken-ref"));
});

test("check: handoff gate wants DESIGN.md generated from the current system files", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "dh-designmd-"));
  const dir = path.join(root, "work", "p");
  fs.mkdirSync(dir, { recursive: true });
  for (const f of ["tokens.json", "components.json", "copy.json", "ia.json"]) fs.copyFileSync(path.join(HARNESS, "tests/fixtures/project", f), path.join(dir, f));
  const env = { ...process.env, CLAUDE_PROJECT_DIR: root, DESIGN_HARNESS_ROOT: "", HARNESS_PROJECT: "" };
  const run = (cmd) => spawnSync(process.execPath, [path.join(HARNESS, "bin/design-harness"), cmd], { encoding: "utf8", env });
  const gate = () => run("check").stdout.split("\n").filter((l) => /^\S+\s+handoff\s+DESIGN\.md/.test(l)).map((l) => l.replace(/\s+—.*/, "").replace(/\s+/g, " "));

  assert.deepEqual(gate(), ["TODO handoff DESIGN.md"]);
  assert.equal(run("design-md").status, 0);
  assert.deepEqual(gate(), ["PASS handoff DESIGN.md 최신", "PASS handoff DESIGN.md 린트"]);

  const file = path.join(dir, "DESIGN.md");
  fs.appendFileSync(file, "\n손으로 덧붙인 줄\n");
  assert.deepEqual(gate(), ["FAIL handoff DESIGN.md 최신", "PASS handoff DESIGN.md 린트"]);

  run("design-md");
  const tokens = readJson(path.join(dir, "tokens.json"));
  tokens.radius.md.$value = "16px";
  fs.writeFileSync(path.join(dir, "tokens.json"), JSON.stringify(tokens));
  assert.deepEqual(gate(), ["FAIL handoff DESIGN.md 최신", "PASS handoff DESIGN.md 린트"]);
});

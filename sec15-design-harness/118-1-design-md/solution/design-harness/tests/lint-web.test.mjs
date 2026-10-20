import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { HARNESS, launchBrowser } from "../scripts/lib.mjs";
import { lintWeb, renderPages } from "../scripts/lint-web.mjs";

const load = (f) => JSON.parse(fs.readFileSync(path.join(HARNESS, "tests/fixtures/project", f), "utf8"));
const rules = { tokens: load("tokens.json"), copy: load("copy.json") };
const el = (over) => ({ where: "x", text: "", attrs: [], color: null, background: { hex: "#000000", alpha: 0 }, borders: [], fontSize: null, button: false, width: 100, height: 100, ...over });
const lint = (...elements) => lintWeb({ page: { title: "", elements }, ...rules });
const ruleSet = (findings) => findings.map((f) => f.rule).sort();

test("lint-web: token colors pass, others and translucent colors fail", () => {
  assert.deepEqual(lint(el({ text: "a", fontSize: 16, color: { hex: "#1C1F1D", alpha: 1 }, background: { hex: "#EAF4EC", alpha: 1 } })), []);
  assert.deepEqual(ruleSet(lint(el({ background: { hex: "#123456", alpha: 1 } }))), ["color-off-token"]);
  assert.deepEqual(ruleSet(lint(el({ background: { hex: "#1F6B3A", alpha: 0.5 } }))), ["color-off-token"]);
  assert.deepEqual(ruleSet(lint(el({ borders: [{ hex: "#DCE2DE", alpha: 1 }, { hex: "#ABCDEF", alpha: 1 }] }))), ["color-off-token"]);
});

test("lint-web: font size, button size and banned copy", () => {
  assert.deepEqual(ruleSet(lint(el({ text: "a", fontSize: 15, color: { hex: "#1C1F1D", alpha: 1 } }))), ["font-size-off-scale"]);
  assert.deepEqual(lint(el({ button: true, width: 44, height: 44 })), []);
  assert.deepEqual(ruleSet(lint(el({ button: true, width: 120, height: 40 }))), ["touch-target"]);
  assert.deepEqual(ruleSet(lint(el({ attrs: ["Error"] }))), ["copy-banned"]);
  assert.deepEqual(ruleSet(lintWeb({ page: { title: "오류가 발생하였습니다", elements: [] }, ...rules })), ["copy-banned"]);
});

test("lint-web: one off-token value used in many places is one finding", () => {
  const bad = (i) => el({ where: `p${i}`, text: "a", fontSize: 16, color: { hex: "#333333", alpha: 1 } });
  const findings = lint(bad(1), bad(2), bad(3), bad(4), bad(5));
  assert.equal(findings.length, 1);
  assert.match(findings[0].where, /p1 \(글자\), p2 \(글자\), p3 \(글자\) 외 2곳/);
});

// Real rendering: skipped where neither Chrome nor Playwright's Chromium can start.
const browserOk = await launchBrowser().then((b) => (b.close(), true), () => false);
test("lint-web: rendered fixture pages", { skip: !browserOk && "브라우저를 실행할 수 없음" }, async () => {
  const [good, bad] = await renderPages(["good.html", "bad.html"].map((f) => path.join(HARNESS, "tests/fixtures/web", f)));
  assert.deepEqual(lintWeb({ page: good, ...rules }), [], "good.html (button color written as color(srgb …) must normalize to the token hex)");
  const findings = lintWeb({ page: bad, ...rules });
  assert.deepEqual(ruleSet(findings), ["color-off-token", "copy-banned", "font-size-off-scale", "touch-target"]);
  assert.ok(!findings.some((f) => f.message.includes("#FF00FF")), "display:none elements are not checked");
});

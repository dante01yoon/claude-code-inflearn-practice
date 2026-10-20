#!/usr/bin/env node
// Capture public reference pages at the project viewport. No account or paid MCP needed.
// Screenshots stay in work/<project>/references/ as research evidence; never paste them into designs.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { exists, projectName, paths, readJson } from "./lib.mjs";

const BLOCK = /verification required|captcha|firewall|access denied|사람인지 확인|il semble qu'il y ait un problème|are you a robot/i;

const project = projectName();
const p = paths(project);
const refs = readJson(p.references);
// research runs before ia, so fall back to a phone viewport when ia.json does not exist yet.
const { width, height } = exists(p.ia) ? readJson(p.ia).viewport : { width: 390, height: 844 };
fs.mkdirSync(p.refShots, { recursive: true });

// Prefer the installed Chrome; fall back to Playwright's cached Chromium.
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, locale: "ko-KR" });
for (const ref of refs.items) {
  const file = path.join(p.refShots, `${ref.id}.png`);
  try {
    await page.goto(ref.url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: file });
    ref.screenshot = path.relative(p.work, file);
    ref.capturedAt = new Date().toISOString();
    // Bot walls are not references. Never try to get past them; ask a person for a screenshot instead.
    const text = (await page.evaluate(() => document.body?.innerText ?? "")).slice(0, 800);
    ref.blocked = BLOCK.test(text);
    console.log(`${ref.blocked ? "차단" : "저장"} ${ref.id} ← ${ref.url}`);
  } catch (e) {
    console.error(`실패 ${ref.id}: ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
fs.writeFileSync(p.references, JSON.stringify(refs, null, 2) + "\n");

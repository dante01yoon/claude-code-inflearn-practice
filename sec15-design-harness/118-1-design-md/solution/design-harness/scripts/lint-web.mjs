#!/usr/bin/env node
// Checks rendered web screens (HTML) against tokens.json and copy.json: colors outside the tokens,
// font sizes off the type scale, buttons under the touch size, banned copy. Chrome renders the page so
// the numbers are computed styles and real box sizes, not guesses from the source.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { flattenTokens, launchBrowser, logFailure, paths, projectName, readJson } from "./lib.mjs";

const px = (v) => (typeof v === "number" ? v : v.endsWith("rem") ? parseFloat(v) * 16 : parseFloat(v));
const hex6 = (h) => {
  const n = h.replace("#", "").toUpperCase();
  return "#" + (n.length === 3 ? [...n].map((c) => c + c).join("") : n.slice(0, 6));
};

// Runs inside the page. One record per visible element; colors come back as #RRGGBB plus alpha.
function collect() {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const toHex = (css) => {
    let r, g, b, a;
    const m = css.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/);
    if (m) [r, g, b, a] = [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
    else {
      // oklch(), color(), named… : let the canvas convert to sRGB.
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      [r, g, b, a] = [d[0], d[1], d[2], d[3] / 255];
    }
    return { hex: "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("").toUpperCase(), alpha: Math.round(a * 100) / 100 };
  };
  const label = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && parts.length < 4; n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (n.id) s += `#${n.id}`;
      else if (n.classList.length) s += "." + [...n.classList].slice(0, 2).join(".");
      parts.unshift(s);
      if (n.id) break;
    }
    return parts.join(" > ");
  };
  const BUTTON = 'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"], input[type="image"]';
  const out = [];
  for (const el of document.querySelectorAll("body, body *")) {
    if (el.closest("svg, script, style, noscript, template")) continue;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0 || rect.width === 0 || rect.height === 0) continue;
    const ownText = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
    const attrs = ["aria-label", "title", "placeholder", "alt"].map((a) => el.getAttribute(a)).filter(Boolean);
    if (el.matches('input[type="button"], input[type="submit"], input[type="reset"]') && el.value) attrs.push(el.value);
    const borders = ["Top", "Right", "Bottom", "Left"]
      .filter((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none")
      .map((s) => toHex(cs[`border${s}Color`]));
    out.push({
      where: label(el),
      text: ownText,
      attrs,
      color: ownText || el.matches("input, textarea, select, button") ? toHex(cs.color) : null,
      background: toHex(cs.backgroundColor),
      borders,
      fontSize: ownText ? parseFloat(cs.fontSize) : null,
      button: el.matches(BUTTON),
      width: Math.round(rect.width * 100) / 100,
      height: Math.round(rect.height * 100) / 100,
    });
  }
  return { title: document.title, elements: out };
}

// Pure: page records + project rules -> findings. Same value in many places is one finding.
export function lintWeb({ page, tokens, copy, file = "" }) {
  const flat = flattenTokens(tokens);
  const colors = new Map(Object.entries(flat).filter(([, t]) => t.type === "color").map(([k, t]) => [hex6(t.value), k]));
  const sizes = Object.entries(flat).filter(([k]) => k.startsWith("font-size.")).map(([, t]) => px(t.value));
  const touch = px(flat["size.touch"]?.value ?? 44);
  const groups = new Map();
  const add = (rule, key, message, where) => {
    const id = `${rule}\u0000${key}`;
    if (!groups.has(id)) groups.set(id, { rule, severity: "error", message, places: [] });
    groups.get(id).places.push(where);
  };
  const checkColor = (kind, c, where) => {
    if (!c || c.alpha === 0) return;
    if (c.alpha < 1) add("color-off-token", `${c.hex}/${c.alpha}`, `${c.hex} 불투명도 ${c.alpha} — 토큰 색은 불투명`, `${where} (${kind})`);
    else if (!colors.has(c.hex)) add("color-off-token", c.hex, `${c.hex}는 토큰에 없는 색`, `${where} (${kind})`);
  };
  for (const el of page.elements) {
    checkColor("글자", el.color, el.where);
    checkColor("배경", el.background, el.where);
    for (const b of el.borders) checkColor("테두리", b, el.where);
    if (el.fontSize != null && !sizes.some((s) => Math.abs(s - el.fontSize) < 0.01))
      add("font-size-off-scale", el.fontSize, `글자 크기 ${el.fontSize}px는 타입 스케일 밖 (${sizes.join("/")})`, el.where);
    if (el.button && (el.width < touch || el.height < touch))
      add("touch-target", `${el.where}\u0000${el.width}x${el.height}`, `버튼 ${el.width}×${el.height} < ${touch}×${touch}`, el.where);
    for (const text of [el.text, ...el.attrs])
      for (const word of copy.banned ?? []) if (text.includes(word)) add("copy-banned", word, `금지 표현 "${word}"`, el.where);
  }
  for (const word of copy.banned ?? []) if (page.title?.includes(word)) add("copy-banned", word, `금지 표현 "${word}"`, "<title>");
  const prefix = file ? `${file}: ` : "";
  return [...groups.values()].map((g) => {
    const uniq = [...new Set(g.places)];
    const where = prefix + uniq.slice(0, 3).join(", ") + (uniq.length > 3 ? ` 외 ${uniq.length - 3}곳` : "");
    return { rule: g.rule, severity: g.severity, where, message: g.message };
  });
}

// Renders each target (file path or URL) at the project viewport and returns its records.
export async function renderPages(targets, viewport = { width: 390, height: 844 }) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport, locale: "ko-KR" });
    const pages = [];
    for (const t of targets) {
      const url = /^https?:\/\//.test(t) ? t : pathToFileURL(path.resolve(t)).href;
      await page.goto(url, { waitUntil: "load", timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      pages.push({ target: t, ...(await page.evaluate(collect)) });
    }
    return pages;
  } finally {
    await browser.close();
  }
}

const htmlFiles = (dir) =>
  !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { recursive: true }).filter((f) => /\.html?$/i.test(f)).sort().map((f) => path.join(dir, f));

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const project = projectName();
  const p = paths(project);
  // Arguments are files or URLs; without them, every .html under work/<project>/web/.
  const args = process.argv.slice(2).filter((a, i, all) => a !== "--project" && all[i - 1] !== "--project");
  const targets = args.length ? args : htmlFiles(p.web);
  if (!targets.length) {
    console.error(`${p.web}에 .html이 없습니다. 파일이나 URL을 인자로 주세요: design-harness lint:web <파일|URL>…`);
    process.exit(1);
  }
  const viewport = fs.existsSync(p.ia) ? readJson(p.ia).viewport : undefined;
  const tokens = readJson(p.tokens);
  const copy = readJson(p.copy);
  let pages;
  try {
    pages = await renderPages(targets, viewport);
  } catch (e) {
    console.error(e.message.split("\n")[0]);
    process.exit(1);
  }
  const findings = pages.flatMap((pg) => lintWeb({ page: pg, tokens, copy, file: /^https?:/.test(pg.target) ? pg.target : path.relative(process.cwd(), pg.target) }));
  for (const f of findings) console.log(`ERROR ${f.rule.padEnd(20)} ${f.where} — ${f.message}`);
  console.log(`\n화면 ${pages.length}개, 오류 ${findings.length}개`);
  if (findings.length) {
    if (!args.length) for (const f of findings) logFailure(project, "verify", `web:${f.rule}`, `${f.where}: ${f.message}`);
    process.exitCode = 1;
  }
}

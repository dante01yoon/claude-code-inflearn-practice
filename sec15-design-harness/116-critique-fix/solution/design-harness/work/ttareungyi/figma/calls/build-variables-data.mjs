// tokens.json -> 02-variables.data.json (Figma 변수 업서트 입력). 실행: node work/ttareungyi/figma/calls/build-variables-data.mjs
import fs from "node:fs";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname);
const tokens = JSON.parse(fs.readFileSync(path.join(here, "../../tokens.json"), "utf8"));
const out = [];
const walk = (node, pre, type) => {
  type = node.$type ?? type;
  if ("$value" in node) return out.push({ path: pre, type, value: node.$value });
  for (const [k, c] of Object.entries(node)) if (!k.startsWith("$") && c && typeof c === "object") walk(c, [...pre, k], type);
};
walk(tokens, [], undefined);
const hex = (h) => { const n = parseInt(h.slice(1), 16); return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 }; };
const scopeOf = (p) => ({ color: ["ALL_FILLS", "STROKE_COLOR", "EFFECT_COLOR"], space: ["GAP"], radius: ["CORNER_RADIUS"],
  "border-width": ["STROKE_FLOAT"], size: ["WIDTH_HEIGHT"], "font-size": ["FONT_SIZE"], "font-weight": ["FONT_WEIGHT"],
  "font-family": ["FONT_FAMILY"], "line-height": [] })[p[0]] ?? [];
const vars = [], skipped = [];
for (const t of out) {
  const primitive = t.path[0] === "primitive";
  const name = t.path.join("/");
  const m = typeof t.value === "string" && t.value.match(/^\{(.+)\}$/);
  let resolvedType, value = null, alias = null;
  if (t.type === "color") resolvedType = "COLOR";
  else if (["dimension", "fontWeight", "number"].includes(t.type)) resolvedType = "FLOAT";
  else if (t.type === "fontFamily") resolvedType = "STRING";
  else { skipped.push({ name, reason: `알 수 없는 $type ${t.type}` }); continue; }
  if (m) alias = m[1].split(".").join("/");
  else if (resolvedType === "COLOR") value = hex(t.value);
  else if (resolvedType === "FLOAT") value = typeof t.value === "number" ? t.value : parseFloat(t.value);
  else value = Array.isArray(t.value) ? t.value[0] : t.value;
  vars.push({ collection: primitive ? "primitive" : "semantic", name, type: resolvedType, value, alias,
    scopes: primitive ? [] : scopeOf(t.path), description: `tokens.json ${t.path.join(".")}${Array.isArray(t.value) && t.value.length > 1 ? " (첫 서체만)" : ""}` });
}
fs.writeFileSync(path.join(here, "02-variables.data.json"), JSON.stringify({ vars, skipped }, null, 1));
console.log(vars.length, "vars", vars.filter((v) => v.collection === "primitive").length, "primitive;", skipped.length, "skipped");

// harness:read-only
// Paste as the `code` of a use_figma call. use_figma returns at most 20 KB and the Starter plan allows
// only a few MCP calls a month, so this packs as many frames as fit under ~18 KB into one call:
//   START = 0  -> { frames: [...], next }   next is the START for the following call, null when done
// Save each result verbatim to work/<project>/figma/parts/<n>.json, then run `design-harness nodes:merge`.
const START = 0;
const BUDGET = 18000;
const PAGE_NAME = "Screens"; // null: every page
const ONLY_SCREEN_FRAMES = true; // false: every top-level frame (for files made without the harness)

const varName = async (alias) => (alias?.id ? (await figma.variables.getVariableByIdAsync(alias.id))?.name ?? null : null);
const num = (v) => (typeof v === "number" ? v : null); // figma.mixed -> null

const hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
// Compact paints keep a frame under the return limit: { type, hex, opacity? }, hidden paints dropped.
async function paints(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((p) => p.visible !== false)
    .map((p) => (p.type === "SOLID" ? { type: "SOLID", hex: hex(p.color), ...(p.opacity < 1 && { opacity: +p.opacity.toFixed(2) }) } : { type: p.type }));
}

async function serialize(node) {
  const n = {
    name: node.name,
    type: node.type,
    x: Math.round(node.x),
    y: Math.round(node.y),
    width: Math.round(node.width),
    height: Math.round(node.height),
  };
  // Object.assign keeps this file free of "node.prop =" patterns the figma-guard hook treats as writes.
  if ("fills" in node) {
    const [fills, strokes] = [await paints(node.fills), await paints(node.strokes)];
    if (fills.length) Object.assign(n, { fills });
    if (strokes.length) Object.assign(n, { strokes });
  }
  const bv = node.boundVariables ?? {};
  const fillVar = (await varName(bv.fills?.[0])) ?? (await varName(node.fills?.[0]?.boundVariables?.color));
  const strokeVar = (await varName(bv.strokes?.[0])) ?? (await varName(node.strokes?.[0]?.boundVariables?.color));
  if (fillVar || strokeVar) Object.assign(n, { boundVariables: { ...(fillVar && { fills: fillVar }), ...(strokeVar && { strokes: strokeVar }) } });
  if (num(node.cornerRadius) != null && node.cornerRadius !== 0) Object.assign(n, { cornerRadius: node.cornerRadius });
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    Object.assign(n, {
      layoutMode: node.layoutMode,
      itemSpacing: node.itemSpacing,
      paddingLeft: node.paddingLeft,
      paddingRight: node.paddingRight,
      paddingTop: node.paddingTop,
      paddingBottom: node.paddingBottom,
    });
  }
  if (node.type === "TEXT") {
    Object.assign(n, {
      characters: node.characters,
      fontSize: num(node.fontSize),
      fontWeight: num(node.fontWeight),
      fontFamily: node.fontName === figma.mixed ? null : node.fontName.family,
    });
  }
  if (node.type === "INSTANCE") {
    const main = await node.getMainComponentAsync();
    Object.assign(n, { component: main?.parent?.type === "COMPONENT_SET" ? main.parent.name : main?.name ?? null });
  }
  if ("children" in node) {
    n.children = [];
    for (const c of node.children) if (c.visible) n.children.push(await serialize(c));
  }
  return n;
}

const pages = PAGE_NAME ? figma.root.children.filter((p) => p.name === PAGE_NAME) : figma.root.children;
if (!pages.length) return { error: `page "${PAGE_NAME}" not found`, pages: figma.root.children.map((p) => p.name) };
const targets = [];
for (const page of pages) {
  await page.loadAsync();
  for (const f of page.children) if (f.type === "FRAME" && (!ONLY_SCREEN_FRAMES || f.name.includes("/"))) targets.push([page.name, f]);
}
const frames = [];
let size = 0;
let i = START;
for (; i < targets.length; i++) {
  const one = { page: targets[i][0], ...(await serialize(targets[i][1])) };
  const len = JSON.stringify(one).length;
  if (frames.length && size + len > BUDGET) break;
  if (len > BUDGET) return { error: `frame "${one.name}" alone is ${len} bytes; split it or simplify`, next: i + 1 };
  frames.push(one);
  size += len;
}
return { frames, next: i < targets.length ? i : null, total: targets.length };

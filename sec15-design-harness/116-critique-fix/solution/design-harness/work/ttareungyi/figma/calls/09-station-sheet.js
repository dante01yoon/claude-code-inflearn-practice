// 생성됨: build-calls.mjs (_lib.js + src/09-station-sheet.js)
// 공통 도우미 (build-calls.mjs가 각 섹션 호출 앞에 붙인다). 섹션 코드는 이 아래에 이어진다.
// 규칙: 색·간격·반경·크기·글자 크기는 semantic 변수에 연결. 레이어 이름은 역할로.
const FAMILY = "Noto Sans KR";
const STYLE = { regular: "Regular", medium: "Medium", bold: "Bold" };
await Promise.all(Object.values(STYLE).map((style) => figma.loadFontAsync({ family: FAMILY, style })));

const V = {};
const VAL = {};
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
  if (c.name !== "semantic") continue;
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    V[v.name] = v;
    let raw = v.valuesByMode[c.modes[0].modeId];
    while (raw && raw.type === "VARIABLE_ALIAS") {
      const t = await figma.variables.getVariableByIdAsync(raw.id);
      const tc = await figma.variables.getVariableCollectionByIdAsync(t.variableCollectionId);
      raw = t.valuesByMode[tc.modes[0].modeId];
    }
    VAL[v.name] = raw;
  }
}
const need = (n) => { if (!V[n]) throw new Error("변수 없음: " + n); return V[n]; };
const bind = (node, field, n) => { node.setBoundVariable(field, need(n)); };
const paint = (n) => figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", need(n));
const fill = (node, n) => { node.fills = n ? [paint(n)] : []; return node; };
const stroke = (node, n, w, sides) => {
  node.strokes = [paint(n)];
  node.strokeAlign = "INSIDE";
  if (!sides) { bind(node, "strokeWeight", w); return node; }
  for (const s of ["Top", "Right", "Bottom", "Left"]) {
    const f = "stroke" + s + "Weight";
    if (sides.includes(s)) bind(node, f, w); else node[f] = 0;
  }
  return node;
};
const radius = (node, n, corners = ["topLeft", "topRight", "bottomLeft", "bottomRight"]) => {
  for (const c of corners) bind(node, c + "Radius", n);
  return node;
};
const size = (node, w, h) => {
  // w/h: 숫자(고정 px) 또는 변수 이름 문자열 또는 "fill"/"hug"
  const one = (axis, v) => {
    if (v == null) return;
    const field = axis === "h" ? "Horizontal" : "Vertical";
    if (v === "fill") { node["layoutSizing" + field] = "FILL"; return; }
    if (v === "hug") { node["layoutSizing" + field] = "HUG"; return; }
    const px = typeof v === "number" ? v : VAL[v];
    if (axis === "h") node.resize(px, node.height); else node.resize(node.width, px);
    if ("layoutSizingHorizontal" in node && node.parent && (node.parent.layoutMode ?? "NONE") !== "NONE") node["layoutSizing" + field] = "FIXED";
    if (typeof v === "string") bind(node, axis === "h" ? "width" : "height", v);
  };
  one("h", w); one("v", h);
  return node;
};
// 오토레이아웃 프레임. o: { dir, gap, px, py, pt, pb, pl, pr, align, cross, fill, w, h, clip }
const box = (name, o = {}, kind = "frame") => {
  const f = kind === "component" ? figma.createComponent() : figma.createFrame();
  f.name = name;
  f.layoutMode = o.dir === "h" ? "HORIZONTAL" : "VERTICAL";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = [];
  f.clipsContent = !!o.clip;
  const pads = { paddingLeft: o.pl ?? o.px, paddingRight: o.pr ?? o.px, paddingTop: o.pt ?? o.py, paddingBottom: o.pb ?? o.py, itemSpacing: o.gap };
  for (const [k, n] of Object.entries(pads)) if (n) { f[k] = VAL[n]; bind(f, k, n); }
  if (o.align) f.primaryAxisAlignItems = o.align; // MIN CENTER MAX SPACE_BETWEEN
  if (o.cross) f.counterAxisAlignItems = o.cross; // MIN CENTER MAX BASELINE
  if (o.fill) fill(f, o.fill);
  return f;
};
const add = (parent, child, w, h) => { parent.appendChild(child); size(child, w, h); return child; };
// 텍스트. o: { size, weight, color, lh, w }
const text = (name, chars, o = {}) => {
  const t = figma.createText();
  t.name = name;
  const weight = o.weight ?? "regular";
  t.fontName = { family: FAMILY, style: STYLE[weight] };
  t.characters = chars;
  const sz = o.size ?? "font-size/body";
  t.fontSize = VAL[sz];
  bind(t, "fontSize", sz);
  t.lineHeight = { unit: "PERCENT", value: (o.lh ?? "body") === "tight" ? 120 : 150 };
  fill(t, o.color ?? "color/text");
  return t;
};
// 지원되지 않을 수 있는 글꼴 변수 연결은 따로, 실패해도 그리기는 계속.
const bindFontVars = (root, out) => {
  for (const t of root.findAllWithCriteria({ types: ["TEXT"] })) {
    try {
      t.setBoundVariable("fontFamily", need("font-family/base"));
      const w = t.fontWeight;
      const wn = w === 700 ? "bold" : w === 500 ? "medium" : "regular";
      t.setBoundVariable("fontWeight", need("font-weight/" + wn));
    } catch (e) { out.fontVarErrors = (out.fontVarErrors ?? 0) + 1; out.fontVarError = e.message; }
  }
};
// 벡터 아이콘(선). d: SVG path, w/h: 상자
const icon = (name, d, w, h, colorVar) => {
  const f = figma.createFrame();
  f.name = name; f.fills = []; f.resize(24, 24);
  const v = figma.createVector();
  v.name = name + "-stroke";
  v.vectorPaths = [{ windingRule: "NONE", data: d }];
  v.fills = [];
  v.strokes = [paint(colorVar)];
  bind(v, "strokeWeight", "border-width/pin");
  v.strokeCap = "ROUND"; v.strokeJoin = "ROUND";
  f.appendChild(v);
  v.x = (24 - w) / 2; v.y = (24 - h) / 2;
  return f;
};

// 페이지와 섹션
const pageNamed = async (name) => {
  let p = figma.root.children.find((x) => x.name === name);
  if (!p) { p = figma.createPage(); p.name = name; }
  await p.loadAsync();
  return p;
};
const DS = await pageNamed("Design System");
await pageNamed("Screens"); // export가 읽는 페이지. 화면은 이번 범위에서 만들지 않는다.
const ORDER = ["Section/Foundations", "Section/Map controls", "Section/Sheet and list", "Section/Station sheet", "Section/Feedback and actions"];
const openSection = (name, title, note) => {
  const old = DS.children.find((n) => n.name === name);
  if (old) old.remove();
  const s = box(name, { gap: "space/8", px: "space/10", py: "space/10", fill: "color/surface" });
  DS.appendChild(s);
  s.appendChild(text("section-title", title, { size: "font-size/title", weight: "bold", lh: "tight" }));
  if (note) s.appendChild(text("section-note", note, { size: "font-size/label", color: "color/text-muted" }));
  return s;
};
const placeSections = () => {
  let x = 0;
  for (const n of ORDER) {
    const s = DS.children.find((c) => c.name === n);
    if (!s) continue;
    s.x = x; s.y = 0; x += s.width + 160;
  }
};
// 컴포넌트 한 개를 소개하는 블록: 이름 + 설명 + 본체
const spec = (section, name, note) => {
  const b = box("spec/" + name, { gap: "space/3" });
  section.appendChild(b);
  b.appendChild(text("spec-name", name, { size: "font-size/body", weight: "bold" }));
  if (note) { const t = text("spec-note", note, { size: "font-size/caption", color: "color/text-muted" }); b.appendChild(t); t.resize(600, t.height); t.textAutoResize = "HEIGHT"; }
  return b;
};
const variantSet = (parent, name, comps, description) => {
  const set = figma.combineAsVariants(comps, parent);
  set.name = name;
  set.layoutMode = "HORIZONTAL";
  set.primaryAxisSizingMode = "AUTO"; set.counterAxisSizingMode = "AUTO";
  set.counterAxisAlignItems = "MIN";
  set.itemSpacing = VAL["space/6"]; bind(set, "itemSpacing", "space/6");
  for (const k of ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"]) { set[k] = VAL["space/4"]; bind(set, k, "space/4"); }
  set.fills = [];
  if (description) set.description = description;
  return set;
};
const comp = (name, o) => { const c = box(name, o, "component"); DS.appendChild(c); return c; }; // 같은 페이지에 있어야 combineAsVariants 가능
const OUT = { made: [] };

// 섹션 3: StationSheetHeader, CloseButton, CountHero, ZeroNotice, NearbyStationRow, CoordinateList
const s = openSection("Section/Station sheet", "Components · 대여소 시트", "StationSheetHeader · CloseButton · CountHero · ZeroNotice · NearbyStationRow · CoordinateList");
const C = DATA.copy;
const N = DATA.notes;
const B = {
  StationSheetHeader: spec(s, "StationSheetHeader", "대여소 이름(원본 번호 포함) title Bold + CloseButton"),
  CloseButton: spec(s, "CloseButton", "누르는 영역 44×44, 아이콘 color/text. 접근성 이름: " + C.close),
  CountHero: spec(s, "CountHero", N.CountHero),
  ZeroNotice: spec(s, "ZeroNotice", "0대일 때 숫자 아래 안내 띠"),
  NearbyStationRow: spec(s, "NearbyStationRow", N.NearbyStationRow),
  CoordinateList: spec(s, "CoordinateList", "대여소 좌표(원본 위도·경도, 소수 넷째 자리)"),
};

// CloseButton
const close = comp("CloseButton", { align: "CENTER", cross: "CENTER" });
B.CloseButton.appendChild(close);
size(close, "size/touch", "size/touch");
close.appendChild(icon("close-icon", "M 1 1 L 13 13 M 13 1 L 1 13", 14, 14, "color/text"));
close.description = C.close;

// StationSheetHeader
const Z = DATA.station.zero;
const hdr = comp("StationSheetHeader", { dir: "h", gap: "space/2", px: "space/4", pt: "space/3", pb: "space/2", cross: "CENTER", fill: "color/surface" });
B.StationSheetHeader.appendChild(hdr);
size(hdr, 390);
add(hdr, text("station-name", Z.name, { size: "font-size/title", weight: "bold", lh: "tight" }), "fill");
hdr.appendChild(close.createInstance());

// CountHero
const makeHero = (state) => {
  const d = DATA.station[state];
  const red = state === "zero";
  const c = comp("state=" + state, { gap: "space/2", px: "space/4", fill: "color/surface" });
  size(c, 390);
  const num = box("count-line", { dir: "h", gap: "space/1", cross: "BASELINE" });
  c.appendChild(num);
  num.appendChild(text("bike-count", String(d.n), { size: "font-size/display", weight: "bold", lh: "tight", color: red ? "color/stock-zero" : "color/text" }));
  num.appendChild(text("unit", "대", { size: "font-size/title", weight: "bold", lh: "tight", color: red ? "color/stock-zero" : "color/text" }));
  c.appendChild(text("rack-count", "거치대 " + d.racks, { size: "font-size/label", color: "color/text-muted" }));
  if (state === "low") {
    const badge = box("low-badge", { dir: "h", gap: "space/1", px: "space/2", cross: "CENTER", fill: "color/stock-low-soft" });
    c.appendChild(badge); radius(badge, "radius/sm");
    const dot = figma.createFrame(); dot.name = "low-dot"; badge.appendChild(dot); dot.resize(8, 8); fill(dot, "color/stock-low"); radius(dot, "radius/pill");
    badge.appendChild(text("low-label", C.low, { size: "font-size/label" }));
  }
  c.description = d.name;
  return c;
};
variantSet(B.CountHero, "CountHero", ["ok", "low", "zero"].map(makeHero), "숫자 56 Bold + '대' + 거치대 수. zero는 빨강, 아래 ZeroNotice.");

// ZeroNotice
const zn = comp("ZeroNotice", { gap: "space/1", px: "space/3", py: "space/3", fill: "color/stock-zero-soft" });
B.ZeroNotice.appendChild(zn);
radius(zn, "radius/md");
size(zn, 358);
add(zn, text("notice-title", C.zero, { weight: "bold", color: "color/stock-zero" }), "fill");
add(zn, text("notice-hint", C.zeroHint, {}), "fill");

// NearbyStationRow
const nb = DATA.nearby;
const nr = comp("NearbyStationRow", { dir: "h", gap: "space/3", px: "space/4", py: "space/3", cross: "CENTER", fill: "color/surface" });
B.NearbyStationRow.appendChild(nr);
size(nr, 390);
nr.minHeight = VAL["size/touch"]; bind(nr, "minHeight", "size/touch");
stroke(nr, "color/border", "border-width/hairline", ["Bottom"]);
const info = box("station-info", { gap: "space/1" });
nr.appendChild(info); info.layoutSizingHorizontal = "FILL";
add(info, text("station-name", nb.name, { weight: "medium" }), "fill");
add(info, text("distance", nb.distance, { size: "font-size/label", color: "color/text-muted" }), "fill");
nr.appendChild(text("bike-count", nb.n + "대", { size: "font-size/title", weight: "bold", lh: "tight" }));
nr.appendChild(icon("chevron", "M 1 1 L 7 7 L 1 13", 8, 14, "color/text-muted"));
nr.description = "거리 기준: " + Z.name;

// CoordinateList
const cl = comp("CoordinateList", { gap: "space/1", px: "space/4" });
B.CoordinateList.appendChild(cl);
size(cl, 390);
for (const [k, label, value] of [["latitude", "위도", Z.lat], ["longitude", "경도", Z.lon]]) {
  const r = box("coord-" + k, { dir: "h", gap: "space/2" });
  cl.appendChild(r);
  r.appendChild(text("label", label, { size: "font-size/label", color: "color/text-muted" }));
  r.appendChild(text("value", value, { size: "font-size/label" }));
}

OUT.made.push("StationSheetHeader", "CloseButton", "CountHero(state=ok|low|zero)", "ZeroNotice", "NearbyStationRow", "CoordinateList");
bindFontVars(s, OUT);
placeSections();
OUT.section = { id: s.id, w: s.width, h: s.height };
return OUT;

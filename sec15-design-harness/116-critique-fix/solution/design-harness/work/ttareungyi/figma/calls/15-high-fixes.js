// 생성됨: _lib.js + _screens.js + src/15-high-fixes.js
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

// 화면 조립 도우미 (12번 이후 호출에 붙는다). Design System의 컴포넌트 인스턴스로만 조립한다.
const SC = figma.root.children.find((x) => x.name === "Screens");
const SCREEN_ORDER = ["map/default", "map/return", "map/loading", "map/empty", "map/error", "station/default", "station/zero", "list/default"];
const findSet = (name) => DS.findOne((n) => n.type === "COMPONENT_SET" && n.name === name);
const findComp = (name) => DS.findOne((n) => n.type === "COMPONENT" && n.name === name && n.parent.type !== "COMPONENT_SET");
const variant = (set, prop, value) => { const s = findSet(set); const v = s && s.children.find((c) => c.name === prop + "=" + value); if (!v) throw new Error("변형 없음 " + set + " " + prop + "=" + value); return v; };
const inst = (set, prop, value) => (prop ? variant(set, prop, value) : findComp(set)).createInstance();
const layer = (root, name) => { const n = root.findOne((x) => x.name === name); if (!n) throw new Error("레이어 없음 " + name); return n; };
const setText = (root, name, chars) => { layer(root, name).characters = chars; };
const openScreen = (name) => {
  const old = SC.children.find((n) => n.name === name);
  if (old) old.remove();
  const f = figma.createFrame();
  f.name = name;
  SC.appendChild(f);
  f.resize(390, 844);
  f.clipsContent = true;
  fill(f, "color/surface");
  const i = SCREEN_ORDER.indexOf(name);
  f.x = i * 470; f.y = 0;
  return f;
};
const place = (frame, node, x, y) => { frame.appendChild(node); node.x = x; node.y = y; return node; };
const stockState = (n) => (n === 0 ? "zero" : n <= 2 ? "low" : "ok");
// 지도 층: 바탕 이미지(data/map-base@2x.png, view.json 여백 260), 지명 글자, 핀
const mapLayer = (frame, o) => {
  const m = figma.createFrame();
  m.name = "map"; m.resize(390, 844); m.clipsContent = true; fill(m, "color/map-ground");
  place(frame, m, 0, 0);
  const img = figma.getImageByHash(DATA.imageHash);
  if (!img) throw new Error("지도 이미지 없음");
  const base = figma.createRectangle();
  base.name = "map-base";
  base.resize(910, 1704);
  base.fills = [{ type: "IMAGE", imageHash: DATA.imageHash, scaleMode: "FILL" }];
  place(m, base, -260, -260);
  for (const l of DATA.labels) {
    const t = l.kind === "station"
      ? text("place-label/" + l.name, l.name, { size: "font-size/label", weight: "medium" })
      : text("place-label/" + l.name, l.name, { size: "font-size/caption", color: "color/text-muted" });
    const x = Math.round(l.x - t.width / 2), y = Math.round(l.y - t.height / 2);
    // 화면 밖으로 잘리는 지명, 핀(보이는 32px)과 겹치는 지명은 얹지 않는다
    const hitsPin = o.pins && DATA.pins.some((p) => p.x + 16 > x && p.x - 16 < x + t.width && p.y + 16 > y && p.y - 16 < y + t.height);
    if (x < 0 || x + t.width > 390 || y < 0 || hitsPin) { t.remove(); continue; }
    place(m, t, x, y);
  }
  if (o.pins) for (const p of DATA.pins) {
    const n = o.pins === "return" ? Math.max(p.racks - p.n, 0) : p.n;
    const st = o.selected === p.name ? "selected" : stockState(n);
    const pin = inst("StationPin", "state", st);
    pin.name = "pin " + p.name;
    setText(pin, "count", String(n));
    place(m, pin, Math.round(p.x - 22), Math.round(p.y - 22));
  }
  return m;
};
const rowOverride = (row, d, mode) => {
  const n = mode === "return" ? Math.max(d.racks - d.n, 0) : d.n;
  row.swapComponent(variant("StationRow", "state", stockState(n)));
  setText(row, "station-name", d.name);
  setText(row, "bike-count", mode === "return" ? String(n) : n + "대");
  setText(row, "rack-count", "/ 거치대 " + d.racks);
};
const done = (frame) => { bindFontVars(frame, OUT); OUT.made.push(frame.name); };

// review.json High 3건 수정. 기존 화면 프레임 안의 "map" 층만 새로 만들고(zoom 14.6, data/view.json),
// map/return의 행 표기(format.emptyRacks)와 반납 범례를 고친다. 다른 노드는 건드리지 않는다.
// DATA = { png, labels, pins: [{name,n,racks,x,y(실제 위치), px,py(그리는 위치), leader}], list, station }
const img = figma.createImage(figma.base64Decode(DATA.png));
const HASH = img.hash;
const FR = {
  // top: 위쪽 조작(검색바·전환·범례)이 덮는 높이. 그 아래에만 지명을 얹는다.
  "map/default": { pins: "rent", top: 160 }, "map/return": { pins: "return", top: 160 }, "map/loading": { top: 160 }, "map/empty": { top: 160 },
  "map/error": { pins: "rent", top: 160 }, "station/default": { pins: "rent", selected: DATA.station.default, top: 0 },
  "station/zero": { pins: "rent", selected: DATA.station.zero, top: 0 }, "list/default": { pins: "rent", top: 60 },
};
const R = 16; // 보이는 핀 반지름(size/pin 32)
const buildMap = (o) => {
  const m = figma.createFrame();
  m.name = "map"; m.resize(390, 844); m.clipsContent = true; fill(m, "color/map-ground");
  const base = figma.createRectangle();
  base.name = "map-base"; base.resize(910, 1704);
  base.fills = [{ type: "IMAGE", imageHash: HASH, scaleMode: "FILL" }];
  m.appendChild(base); base.x = -260; base.y = -260;
  const pins = o.pins ? DATA.pins : [];
  for (const l of DATA.labels) {
    const t = l.kind === "station"
      ? text("place-label/" + l.name, l.name, { size: "font-size/label", weight: "medium" })
      : text("place-label/" + l.name, l.name, { size: "font-size/caption", color: "color/text-muted" });
    const x = Math.round(l.x - t.width / 2), y = Math.round(l.y - t.height / 2);
    const hit = (cx, cy, r) => cx + r > x && cx - r < x + t.width && cy + r > y && cy - r < y + t.height;
    const hitsPin = pins.some((p) => hit(p.px, p.py, R + 2) || (p.leader && hit(p.x, p.y, 6)));
    if (x < 0 || x + t.width > 390 || y < o.top || hitsPin) { t.remove(); continue; }
    m.appendChild(t); t.x = x; t.y = y;
  }
  if (!pins.length) return m;
  // 지시선 층: 실제 위치 점 + 핀까지 선. 핀보다 아래.
  const lg = figma.createFrame();
  lg.name = "pin-leaders"; lg.resize(390, 844); lg.fills = []; lg.clipsContent = false;
  m.appendChild(lg); lg.x = 0; lg.y = 0;
  for (const p of pins) {
    if (!p.leader) continue;
    const dx = p.px - p.x, dy = p.py - p.y, len = Math.hypot(dx, dy);
    const ex = p.px - (dx / len) * R, ey = p.py - (dy / len) * R; // 핀 테두리에서 끝낸다
    const minx = Math.min(p.x, ex), miny = Math.min(p.y, ey);
    const v = figma.createVector();
    v.name = "leader/" + p.name;
    v.vectorPaths = [{ windingRule: "NONE", data: `M ${p.x - minx} ${p.y - miny} L ${ex - minx} ${ey - miny}` }];
    v.fills = []; v.strokes = [paint("color/ink")]; bind(v, "strokeWeight", "border-width/hairline");
    v.strokeCap = "ROUND";
    lg.appendChild(v); v.x = minx; v.y = miny;
    const d = figma.createFrame();
    d.name = "anchor/" + p.name; d.resize(8, 8);
    fill(d, "color/ink"); radius(d, "radius/pill"); stroke(d, "color/surface", "border-width/hairline");
    lg.appendChild(d); d.x = Math.round(p.x - 4); d.y = Math.round(p.y - 4);
  }
  // 핀: 선택 핀은 맨 위(z-order)
  const order = [...pins].sort((a, b) => (a.name === o.selected) - (b.name === o.selected));
  for (const p of order) {
    const n = o.pins === "return" ? Math.max(p.racks - p.n, 0) : p.n;
    const st = o.selected === p.name ? "selected" : stockState(n);
    const pin = inst("StationPin", "state", st);
    pin.name = "pin " + p.name;
    setText(pin, "count", String(n));
    m.appendChild(pin); pin.x = Math.round(p.px - 22); pin.y = Math.round(p.py - 22);
  }
  return m;
};
const info = {};
for (const [name, o] of Object.entries(FR)) {
  const f = SC.children.find((n) => n.name === name);
  if (!f) throw new Error("프레임 없음 " + name);
  const old = f.children.find((n) => n.name === "map");
  if (!old) throw new Error("map 층 없음 " + name);
  const idx = f.children.indexOf(old);
  old.remove();
  const m = buildMap(o);
  f.insertChild(idx, m); m.x = 0; m.y = 0;
  bindFontVars(m, OUT);
  OUT.made.push(name);
  const banner = f.children.find((n) => n.name === "ErrorBanner");
  if (banner) info.banner = { y: banner.y, h: banner.height };
}
// map/return: 행 숫자를 format.emptyRacks("빈 거치대 {n}")로, 지도에 반납 범례
{
  const f = SC.children.find((n) => n.name === "map/return");
  const sh = f.children.find((n) => n.name === "BottomSheet");
  layer(sh, "station-rows").children.forEach((row, i) => {
    const d = DATA.list[i];
    const n = Math.max(d.racks - d.n, 0);
    row.swapComponent(variant("StationRow", "state", stockState(n)));
    setText(row, "station-name", d.name);
    setText(row, "bike-count", "빈 거치대 " + n);
    setText(row, "rack-count", "/ 거치대 " + d.racks);
    layer(row, "rack-count").visible = false; // 함께 두면 이름이 두 줄로 밀린다
    info["row" + i] = { name: layer(row, "station-name").height, row: row.height };
  });
  const old = f.children.find((n) => n.name === "map-legend");
  if (old) old.remove();
  const lgd = box("map-legend", { dir: "h", gap: "space/1", px: "space/2", py: "space/1", cross: "CENTER", fill: "color/surface" });
  radius(lgd, "radius/sm");
  lgd.appendChild(text("legend-label", "빈 거치대", { size: "font-size/label", weight: "medium" }));
  const at = f.children.findIndex((n) => n.name === "ModeToggle");
  f.insertChild(at + 1, lgd); lgd.x = 16; lgd.y = 124;
  bindFontVars(lgd, OUT);
  info.legend = { w: lgd.width, h: lgd.height };
}
OUT.info = info;
return OUT;

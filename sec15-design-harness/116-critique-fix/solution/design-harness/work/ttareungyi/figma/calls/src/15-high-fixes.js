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

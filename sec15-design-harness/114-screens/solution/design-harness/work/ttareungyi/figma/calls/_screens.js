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

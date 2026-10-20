// 대여소 시트 2개(station/default, station/zero)와 목록 펼침(list/default)
const C = DATA.copy;
// 시트 틀: 위쪽 모서리 radius/sheet, 위쪽 1px 선, 안에는 인스턴스만
const sheetFrame = () => {
  const s = box("station-sheet", { gap: "space/3", pt: "space/2", pb: "space/2", fill: "color/surface" });
  radius(s, "radius/sheet", ["topLeft", "topRight"]);
  stroke(s, "color/border", "border-width/hairline", ["Top"]);
  return s;
};
const inset = (parent, name, node) => { const w = box(name, { px: "space/4", gap: "space/2" }); parent.appendChild(w); w.layoutSizingHorizontal = "FILL"; w.appendChild(node); return w; };
for (const state of ["default", "zero"]) {
  const d = DATA.station[state];
  const f = openScreen("station/" + state);
  mapLayer(f, { pins: "rent", selected: d.name });
  const s = sheetFrame();
  f.appendChild(s);
  s.resize(390, s.height); s.counterAxisSizingMode = "FIXED";
  add(s, inst("SheetHandle"), "fill");
  const hdr = add(s, inst("StationSheetHeader"), "fill");
  setText(hdr, "station-name", d.name);
  inset(s, "mode", inst("ModeToggle", "mode", "rent"));
  const hero = add(s, inst("CountHero", "state", stockState(d.n)), "fill");
  setText(hero, "bike-count", String(d.n));
  setText(hero, "rack-count", "거치대 " + d.racks);
  if (state === "zero") {
    const zn = inset(s, "zero-notice", inst("ZeroNotice"));
    zn.children[0].layoutSizingHorizontal = "FILL";
    const nb = box("nearby", {});
    s.appendChild(nb); nb.layoutSizingHorizontal = "FILL";
    const t = box("nearby-title-wrap", { px: "space/4", pb: "space/1" }); nb.appendChild(t);
    t.appendChild(text("nearby-title", C.nearbyTitle, { weight: "bold" }));
    for (const n of DATA.nearby) {
      const r = add(nb, inst("NearbyStationRow"), "fill");
      setText(r, "station-name", n.name);
      setText(r, "distance", n.distance);
      setText(r, "bike-count", n.n + "대");
    }
  }
  const coords = add(s, inst("CoordinateList"), "fill");
  layer(coords, "coord-latitude").children[1].characters = d.lat;
  layer(coords, "coord-longitude").children[1].characters = d.lon;
  const meta = box("fetched-at-wrap", { px: "space/4" }); s.appendChild(meta);
  meta.appendChild(text("fetched-at", C.fetchedAt, { size: "font-size/label", color: "color/text-muted" }));
  add(s, inst("SourceNote"), "fill");
  s.x = 0; s.y = 844 - Math.round(s.height);
  OUT[f.name] = { sheetH: s.height };
  done(f);
}
{
  const f = openScreen("list/default");
  mapLayer(f, { pins: "rent" });
  place(f, inst("ModeToggle", "mode", "rent"), 16, 12);
  const sh = place(f, inst("BottomSheet", "sheet", "expanded"), 0, 64);
  layer(sh, "station-rows").children.forEach((row, i) => rowOverride(row, DATA.list[i], "rent"));
  const note = inst("SourceNote");
  place(f, note, 0, 0);
  note.y = 844 - Math.round(note.height);
  done(f);
}
return OUT;

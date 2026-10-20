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

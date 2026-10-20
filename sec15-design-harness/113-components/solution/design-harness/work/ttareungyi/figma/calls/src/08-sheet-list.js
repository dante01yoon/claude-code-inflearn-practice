// 섹션 2: BottomSheet, SheetHandle, SheetHeader, StationRow, SkeletonRow (components.json 순서로 배치)
// BottomSheet가 SheetHandle·SheetHeader·StationRow 인스턴스를 쓰므로 그 셋을 먼저 만든다.
const s = openSection("Section/Sheet and list", "Components · 바텀시트와 목록", "BottomSheet · SheetHandle · SheetHeader · StationRow · SkeletonRow");
const C = DATA.copy;
const N = DATA.notes;
const B = {
  BottomSheet: spec(s, "BottomSheet", N.BottomSheet + " 머리(손잡이·제목)는 SheetHeader의 space/4 안쪽 여백, 행은 시트 폭 전체."),
  SheetHandle: spec(s, "SheetHandle", N.SheetHandle),
  SheetHeader: spec(s, "SheetHeader", "제목 title Bold + 기준 시각 label text-muted"),
  StationRow: spec(s, "StationRow", N.StationRow),
  SkeletonRow: spec(s, "SkeletonRow", "로딩 중 행 자리. 바탕 color/skeleton"),
};
const chevron = () => icon("chevron", "M 1 1 L 7 7 L 1 13", 8, 14, "color/text-muted");

// SheetHandle
const handle = comp("SheetHandle", { align: "CENTER", cross: "CENTER" });
B.SheetHandle.appendChild(handle);
size(handle, 390, "size/touch");
{ const bar = figma.createFrame(); bar.name = "handle-bar"; handle.appendChild(bar); fill(bar, "color/border"); radius(bar, "radius/pill"); size(bar, "size/handle", 4); }
handle.description = "끌기 영역은 시트 폭×44, 보이는 막대는 40×4";

// SheetHeader
const header = comp("SheetHeader", { gap: "space/1", px: "space/4", pb: "space/3" });
B.SheetHeader.appendChild(header);
size(header, 390);
add(header, text("title", C.sheetTitle, { size: "font-size/title", weight: "bold", lh: "tight" }), "fill");
add(header, text("fetched-at", C.fetchedAt, { size: "font-size/label", color: "color/text-muted" }), "fill");

// StationRow
const R = DATA.rows;
const makeRow = (state) => {
  const d = R[state];
  const c = comp("state=" + state, { dir: "h", gap: "space/3", px: "space/4", py: "space/3", cross: "CENTER", fill: state === "selected" ? "color/action-soft" : "color/surface" });
  size(c, 390);
  c.minHeight = VAL["size/row-min"]; bind(c, "minHeight", "size/row-min");
  stroke(c, "color/border", "border-width/hairline", ["Bottom"]);
  const info = box("station-info", { gap: "space/1" });
  c.appendChild(info); info.layoutSizingHorizontal = "FILL";
  add(info, text("station-name", d.name, { weight: "medium" }), "fill");
  if (state === "low") {
    const badge = box("low-badge", { dir: "h", gap: "space/1", px: "space/2", cross: "CENTER", fill: "color/stock-low-soft" });
    info.appendChild(badge); radius(badge, "radius/sm");
    const dot = figma.createFrame(); dot.name = "low-dot"; badge.appendChild(dot); dot.resize(8, 8); fill(dot, "color/stock-low"); radius(dot, "radius/pill");
    badge.appendChild(text("low-label", C.low, { size: "font-size/label" }));
  }
  const count = box("count", { dir: "h", gap: "space/1", cross: "BASELINE" });
  c.appendChild(count);
  count.appendChild(text("bike-count", d.n + "대", { size: "font-size/count", weight: "bold", lh: "tight", color: state === "zero" ? "color/stock-zero" : "color/text" }));
  count.appendChild(text("rack-count", "/ 거치대 " + d.racks, { size: "font-size/label", color: "color/text-muted" }));
  c.appendChild(chevron());
  if (state === "zero") {
    const band = figma.createRectangle(); band.name = "zero-band"; c.appendChild(band);
    band.layoutPositioning = "ABSOLUTE"; band.x = 0; band.y = 0; band.resize(4, c.height); fill(band, "color/stock-zero");
    band.constraints = { horizontal: "MIN", vertical: "STRETCH" };
  }
  c.description = d.name;
  return c;
};
const rowSet = variantSet(B.StationRow, "StationRow", ["ok", "low", "zero", "selected"].map(makeRow), "이름(원본 번호 포함) · 남은 자전거 28 Bold · '/ 거치대 n' · 화살표");
rowSet.layoutMode = "VERTICAL";

// SkeletonRow
const sk = comp("SkeletonRow", { dir: "h", gap: "space/3", px: "space/4", py: "space/3", cross: "CENTER" });
B.SkeletonRow.appendChild(sk);
size(sk, 390, "size/row-min");
{ const a = figma.createFrame(); a.name = "name-placeholder"; sk.appendChild(a); fill(a, "color/skeleton"); radius(a, "radius/sm"); a.resize(100, 16); a.layoutSizingHorizontal = "FILL"; }
{ const b = figma.createFrame(); b.name = "count-placeholder"; sk.appendChild(b); fill(b, "color/skeleton"); radius(b, "radius/sm"); b.resize(64, 28); }

// BottomSheet
const rowVariant = (st) => rowSet.children.find((n) => n.name === "state=" + st);
const rowInstance = (d) => {
  const i = rowVariant(d.state).createInstance();
  i.findOne((n) => n.name === "station-name").characters = d.name;
  i.findOne((n) => n.name === "bike-count").characters = d.n + "대";
  i.findOne((n) => n.name === "rack-count").characters = "/ 거치대 " + d.racks;
  return i;
};
const makeSheet = (kind) => {
  const c = comp("sheet=" + kind, { pt: "space/2", fill: "color/surface", clip: true });
  size(c, 390);
  radius(c, "radius/sheet", ["topLeft", "topRight"]);
  stroke(c, "color/border", "border-width/hairline", ["Top"]);
  add(c, handle.createInstance(), "fill");
  add(c, header.createInstance(), "fill");
  const rows = box("station-rows", {});
  c.appendChild(rows); rows.layoutSizingHorizontal = "FILL";
  for (const d of kind === "peek" ? DATA.list.slice(0, 2) : DATA.list) add(rows, rowInstance(d), "fill");
  size(c, null, kind === "peek" ? 240 : 780);
  return c;
};
variantSet(B.BottomSheet, "BottomSheet", [makeSheet("peek"), makeSheet("expanded")], "peek=높이 240(행 2개), expanded=높이 780(목록 펼침). 행은 data/stations.json 순서.");

OUT.made.push("BottomSheet(sheet=peek|expanded)", "SheetHandle", "SheetHeader", "StationRow(state=ok|low|zero|selected)", "SkeletonRow");
bindFontVars(s, OUT);
placeSections();
OUT.section = { id: s.id, w: s.width, h: s.height };
return OUT;

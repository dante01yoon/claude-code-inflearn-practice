// 섹션 1: SearchBar, ModeToggle, StationPin, MapAttribution (components.json 순서)
const s = openSection("Section/Map controls", "Components · 지도 위 조작", "SearchBar · ModeToggle · StationPin · MapAttribution");
const C = DATA.copy;

// SearchBar
{
  const b = spec(s, "SearchBar", "높이 size/search-bar(48), 바탕 surface-sunken, 플레이스홀더 text-muted");
  const c = comp("SearchBar", { dir: "h", gap: "space/2", px: "space/4", cross: "CENTER", fill: "color/surface-sunken" });
  b.appendChild(c);
  radius(c, "radius/md");
  size(c, 358, "size/search-bar");
  c.appendChild(icon("search-icon", "M 13 7 C 13 10.3137 10.3137 13 7 13 C 3.6863 13 1 10.3137 1 7 C 1 3.6863 3.6863 1 7 1 C 10.3137 1 13 3.6863 13 7 Z M 11.5 11.5 L 16 16", 17, 17, "color/text-muted"));
  const t = add(c, text("placeholder", C.searchPlaceholder, { color: "color/text-muted" }), "fill");
  c.description = "대여소 이름 검색. 입력값은 color/text.";
  OUT.made.push("SearchBar");
}

// ModeToggle
{
  const b = spec(s, "ModeToggle", DATA.notes.ModeToggle);
  const make = (mode) => {
    const c = comp("mode=" + mode, { dir: "h", px: "space/1", py: "space/1", gap: "space/1", fill: "color/surface-sunken" });
    radius(c, "radius/md");
    size(c, 358, "size/toggle");
    for (const [key, label] of [["rent", C.modeRent], ["return", C.modeReturn]]) {
      const on = key === mode;
      const seg = box("segment-" + key, { dir: "h", align: "CENTER", cross: "CENTER", fill: on ? "color/ink" : null });
      c.appendChild(seg);
      seg.layoutSizingHorizontal = "FILL"; seg.layoutSizingVertical = "FILL";
      radius(seg, "radius/sm");
      seg.appendChild(text("label", label, { size: "font-size/label", weight: "medium", color: on ? "color/on-ink" : "color/text-muted" }));
    }
    return c;
  };
  variantSet(b, "ModeToggle", [make("rent"), make("return")], "대여 | 반납. 반납이면 핀·행 숫자가 빈 거치대 수로 바뀐다.");
  OUT.made.push("ModeToggle(mode=rent|return)");
}

// StationPin
{
  const b = spec(s, "StationPin", DATA.notes.StationPin);
  const P = DATA.pins;
  const make = (state) => {
    const c = comp("state=" + state, { align: "CENTER", cross: "CENTER" });
    size(c, "size/touch", "size/touch");
    const m = box("marker", { align: "CENTER", cross: "CENTER" });
    c.appendChild(m);
    size(m, "size/pin", "size/pin");
    let txt = "color/on-ink";
    if (state === "ok" || state === "selected") { fill(m, "color/stock-ok"); radius(m, "radius/pill"); }
    if (state === "low") { fill(m, "color/stock-low"); radius(m, "radius/sm"); stroke(m, "color/ink", "border-width/pin"); txt = "color/text"; }
    if (state === "zero") { fill(m, "color/surface"); radius(m, "radius/pill"); stroke(m, "color/stock-zero", "border-width/pin"); txt = "color/stock-zero"; }
    if (state === "selected") { radius(c, "radius/pill"); stroke(c, "color/ink", "border-width/pin"); }
    m.appendChild(text("count", String(P[state].n), { size: "font-size/label", weight: "bold", color: txt, lh: "tight" }));
    c.description = P[state].name;
    return c;
  };
  variantSet(b, "StationPin", ["ok", "low", "zero", "selected"].map(make), "보이는 핀 32, 누르는 영역 44. 숫자 = 남은 자전거(반납 모드는 빈 거치대).");
  OUT.made.push("StationPin(state=ok|low|zero|selected)");
}

// MapAttribution
{
  const b = spec(s, "MapAttribution", "지도 출처 표시. 지도 바탕색 위 text-muted 캡션");
  const c = comp("MapAttribution", { dir: "h", px: "space/2", py: "space/1", fill: "color/map-ground" });
  b.appendChild(c);
  radius(c, "radius/sm");
  c.appendChild(text("attribution", C.mapAttribution, { size: "font-size/caption", color: "color/text-muted" }));
  OUT.made.push("MapAttribution");
}
bindFontVars(s, OUT);
placeSections();
OUT.section = { id: s.id, w: s.width, h: s.height };
return OUT;

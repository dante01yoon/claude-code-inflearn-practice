// 섹션 0: 변수 견본(색·간격·반경·크기)과 타입 스케일
const s = openSection("Section/Foundations", "Foundations", "semantic 변수 견본. 모든 견본은 변수에 연결되어 있다.");
const hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase();

const colors = box("color-swatches", { dir: "h", gap: "space/4" });
s.appendChild(colors);
colors.layoutWrap = "WRAP"; colors.counterAxisSpacing = VAL["space/4"]; bind(colors, "counterAxisSpacing", "space/4");
size(colors, 1080);
for (const n of Object.keys(V).filter((k) => k.startsWith("color/"))) {
  const sw = box("swatch/" + n.slice(6), { gap: "space/1" });
  colors.appendChild(sw);
  const chip = figma.createFrame(); chip.name = "chip"; chip.resize(120, 56);
  fill(chip, n); stroke(chip, "color/border", "border-width/hairline"); radius(chip, "radius/sm");
  sw.appendChild(chip);
  sw.appendChild(text("token-name", n, { size: "font-size/caption", weight: "medium" }));
  sw.appendChild(text("token-value", hex(VAL[n]), { size: "font-size/caption", color: "color/text-muted" }));
}

const row = box("scales", { dir: "h", gap: "space/10" });
s.appendChild(row);
const spaces = box("space-scale", { gap: "space/2" });
row.appendChild(spaces);
spaces.appendChild(text("group-title", "space", { size: "font-size/label", weight: "bold" }));
for (const n of Object.keys(V).filter((k) => k.startsWith("space/"))) {
  const r = box("space/" + n.slice(6), { dir: "h", gap: "space/3", cross: "CENTER" });
  spaces.appendChild(r);
  const l = text("token-name", `${n} · ${VAL[n]}px`, { size: "font-size/caption" }); r.appendChild(l); l.resize(120, l.height);
  const bar = figma.createFrame(); bar.name = "bar"; fill(bar, "color/ink"); r.appendChild(bar); bar.resize(VAL[n], 12); bind(bar, "width", n);
}
const radii = box("radius-scale", { gap: "space/2" });
row.appendChild(radii);
radii.appendChild(text("group-title", "radius", { size: "font-size/label", weight: "bold" }));
const rr = box("radius-samples", { dir: "h", gap: "space/4" });
radii.appendChild(rr);
for (const n of Object.keys(V).filter((k) => k.startsWith("radius/"))) {
  const r = box("radius/" + n.slice(7), { gap: "space/1" });
  rr.appendChild(r);
  const sq = figma.createFrame(); sq.name = "sample"; sq.resize(56, 56); fill(sq, "color/surface-sunken"); stroke(sq, "color/border", "border-width/hairline"); radius(sq, n);
  r.appendChild(sq);
  r.appendChild(text("token-name", `${n} · ${VAL[n]}`, { size: "font-size/caption" }));
}
const sizes = box("size-scale", { gap: "space/2" });
row.appendChild(sizes);
sizes.appendChild(text("group-title", "size · border-width", { size: "font-size/label", weight: "bold" }));
for (const n of Object.keys(V).filter((k) => k.startsWith("size/") || k.startsWith("border-width/")))
  sizes.appendChild(text("token-name", `${n} · ${VAL[n]}px`, { size: "font-size/caption" }));

const type = box("type-scale", { gap: "space/4" });
s.appendChild(type);
type.appendChild(text("group-title", "type scale · Noto Sans KR", { size: "font-size/label", weight: "bold" }));
for (const t of DATA.typeScale) {
  const r = box("type/" + t.role, { dir: "h", gap: "space/6", cross: "BASELINE" });
  type.appendChild(r);
  const l = text("role", `${t.role} · ${VAL["font-size/" + t.role]}/${t.weight}`, { size: "font-size/caption", color: "color/text-muted" });
  r.appendChild(l); l.resize(160, l.height);
  r.appendChild(text("sample", t.sample, { size: "font-size/" + t.role, weight: t.weight, lh: t.lh }));
  r.appendChild(text("use", t.use, { size: "font-size/caption", color: "color/text-muted" }));
}
bindFontVars(s, OUT);
placeSections();
OUT.section = { id: s.id, w: s.width, h: s.height };
return OUT;

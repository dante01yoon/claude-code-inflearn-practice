// harness:read-only
// Design System 페이지 검사: 컴포넌트·변형 목록, 변수에 연결 안 된 단색 칠/선, 기본 레이어 이름, 간격·반경 연결 누락.
const p = figma.root.children.find((x) => x.name === "Design System"); await p.loadAsync();
const DEF = /^(Frame|Rectangle|Group|Ellipse|Text|Vector|Line|Polygon|Star|Instance|Component)( \d+)?$/;
const out = { sets: [], singles: [], unboundPaint: [], defaultNames: [], unboundLayout: [], unboundRadius: [] };
for (const n of p.findAll(() => true)) {
  if (n.type === "COMPONENT_SET") out.sets.push(n.name + ": " + n.children.map((c) => c.name).join(", "));
  if (n.type === "COMPONENT" && n.parent.type !== "COMPONENT_SET") out.singles.push(n.name);
  if (DEF.test(n.name)) out.defaultNames.push(n.id + " " + n.name);
  for (const k of ["fills", "strokes"]) {
    const ps = n[k];
    if (Array.isArray(ps)) ps.forEach((q) => { if (q.type === "SOLID" && q.visible !== false && !q.boundVariables?.color) out.unboundPaint.push(n.name + "." + k); });
  }
  if (n.type === "COMPONENT_SET") continue;
  if ("layoutMode" in n && n.layoutMode !== "NONE")
    for (const k of ["itemSpacing", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom"])
      if (n[k] > 0 && !n.boundVariables?.[k]) out.unboundLayout.push(n.name + "." + k + "=" + n[k]);
  if ("topLeftRadius" in n) for (const k of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) if (n[k] > 0 && !n.boundVariables?.[k]) out.unboundRadius.push(n.name + "." + k);
}
out.unboundLayout = [...new Set(out.unboundLayout)]; out.unboundPaint = [...new Set(out.unboundPaint)];
out.pages = figma.root.children.map((x) => x.name);
return out;

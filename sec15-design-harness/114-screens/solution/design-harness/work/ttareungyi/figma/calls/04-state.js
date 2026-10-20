// harness:read-only
// 현재 파일 상태: 페이지, 페이지별 최상위 노드, 변수 컬렉션, 서체.
const fonts = await figma.listAvailableFontsAsync();
const noto = fonts.filter((f) => f.fontName.family === "Noto Sans KR").map((f) => f.fontName.style);
const pages = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  pages.push({ id: p.id, name: p.name, top: p.children.map((n) => ({ id: n.id, name: n.name, type: n.type, kids: "children" in n ? n.children.length : 0 })) });
}
const cols = await figma.variables.getLocalVariableCollectionsAsync();
return { file: figma.root.name, noto, pages, collections: cols.map((c) => ({ name: c.name, count: c.variableIds.length, modes: c.modes.map((m) => m.name) })) };

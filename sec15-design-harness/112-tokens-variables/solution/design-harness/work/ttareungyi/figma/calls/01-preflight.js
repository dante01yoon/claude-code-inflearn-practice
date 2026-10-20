// harness:read-only
const fonts = await figma.listAvailableFontsAsync();
const noto = fonts.filter((f) => f.fontName.family === "Noto Sans KR").map((f) => f.fontName.style);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
return {
  fileName: figma.root.name,
  notoStyles: noto,
  need: ["Regular", "Medium", "Bold"].map((s) => [s, noto.includes(s)]),
  collections: cols.map((c) => ({ id: c.id, name: c.name, modes: c.modes, count: c.variableIds.length })),
};

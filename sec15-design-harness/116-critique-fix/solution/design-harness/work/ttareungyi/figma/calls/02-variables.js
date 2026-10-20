// tokens.json -> Figma 변수 업서트. DATA는 02-variables.data.json (--data).
// 같은 이름 컬렉션이 있으면 재사용하고, 그 안의 같은 이름 변수만 갱신한다. 다른 변수·노드는 지우지 않는다.
const all = await figma.variables.getLocalVariableCollectionsAsync();
const ensureCol = (name) => {
  let c = all.find((x) => x.name === name);
  const created = !c;
  if (!c) { c = figma.variables.createVariableCollection(name); c.renameMode(c.modes[0].modeId, "default"); }
  return { c, created };
};
const cols = { primitive: ensureCol("primitive"), semantic: ensureCol("semantic") };
const byKey = new Map();
for (const { c } of Object.values(cols))
  for (const id of c.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); if (v) byKey.set(c.name + "|" + v.name, v); }
const stats = { created: 0, updated: 0, typeRecreated: [] , errors: [] };
const order = [...DATA.vars.filter((v) => v.collection === "primitive"), ...DATA.vars.filter((v) => v.collection === "semantic")];
for (const d of order) {
  const { c } = cols[d.collection];
  const key = d.collection + "|" + d.name;
  let v = byKey.get(key);
  if (v && v.resolvedType !== d.type) { stats.typeRecreated.push(d.name + ": " + v.resolvedType + "→" + d.type); v.remove(); v = null; }
  if (!v) { v = figma.variables.createVariable(d.name, c, d.type); byKey.set(key, v); stats.created++; } else stats.updated++;
  try {
    const modeId = c.modes[0].modeId;
    if (d.alias) {
      const target = byKey.get("primitive|" + d.alias);
      if (!target) { stats.errors.push(d.name + ": alias 대상 없음 " + d.alias); continue; }
      v.setValueForMode(modeId, figma.variables.createVariableAlias(target));
    } else v.setValueForMode(modeId, d.value);
    v.scopes = d.scopes;
    v.description = d.description;
  } catch (e) { stats.errors.push(d.name + ": " + e.message); }
}
return { collections: Object.fromEntries(Object.entries(cols).map(([k, { c, created }]) => [k, { id: c.id, created, modes: c.modes.map((m) => m.name), count: c.variableIds.length }])), ...stats };

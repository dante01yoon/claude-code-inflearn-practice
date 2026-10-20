// harness:read-only
// 변수 다시 읽기: 컬렉션별 개수, alias 대상 존재·타입·컬렉션, 해석된 값.
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const out = { collections: [], vars: [] };
for (const c of cols) {
  out.collections.push({ name: c.name, modes: c.modes.map((m) => m.name), count: c.variableIds.length });
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    const raw = v.valuesByMode[c.modes[0].modeId];
    const rec = { collection: c.name, name: v.name, type: v.resolvedType, scopes: v.scopes };
    if (raw && raw.type === "VARIABLE_ALIAS") {
      const t = await figma.variables.getVariableByIdAsync(raw.id);
      const tc = t && (await figma.variables.getVariableCollectionByIdAsync(t.variableCollectionId));
      rec.alias = t ? t.name : null; rec.aliasCollection = tc ? tc.name : null; rec.aliasType = t ? t.resolvedType : null;
      raw2 = t ? t.valuesByMode[tc.modes[0].modeId] : undefined; rec.value = raw2;
    } else rec.value = raw;
    out.vars.push(rec);
  }
}
var raw2;
return out;

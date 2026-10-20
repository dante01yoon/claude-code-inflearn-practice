// harness:read-only
// Design System 페이지의 섹션 하나를 PNG(base64)로 돌려준다. DATA = { name, scale }
const p = figma.root.children.find((x) => x.name === "Design System");
await p.loadAsync();
const n = p.children.find((x) => x.name === DATA.name);
if (!n) return { error: "없음 " + DATA.name };
const bytes = await n.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: DATA.scale ?? 1 } });
return figma.base64Encode(bytes);

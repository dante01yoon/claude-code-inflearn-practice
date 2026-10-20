// 06 첫 실행 실패(combineAsVariants 페이지 불일치)로 현재 페이지에 남은, 이번 작업이 만든 변형 컴포넌트만 지운다.
const out = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name === "Design System") continue;
  for (const n of [...p.children]) if (n.type === "COMPONENT" && /^mode=(rent|return)$/.test(n.name)) { out.push(p.name + ":" + n.name); n.remove(); }
}
return { removed: out, page1: figma.root.children.map((p) => [p.name, p.children.map((n) => n.name)]) };

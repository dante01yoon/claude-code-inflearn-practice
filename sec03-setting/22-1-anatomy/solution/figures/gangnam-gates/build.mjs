// 강남역 개찰구와 드럼 계수기(anatomy 3D 그림). 9월 승하차 CSV에서 강남역 시간대별 하루 평균을 읽어
// 회전대 위 개찰구 5대(통로 4개: 승차 2·하차 2)와 오버헤드 빔 위 5자리 드럼 계수기 2대(승차·하차)로 보여 준다.
// 실행: node figures/gangnam-gates/build.mjs [--light] [--audit] [--quick] [--verify]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../../.claude/skills/anatomy/kit/lathe.mjs";
import * as A from "../../.claude/skills/anatomy/kit/audit.mjs";
import { turning } from "../../.claude/skills/anatomy/kit/turn-build.mjs";
import * as TA from "../../.claude/skills/anatomy/kit/turn-audit.mjs";
import { glCamera } from "../../.claude/skills/anatomy/kit/gl.mjs";
import { turnScript, glScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";
import { SUBWAY_CSV, decodeCsv, parseCsv, toSubwayRows } from "../../subway-csv.mjs";
import { HOURS, count, usageMonth } from "../../stats.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const argv = process.argv.slice(2);
const theme = argv.includes("--light") ? "light" : "dark";

// ---- 데이터: 강남(2호선) 시간대별 하루 평균(한 달 합계 ÷ 그 달 일수, 반올림) ----
const rows = toSubwayRows(parseCsv(decodeCsv(readFileSync(join(ROOT, SUBWAY_CSV)))));
const row = rows.find((r) => r.STTN === "강남");
const month = usageMonth(row);
const ON = HOURS.map((h) => Math.round(count(row, h, "ON") / month.days));
const OFF = HOURS.map((h) => Math.round(count(row, h, "OFF") / month.days));
const PEAK = Math.max(...ON, ...OFF);

// ---- 카메라 ----
const WIDTH = 640;
const HEIGHT = 500;
const AZIMUTH = 56;
const ELEVATION = 30;

// ---- 치수(월드 1 = 약 2.5cm) ----
const PLINTH_R = 112;
const PLINTH_H = 14;
const FOOT_H = 5;
const TABLE_R = 104;
const TABLE_TOP = 4;
const FLOOR = { x: -97, y: -36, w: 194, d: 72, r: 6 };
const FLOOR_TOP = 5;
const CABS = [-78, -39, 0, 39, 78];
const CAB_W = 12;
const CAB_L = 60;
const CAB_TOP = 37;
const COVER_TOP = 39.4;
const LANES = CABS.slice(0, -1).map((x, j) => ({ j, x0: x + CAB_W / 2, x1: CABS[j + 1] - CAB_W / 2, x: (x + CABS[j + 1]) / 2, dir: j < 2 ? -1 : 1, kind: j < 2 ? "on" : "off" }));
const KNUCKLE_R = 1.2;
const FLAP_Z = [15, 29];
const FLAP_OPEN = 80;
const POST_X = 88;
const BEAM_Z = [70, 76];
const COUNTERS = { on: -50, off: 50 };
const DIGITS = 5;
const DRUM_R = 10;
const DRUM_Z = 89;
const SEP_T = 0.6;
const SEP_R = 10.3;
const DRUM_W = (48 - (DIGITS + 1) * SEP_T) / DIGITS;
const APOTHEM = DRUM_R * Math.cos(Math.PI / 10);
const TRAVEL = { cover: 12, hood: 22, drums: 18 };

const ring = (r, z, n = 24) => Array.from({ length: n }, (_, i) => [r * Math.cos((i / n) * 2 * Math.PI), r * Math.sin((i / n) * 2 * Math.PI), z]);
export const P = k.fitProjection([...ring(PLINTH_R, -PLINTH_H - FOOT_H), ...ring(PLINTH_R, 0), ...ring(84, 126), ...ring(100, 78)], WIDTH, HEIGHT, { pad: 14, azimuth: AZIMUTH, elevation: ELEVATION });
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const VERT = (x, y) => G.frameOf([x, y, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const ALONG_X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const UPRIGHT = { o: [0, 0, 0], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] };
const fine = (n) => (Math.abs(n) < 5e-4 ? "0" : n.toFixed(3).replace(/\.?0+$/, ""));
const pathOf = (pts, closed = false) => pts.map(([x, y], i) => `${i ? "L" : "M"}${fine(x)} ${fine(y)}`).join("") + (closed ? "Z" : "");
const roundRect = (x, y, w, h, r, n = 4) => pathOf(k.roundedPlan({ x, y, w, d: h, r }, n), true);

// ---- 고정 받침(뒤 SVG): 받침대, 다리, 각도 눈금 ----
export const R = A.recorder(P);
const put = (item) => R.put({ ...item, shapes: item.shapes.map((shape, index) => R.solid(Object.assign(shape, { name: shape.name ?? (index ? `${item.name}#${index + 1}` : item.name) }))) });

function plinth() {
  for (let i = 0; i < 6; i++) {
    const a = ((i + 0.5) / 6) * 2 * Math.PI;
    const [x, y] = [92 * Math.cos(a), 92 * Math.sin(a)];
    const svg = S(k.cylinder(x, y, 8, -PLINTH_H - FOOT_H, 1.6, P, 28), { tone: "lo" }) + S(k.cylinder(x, y, 6, -PLINTH_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" });
    put({ name: `stand.foot.${i}`, layer: "back", at: [x, y, -PLINTH_H - FOOT_H], svg, shapes: [A.cylinder(x, y, 8, -PLINTH_H - FOOT_H, 1.6, { ground: true }), A.cylinder(x, y, 6, -PLINTH_H - FOOT_H + 1.6, FOOT_H - 1.6)] });
  }
  const ticks = k.radialTicks(0, 0, PLINTH_R - 1.6, 72, 6, 0, [2.2, PLINTH_R - 1.6 - 106], P);
  const inner = L(k.sideArc(0, 0, PLINTH_R, -PLINTH_H + 4, P, 96), { tone: "faint" });
  const svg =
    `<path class="iso-halo" d="${k.haloOf({ x: -PLINTH_R, y: -PLINTH_R, w: 2 * PLINTH_R, d: 2 * PLINTH_R, r: PLINTH_R }, -PLINTH_H - FOOT_H, PLINTH_H, P)}"/>` +
    S(k.cylinder(0, 0, PLINTH_R, -PLINTH_H, PLINTH_H, P, 128, 1.4), { tone: "mid", inner }) +
    L(k.ring(0, 0, PLINTH_R - 1.6, 0, P, 128) + k.ring(0, 0, 106, 0, P, 128), { tone: "lo" }) +
    L(ticks.minor, { tone: "lo" }) +
    L(ticks.major, { tone: "mid" }) +
    D(Array.from({ length: 8 }, (_, i) => at([(PLINTH_R - 7.4) * Math.cos(((i + 0.25) / 8) * 2 * Math.PI), (PLINTH_R - 7.4) * Math.sin(((i + 0.25) / 8) * 2 * Math.PI), 0])), { size: 0.5 });
  put({ name: "stand.plinth", layer: "back", at: [0, 0, -PLINTH_H], bias: 4, svg, shapes: [A.cylinder(0, 0, PLINTH_R, -PLINTH_H, PLINTH_H, { ground: true })] });
}

// ---- 움직이는 부분 ----
export const T = turning(P, { recorder: R });
const bank = T.group("bank", { turn: { pivot: [0, 0] } });
const floorLayer = T.layer("floor");
const gates = T.layer("gates");
T.stack(["back", "floor", "gates"]);

// 회전대 원판, 바닥판(역 바닥 타일), 각도 지시 탭
T.round({ name: "table.disc", group: bank, layer: floorLayer, F: VERT(0, 0), s0: 0, s1: TABLE_TOP, r: TABLE_R, tone: "mid", details: { ribs: { s0: 0.7, s1: TABLE_TOP - 0.7, count: 240, fade: [0.08, 0.5], seams: true, tone: "faint" } } });
const floorPart = T.prism({ name: "table.floor", group: bank, layer: floorLayer, plan: FLOOR, z: TABLE_TOP, h: FLOOR_TOP - TABLE_TOP, steps: 6, tone: "lo", crease: "none" });
{
  const lines = [];
  for (let x = -84; x <= 84; x += 12) lines.push(`M${x} ${FLOOR.y}L${x} ${FLOOR.y + FLOOR.d}`);
  for (let y = -24; y <= 24; y += 12) lines.push(`M${FLOOR.x}${" "}${y}L${FLOOR.x + FLOOR.w} ${y}`);
  T.plane({ part: floorPart, o: [0, 0, FLOOR_TOP], u: [1, 0, 0], v: [0, 1, 0], svg: `<path class="iso-line" data-tone="faint" d="${lines.join("")}"/>` });
}
T.prism({ name: "table.tab", group: bank, layer: floorLayer, plan: { x: -1.6, y: TABLE_R, w: 3.2, d: 5, r: 0.6 }, z: 0.4, h: 3.2, steps: 2, tone: "mid", material: "brass", details: { dots: [{ at: [3.6, 0, TABLE_R + 3.4], normal: [0, 0, 1], size: 0.5, tone: "mid" }] } });

// 큰 평면은 회전할 때 옆으로 서는 순간 한꺼번에 나타난다(감사의 birth). 몸통을 보이지 않는 이음(spec.cuts)으로 조각낸다.
const clipRing = (ring, n, d, keep) => {
  const side = (p) => keep * (n[0] * p[0] + n[1] * p[1] - d);
  const out = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const sa = side(a);
    const sb = side(b);
    if (sa <= 0) out.push(a);
    if ((sa < 0 && sb > 0) || (sa > 0 && sb < 0)) {
      const t = sa / (sa - sb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
};
const markCuts = (part, cuts) => {
  part.spec.cuts = [...(part.spec.cuts ?? []), ...cuts];
  for (const c of cuts) part.hints.unshift(c.n);
  return part;
};
function pieces(name, o, axis, at, planes = []) {
  const ring = k.roundedPlan(o.plan, o.steps ?? 4);
  const n = axis === "x" ? [1, 0, 0] : [0, 1, 0];
  const edges = [-Infinity, ...at, Infinity];
  const made = [];
  for (let p = 0; p < edges.length - 1; p++) {
    const [lo, hi] = [edges[p], edges[p + 1]];
    let poly = ring;
    if (lo > -Infinity) poly = clipRing(poly, n, lo, -1);
    if (hi < Infinity) poly = clipRing(poly, n, hi, 1);
    const inside = (x, y) => {
      const v = axis === "x" ? x : y;
      return v >= lo - 1e-6 && v <= hi + 1e-6;
    };
    const dots = (o.dots ?? []).filter((d) => inside(d.at[1], d.at[2]));
    const part = T.prism({ name: `${name}.${p}`, group: o.group, layer: o.layer, F: UPRIGHT, polygon: poly, round: 0, s0: o.z, s1: o.z + o.h, bevel: o.bevel ?? 0, tone: o.tone, crease: o.crease, material: o.material, details: { seams: o.seams ?? [], dots } });
    markCuts(part, [lo, hi].filter(Number.isFinite).map((d) => ({ n, d })));
    for (const plane of planes) if (inside(plane.at[0], plane.at[1])) T.plane({ part, ...plane.plane });
    made.push(part);
  }
  return made;
}

// 개찰구 함체: 몸통(bank), 덮개와 카드 단말기(덮개 슬라이드), 끝면 표시등, 옆면 센서 창
const covers = CABS.map((x, i) => T.group(`cover.${i}`, { parent: bank, slide: { direction: [0, 0, 1], travel: TRAVEL.cover } }));
CABS.forEach((xc, i) => {
  const body = { x: xc - CAB_W / 2, y: -CAB_L / 2, w: CAB_W, d: CAB_L, r: 1.5 };
  const screws = [];
  for (const y of [-CAB_L / 2, CAB_L / 2]) for (const x of [xc - 3.6, xc + 3.6]) screws.push({ at: [9, x, y], normal: [0, Math.sign(y), 0], size: 0.45 });
  const planes = [];
  for (const side of [-1, 1]) {
    if ((i === 0 && side < 0) || (i === CABS.length - 1 && side > 0)) continue;
    const xf = xc + (side * CAB_W) / 2;
    for (const y of [-22, -12, 12, 22]) planes.push({ at: [xf, y], plane: { o: [xf, y, 0], u: [0, -side, 0], v: [0, 0, -1], normal: [side, 0, 0], svg: `<path class="iso-line" data-tone="lo" d="${roundRect(-2.4, -27.6, 4.8, 3.2, 1.2)}"/>` } });
  }
  pieces(`cab.${i}.body`, { group: bank, layer: gates, plan: body, z: FLOOR_TOP, h: CAB_TOP - FLOOR_TOP, steps: 3, bevel: 0.5, tone: "mid", material: "steel", seams: [11, 33.4], dots: screws }, "y", [-18, -6, 6, 18], planes);
  T.prism({ name: `cab.${i}.cover`, group: covers[i], layer: gates, plan: { x: xc - CAB_W / 2 - 0.6, y: -CAB_L / 2 - 0.6, w: CAB_W + 1.2, d: CAB_L + 1.2, r: 2 }, z: CAB_TOP, h: COVER_TOP - CAB_TOP, steps: 3, bevel: 0.45, tone: "hi", crease: "lo", material: "steel" });
  for (const end of [-1, 1]) {
    const y0 = end > 0 ? 18 : -26;
    const reader = T.prism({ name: `cab.${i}.reader.${end > 0 ? "n" : "s"}`, group: covers[i], layer: gates, plan: { x: xc - 4.4, y: y0, w: 8.8, d: 8, r: 1.4 }, z: COVER_TOP, h: 1.2, steps: 3, bevel: 0.3, tone: "mid", material: "gunmetal" });
    const cy = y0 + 4;
    T.plane({ part: reader, o: [xc, cy, COVER_TOP + 1.2], u: [1, 0, 0], v: [0, 1, 0], svg: `<path class="iso-line" data-tone="mid" d="${pathOf(Array.from({ length: 28 }, (_, j) => [2.6 * Math.cos((j / 28) * 2 * Math.PI), 2.6 * Math.sin((j / 28) * 2 * Math.PI)]), true)}"/><path class="iso-line" data-tone="lo" d="${pathOf(Array.from({ length: 20 }, (_, j) => [1.4 * Math.cos((j / 20) * 2 * Math.PI), 1.4 * Math.sin((j / 20) * 2 * Math.PI)]), true)}"/>` });
    T.prism({ name: `cab.${i}.lamp.${end > 0 ? "n" : "s"}`, group: bank, layer: gates, plan: { x: xc - 3.4, y: end > 0 ? CAB_L / 2 : -CAB_L / 2 - 1, w: 6.8, d: 1, r: 0.4 }, z: 27, h: 5, steps: 2, bevel: 0.2, tone: "mid", material: "gunmetal", details: { dots: [{ at: [29.5, xc, end * (CAB_L / 2 + 1)], normal: [0, end, 0], size: 0.7, tone: "hi" }] } });
  }
});

// 날개문: 통로마다 양쪽 함체에서 하나씩. 경첩은 세로축, 함체 옆면에 닿는 경첩통(knuckle)이 받친다.
const flaps = [];
for (const lane of LANES) {
  for (const side of ["L", "R"]) {
    const sign = side === "L" ? 1 : -1;
    const kx = side === "L" ? lane.x0 + KNUCKLE_R : lane.x1 - KNUCKLE_R;
    const open = side === "L" ? lane.dir * FLAP_OPEN : -lane.dir * FLAP_OPEN;
    const g = T.group(`flap.${lane.j}.${side}`, { parent: bank, hinge: { point: [kx, 0, 0], axis: [0, 0, 1], range: [Math.min(0, open), Math.max(0, open)] } });
    flaps.push({ group: g.name, lane: lane.j, open });
    T.round({ name: `flap.${lane.j}.${side}.knuckle`, group: g, layer: gates, F: VERT(kx, 0), s0: 12, s1: 32, r: KNUCKLE_R, tone: "mid", material: "chrome" });
    const blade = [[KNUCKLE_R, -0.6], [11.6, -0.6], [11.6, 0.6], [KNUCKLE_R, 0.6]].map(([u, v]) => [kx + sign * u, v]);
    T.prism({ name: `flap.${lane.j}.${side}.blade`, group: g, layer: gates, F: UPRIGHT, polygon: blade, round: 0.5, steps: 3, s0: FLAP_Z[0], s1: FLAP_Z[1], tone: "hi", crease: "lo", bevel: 0.25, material: "chrome", details: { seams: [FLAP_Z[0] + 2, FLAP_Z[1] - 2] } });
  }
}

// 오버헤드 빔과 기둥
for (const sx of [-1, 1]) {
  const x0 = sx > 0 ? POST_X : -POST_X - 8;
  T.prism({ name: `gantry.foot.${sx > 0 ? "e" : "w"}`, group: bank, layer: gates, plan: { x: x0 - 2, y: -6, w: 12, d: 12, r: 1.4 }, z: FLOOR_TOP, h: 1.6, steps: 3, bevel: 0.3, tone: "mid", material: "gunmetal", details: { dots: k.corners({ x: x0 - 2, y: -6, w: 12, d: 12 }, 1.6).map(([x, y]) => ({ at: [FLOOR_TOP + 1.6, x, y], normal: [0, 0, 1], size: 0.45 })) } });
  const postZ = [FLOOR_TOP + 1.6, 38, BEAM_Z[0]];
  for (let p = 0; p < 2; p++) {
    const part = T.prism({ name: `gantry.post.${sx > 0 ? "e" : "w"}.${p}`, group: bank, layer: gates, plan: { x: x0, y: -4, w: 8, d: 8, r: 1.2 }, z: postZ[p], h: postZ[p + 1] - postZ[p], steps: 3, tone: "mid", material: "steel", details: { seams: [p ? 52 : 24] } });
    markCuts(part, [{ n: [0, 0, 1], d: postZ[p ? 1 : 1] }]);
  }
}
const beamDots = [];
for (let x = -90; x <= 90; x += 15) beamDots.push({ at: [73, x, 5], normal: [0, 1, 0], size: 0.42 });
pieces("gantry.beam", { group: bank, layer: gates, plan: { x: -POST_X - 8, y: -5, w: 2 * POST_X + 16, d: 10, r: 1.4 }, z: BEAM_Z[0], h: BEAM_Z[1] - BEAM_Z[0], steps: 3, bevel: 0.45, tone: "mid", material: "steel", dots: beamDots }, "x", [-32, 32]);

// 드럼 계수기: 받침판, 양쪽 볼, 뒤판(bank) · 덮개와 앞 입술(후드 슬라이드) · 운반판과 드럼(드럼 슬라이드, 드럼마다 가로축 경첩)
const digitFace = (d) => {
  const beta = (d * Math.PI) / 5;
  return { n: [0, Math.cos(beta), -Math.sin(beta)], up: [0, Math.sin(beta), Math.cos(beta)] };
};
export const DRUMS = [];
const IN = 24; // 볼 안쪽 면까지 반 길이
const DEEP = 12.4; // 케이스 반 깊이(y)
const CNT_BASE = BEAM_Z[1] + 2;
const CNT_TOP = 100;
for (const [kind, cx] of Object.entries(COUNTERS)) {
  const hood = T.group(`hood.${kind}`, { parent: bank, slide: { direction: [0, 0, 1], travel: TRAVEL.hood } });
  const carrier = T.group(`drums.${kind}`, { parent: bank, slide: { direction: [0, 1, 0], travel: TRAVEL.drums } });
  const base = { x: cx - IN - 4, y: -DEEP - 1, w: 2 * IN + 8, d: 2 * DEEP + 2, r: 1.6 };
  T.prism({ name: `cnt.${kind}.base`, group: bank, layer: gates, plan: base, z: BEAM_Z[1], h: 2, steps: 3, bevel: 0.4, tone: "mid", material: "gunmetal", details: { dots: k.corners(base, 1.8).map(([x, y]) => ({ at: [CNT_BASE, x, y], normal: [0, 0, 1], size: 0.45 })) } });
  for (const sx of [-1, 1]) {
    const cheek = { x: sx < 0 ? cx - IN - 3 : cx + IN, y: -DEEP, w: 3, d: 2 * DEEP, r: 1 };
    pieces(`cnt.${kind}.cheek.${sx < 0 ? "w" : "e"}`, { group: bank, layer: gates, plan: cheek, z: CNT_BASE, h: CNT_TOP - CNT_BASE, steps: 3, bevel: 0.35, tone: "mid", material: "steel", dots: [-9, 9].flatMap((y) => [CNT_BASE + 4, CNT_TOP - 4].map((z) => ({ at: [z, cx + sx * (IN + 3), y], normal: [sx, 0, 0], size: 0.42 }))) }, "y", [0]);
    const F = ALONG_X([cx + sx * (IN + 3), 0, DRUM_Z]);
    if (sx < 0) T.round({ name: `cnt.${kind}.hub.w`, group: bank, layer: gates, F: { ...F, a: [-1, 0, 0], v: [0, 0, 1] }, s0: 0, s1: 1.6, r: 4.2, tone: "mid", material: "brass", details: { bolts: [{ s: 1.6, r: 2.8, count: 4, phase: 0.4, size: 0.42 }] } });
    else {
      T.round({ name: `cnt.${kind}.hub.e`, group: bank, layer: gates, F, s0: 0, s1: 1.4, r: 4.8, tone: "mid", material: "brass" });
      T.round({ name: `cnt.${kind}.reset`, group: bank, layer: gates, F, s0: 1.4, s1: 5.8, r: 3.8, tone: "hi", crease: "lo", material: "chrome", details: { ribs: { s0: 1.9, s1: 5.3, count: 40, seams: true, tone: "lo", fade: [0.1, 0.55] } } });
    }
  }
  pieces(`cnt.${kind}.back`, { group: bank, layer: gates, plan: { x: cx - IN, y: -DEEP, w: 2 * IN, d: 1.4, r: 0.3 }, z: CNT_BASE, h: CNT_TOP - CNT_BASE, steps: 2, tone: "mid", material: "steel" }, "x", [cx - 8, cx + 8]);
  const top = { x: cx - IN - 3.6, y: -DEEP - 0.6, w: 2 * IN + 7.2, d: 2 * DEEP + 1.2, r: 1.6 };
  T.prism({ name: `cnt.${kind}.top`, group: hood, layer: gates, plan: top, z: CNT_TOP, h: 2.6, steps: 3, bevel: 0.5, tone: "mid", material: "steel", details: { dots: k.corners(top, 2).map(([x, y]) => ({ at: [CNT_TOP + 2.6, x, y], normal: [0, 0, 1], size: 0.45 })) } });
  T.prism({ name: `cnt.${kind}.lip.top`, group: hood, layer: gates, plan: { x: cx - IN, y: DEEP - 1.4, w: 2 * IN, d: 1.4, r: 0.3 }, z: DRUM_Z + 5.4, h: CNT_TOP - DRUM_Z - 5.4, steps: 2, tone: "mid", material: "steel" });
  const lampAt = [CNT_BASE + 2.6, cx - IN + 5, DEEP];
  T.prism({ name: `cnt.${kind}.lip.low`, group: hood, layer: gates, plan: { x: cx - IN, y: DEEP - 1.4, w: 2 * IN, d: 1.4, r: 0.3 }, z: CNT_BASE, h: DRUM_Z - 5.4 - CNT_BASE, steps: 2, tone: "mid", material: "steel", details: { dots: [{ at: lampAt, normal: [0, 1, 0], size: 1.2, tone: "hi" }], rings: [{ at: lampAt, normal: [0, 1, 0], r: 1.9, tone: "lo" }] } });
  // 칸막이 원판: 운반 슬라이드에 속하고 양옆 드럼과 면으로 맞닿는다(양 끝은 볼 안쪽 면에도).
  for (let i = 0; i <= DIGITS; i++) {
    const xs = cx - IN + i * (DRUM_W + SEP_T);
    T.round({ name: `cnt.${kind}.sep.${i}`, group: carrier, layer: gates, F: ALONG_X([xs, 0, DRUM_Z]), s0: 0, s1: SEP_T, r: SEP_R, tone: "lo", material: "brass" });
  }
  for (let i = 0; i < DIGITS; i++) {
    const x0 = cx - IN + SEP_T + i * (DRUM_W + SEP_T);
    const xm = x0 + DRUM_W / 2;
    const place = DIGITS - 1 - i; // 왼쪽이 만 자리
    const g = T.group(`d.${kind}.${place}`, { parent: carrier, hinge: { point: [xm, 0, DRUM_Z], axis: [1, 0, 0], range: [0, 360] } });
    const poly = Array.from({ length: 10 }, (_, j) => {
      const a = ((j + 0.5) / 10) * 2 * Math.PI;
      return [DRUM_R * Math.cos(a), DRUM_R * Math.sin(a)];
    });
    const drum = T.prism({ name: `d.${kind}.${place}.drum`, group: g, layer: gates, F: ALONG_X([x0, 0, DRUM_Z]), polygon: poly, s0: 0, s1: DRUM_W, steps: 1, bevel: 0.25, tone: "hi", crease: "lo" });
    for (let d = 0; d < 10; d++) {
      const { n, up } = digitFace(d);
      const o = [xm, n[1] * APOTHEM, DRUM_Z + n[2] * APOTHEM];
      T.plane({ part: drum, o, u: [1, 0, 0], v: G.mul3(up, -1), normal: n, fade: [0.1, 0.45], svg: `<text class="iso-face-text gg-digit" data-tone="lit" font-size="6.6" text-anchor="middle" y="2.35">${d}</text>` });
    }
    DRUMS.push({ group: g.name, kind, place });
  }
}

// ---- 자세: 끌기·분해·날개문·드럼 ----
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const share = (a, from, to) => ease((a - from) / (to - from));
export const follow = (values) => {
  const out = { bank: values.bank ?? 0 };
  const apart = values.apart ?? 0;
  CABS.forEach((_, i) => (out[`cover.${i}`] = TRAVEL.cover * share(apart, 0.04 * i, 0.4 + 0.04 * i)));
  for (const kind of ["on", "off"]) {
    out[`hood.${kind}`] = TRAVEL.hood * share(apart, 0.15, 0.6);
    out[`drums.${kind}`] = TRAVEL.drums * share(apart, 0.55, 1);
  }
  const open = values.open ?? [0, 0, 0, 0];
  for (const f of flaps) out[f.group] = f.open * (open[f.lane] ?? 0);
  const drums = values.drums ?? {};
  for (const d of DRUMS) out[d.group] = drums[d.group] ?? 0;
  return out;
};
const drumsAt = (seed) => Object.fromEntries(DRUMS.map((d, i) => [d.group, (((seed * (i + 3) * 37) % 360) + 360) % 360]));
export const poses = () => {
  const out = [];
  for (let deg = 0; deg < 360; deg += 1) {
    const apart = (deg % 90) / 89;
    const o = (deg % 7) / 6;
    out.push(follow({ bank: deg, apart, open: [o, 1 - o, (o * 3) % 1, o * o], drums: drumsAt(deg) }));
  }
  for (let a = 0; a <= 40; a++) for (const seed of [1, 7, 13]) out.push(follow({ bank: seed * 23, apart: a / 40, open: [a / 40, 1, 0, 0.5], drums: drumsAt(seed * 11 + a) }));
  // 날개문은 통로마다 0→1 전 구간을 촘촘히(분리면이 열리는 호 전체에서 성립하도록)
  for (let o = 0; o <= 40; o++) for (const bank of [0, 120, 240]) out.push(follow({ bank: bank + o, apart: (o % 5) / 4, open: [o / 40, 1 - o / 40, o / 40, 1 - o / 40], drums: drumsAt(o) }));
  return out;
};

plinth();
const verify = argv.includes("--verify");
const out = T.build({ statics: R.items, poses, verify });
A.settle(R, P);
const layerOf = (name) => R.items.filter((item) => item.layer === name).sort((a, b) => a.key - b.key).map((item) => item.svg);
if (argv.includes("--audit")) {
  A.auditOrExit(R, P);
  TA.orbitOrExit(T, R, P, {
    sweep: { at: (x) => follow({ bank: x }), from: 0, to: 360, frame: 0.3 },
    clips: [
      { name: "apart", at: (t) => follow({ bank: 30 + 10 * t, apart: Math.min(1, t / 1.2), drums: drumsAt(5) }), from: 0, to: 1.6, frame: 1 / 60 },
      { name: "flaps", at: (t) => follow({ bank: 200 + 6 * t, open: [0, 1, 2, 3].map((j) => 0.5 - 0.5 * Math.cos(Math.PI * (t + j * 0.3))) }), from: 0, to: 2, frame: 1 / 60 },
    ],
    quick: argv.includes("--quick"),
    only: argv.find((a) => a.startsWith("--only="))?.slice(7).split(",") ?? null,
    log: argv.includes("--verbose") ? (text) => console.log(`  … ${text}`) : null,
  });
}

// ---- 페이지 ----
const fmt = (n) => n.toLocaleString("ko-KR");
const hourLabel = (h) => `${String(h).padStart(2, "0")}시`;
const peakOn = ON.indexOf(Math.max(...ON));
const peakOff = OFF.indexOf(Math.max(...OFF));
const LABEL = `강남역 개찰구 모형. 회전대 위에 개찰구 함체 다섯 대가 통로 네 개를 이루고(왼쪽 둘은 승차, 오른쪽 둘은 하차), 통로마다 날개문이 있다. 위쪽 빔에 다섯 자리 드럼 계수기 두 대가 승차와 하차 인원을 센다. 값은 ${month.label} 강남역 시간대별 하루 평균이다.`;
const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: layerOf("back") });
const canvas = `<canvas class="iso-layer gg-gl" data-canvas="lanes" aria-hidden="true"></canvas>`;
const stage = `<div class="iso-stage iso-turn gg-stage" tabindex="0" role="group" aria-label="강남역 개찰구: 끌어서 돌리고, 누르면 분해, 화살표 키로 시간대">${backSvg}${out.layerSvg("floor", { width: WIDTH, height: HEIGHT })}${canvas}${out.layerSvg("gates", { width: WIDTH, height: HEIGHT })}</div>`;
const controls = `<div class="gg-controls"><label for="gg-hour">시간대</label><input id="gg-hour" type="range" min="0" max="${HOURS.length - 1}" step="1" value="${HOURS.indexOf(8)}" aria-valuetext="08시"><output id="gg-hour-out">08시</output><button type="button" id="gg-apart" aria-pressed="false">분해</button></div>`;
const DATA = {
  turn: out.data,
  hours: HOURS,
  on: ON,
  off: OFF,
  peak: PEAK,
  start: HOURS.indexOf(8),
  drums: DRUMS,
  gl: { W: WIDTH, H: HEIGHT, camera: glCamera(P), floor: FLOOR, floorTop: FLOOR_TOP, lanes: LANES.map((l) => [l.x, (l.x1 - l.x0) / 2, l.dir, l.kind === "on" ? 0 : 1]) },
};
const CSS = out.css + "\n" + readFileSync(join(HERE, "gates.css"), "utf8");
const FOLLOW = `const follow = ${follow.toString()};\nconst ease = ${ease.toString()};\nconst share = ${share.toString()};\nconst CABS = ${JSON.stringify(CABS)};\nconst TRAVEL = ${JSON.stringify(TRAVEL)};\nconst flaps = ${JSON.stringify(flaps)};\nconst DRUMS = ${JSON.stringify(DRUMS)};`;
const LIVE = readFileSync(join(HERE, "live.js"), "utf8").replace("__DATA__", JSON.stringify(DATA)).replace("const follow = null;", FOLLOW);
const body = k.plateHtml({
  fig: "Fig 2",
  title: "강남역 개찰구 계수기",
  hint: "끌어서 돌리기 · 누르면 분해 · ← → 시간대",
  readout: `08시 · 승차 ${fmt(ON[DATA.start])} · 하차 ${fmt(OFF[DATA.start])}명`,
  keys: [
    { mark: "blue", label: "승차 통로(왼쪽 둘)의 빛과 승차 계수기" },
    { mark: "red", label: "하차 통로(오른쪽 둘)의 빛과 하차 계수기" },
    { mark: "raised", label: "드럼 계수기: 시간대가 바뀌면 0으로 돌아갔다가 그 시간 하루 평균까지 센다" },
  ],
  caption: `강남역(2호선) ${month.label} 시간대별 하루 평균 승하차 인원(한 달 합계 ÷ ${month.days}일). 통로를 흐르는 빛 줄기 수와 날개문이 열리는 빈도는 그 시간 인원을 하루 최대(${hourLabel(HOURS[peakOff])} 하차 ${fmt(OFF[peakOff])}명)에 비례시킨 것이고, 계수기 숫자가 실제 값이다. 저녁 피크는 ${hourLabel(HOURS[peakOn])} 승차 ${fmt(ON[peakOn])}명. 출처: 서울특별시, 서울 열린데이터광장(공공누리 제1유형).`,
  body: `<style>${CSS}</style>${stage}${controls}`,
});
const page = k.pageHtml({ title: "강남역 개찰구 계수기", theme, body, script: turnScript() + glScript() + (verify ? `window.__isoVerify = ${JSON.stringify(out.verify)};\n` : "") + LIVE, width: 680 }).replace('<html lang="en">', '<html lang="ko">');
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const name = `gangnam-gates${verify ? "-verify" : ""}${theme === "light" ? "-light" : ""}.html`;
  writeFileSync(join(HERE, name), page);
  console.log(`wrote ${name} · ${(page.length / 1024).toFixed(0)} KB · ${out.report.parts} parts · ${out.report.layers.map((l) => `${l.name}: ${l.planar} planes, ${l.dynamic} dynamic`).join(" · ")} · build ${out.report.seconds.toFixed(1)} s`);
}
export { out };

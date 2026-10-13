// 강남역 시간대별 승하차 게이지(anatomy 그림). 9월 승하차 CSV에서 강남역 하루 평균을 읽어
// 시간대 24칸 × 승차·하차 두 줄의 게이지 막대로 세우고, 캐리지에 매단 다이얼 게이지 두 개가 그 높이를 읽는다.
// 실행: node figures/gangnam-gauge/build.mjs [--light] → 같은 폴더에 HTML을 쓴다.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";
import { SUBWAY_CSV, decodeCsv, parseCsv, toSubwayRows } from "../../subway-csv.mjs";
import { HOURS, count, usageMonth } from "../../stats.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const theme = process.argv.includes("--light") ? "light" : "dark";

// ---- 데이터: 강남(2호선) 시간대별 하루 평균 ----
const rows = toSubwayRows(parseCsv(decodeCsv(readFileSync(join(ROOT, SUBWAY_CSV)))));
const row = rows.find((r) => r.STTN === "강남");
const month = usageMonth(row);
const ON = HOURS.map((h) => Math.round(count(row, h, "ON") / month.days));
const OFF = HOURS.map((h) => Math.round(count(row, h, "OFF") / month.days));

// ---- 월드 치수(1 = 약 1px) ----
const WIDTH = 600;
const HEIGHT = 400;
const N = HOURS.length;
const PITCH = 9;
const BAR_W = 6.4;
const X0 = -((N - 1) * PITCH) / 2;
const barX = (i) => X0 + i * PITCH;
const PER_UNIT = 200; // 막대 높이 1 = 하루 평균 200명
const PER_TURN = 12000; // 바늘 한 바퀴 = 12,000명
const TIP_R = 2.4;

const PLATE = { x: -192, y: -78, w: 338, d: 130, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;
const HOLD_H = 5;
const RISE = 24;
const RISER = { x: -114, y: -37, w: 228, d: 26, r: 2 };
const ROWS = {
  on: { y: 17, base: 0, values: ON, holder: { x: -110, y: 8, w: 220, d: 18, r: 2 }, stem: 66 },
  off: { y: -24, base: RISE, values: OFF, holder: { x: -110, y: -33, w: 220, d: 18, r: 2 }, stem: 88 },
};
for (const r of Object.values(ROWS)) r.top = r.base + HOLD_H;

const RAILS = [-66, -50];
const RAIL_X = [-176, 122];
const SCREW_Y = -58;
const LEAD = PITCH; // 이송 나사 피치 = 막대 한 칸
const DIAL_R = 14;
const DIAL_Z = 100;
const DIAL_H = 9;
const DIAL_TOP = DIAL_Z + DIAL_H;
const COL = { x: -56, y: -66, w: 12, d: 12, r: 2 }; // 캐리지 기준(플런저 x = 0) 좌표
const ARM = { x: -54, y: -66, w: 8, d: 88, r: 2 };
const ARM_Z = 101;
const CARRIAGE = { x: -66, y: -71, w: 32, d: 30, r: 3 };
const CARRIAGE_Z = 3;
const CARRIAGE_TOP = 9;
const REACH = [barX(0), barX(N - 1)];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [REACH[0] - 56, -66, DIAL_TOP + 8], [REACH[1] + DIAL_R, 17, DIAL_TOP], [REACH[0] - 56, 22, DIAL_TOP]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 58, elevation: 32 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth2 = ([x, y]) => k.depthOf([x, y, 0], P);
const byDepth = (points) => [...points].sort((a, b) => depth2(a) - depth2(b));
const barPlan = (i, y) => ({ x: barX(i) - BAR_W / 2, y: y - 5, w: BAR_W, d: 10, r: 0.8 });
const barHeight = (v) => v / PER_UNIT;
const fmt = (n) => n.toLocaleString("ko-KR");
const hourLabel = (h) => `${String(h).padStart(2, "0")}시`;

// ---- 받침: 정반, 다리, 홈, 나사, 시간 눈금자, 명판 ----
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -5, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));

  // 시간 눈금자: 막대마다 눈금 하나, 06·12·18·24시는 긴 눈금
  const strip = { x: X0 - 8, y: 32, w: (N - 1) * PITCH + 16, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const minor = [];
  const major = [];
  HOURS.forEach((h, i) => {
    const long = h % 6 === 0;
    (long ? major : minor).push(k.lineOnTop([barX(i), strip.y + 0.8], [barX(i), strip.y + 0.8 + (long ? 3.8 : 2.2)], 0.6, P));
  });
  for (let i = 0; i < N - 1; i++) minor.push(k.lineOnTop([barX(i) + PITCH / 2, strip.y + 0.8], [barX(i) + PITCH / 2, strip.y + 1.8], 0.6, P));
  out.push(L(k.lineOnTop([strip.x + 1, strip.y + 0.8], [strip.x + strip.w - 1, strip.y + 0.8], 0.6, P), { tone: "lo" }));
  out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  out.push(D([at([strip.x + 2.2, strip.y + 4.6, 0.6]), at([strip.x + strip.w - 2.2, strip.y + 4.6, 0.6])], { size: 0.45 }));

  // 명판: 테두리, 새긴 글자 하나, 인쇄 줄 셋, 나사 둘
  const label = { x: -184, y: 14, w: 36, d: 22, r: 1.6 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 4), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 6, label.y + 8.4], 0.8, P, "x"), "강남 · 2호선", { size: 3.6, tone: "mid" }));
  out.push(L([22, 17, 12].map((len, j) => k.lineOnTop([label.x + 6, label.y + 11.6 + j * 2.6], [label.x + 6 + len, label.y + 11.6 + j * 2.6], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + 3.4, label.y + 3.4, 0.8]), at([label.x + label.w - 3.4, label.y + label.d - 3.4, 0.8])], { size: 0.45 }));

  // 수평기: 몸통, 유리관 창, 기준선 둘, 기포
  const level = { x: -184, y: -30, w: 44, d: 10, r: 1.4 };
  out.push(S(k.slabOf(level, 0, 4, P, 3, 0.4), { tone: "mid", inner: L(k.sideSeam(level, 1.4, P, 3), { tone: "faint" }) }));
  const vial = { x: level.x + 10, y: level.y + 3, w: 24, d: 4, r: 2 };
  out.push(S(k.slabOf(vial, 4, 0.01, P, 6), { tone: "lo", crease: "none", flat: true }));
  const mid = vial.x + vial.w / 2;
  out.push(L([mid - 3.4, mid + 3.4].map((x) => k.lineOnTop([x, vial.y], [x, vial.y + vial.d], 4, P)).join(""), { tone: "lo" }));
  out.push(L(k.planOutline({ x: mid - 2.6, y: vial.y + 0.9, w: 5.2, d: 2.2, r: 1.1 }, 4, P, 6), { tone: "hi" }));
  out.push(D([at([level.x + 4, level.y + 5, 4]), at([level.x + level.w - 4, level.y + 5, 4])], { size: 0.45 }));
  return out.join("");
}

// ---- 뒤쪽 레일, 이송 나사, 끝 멈추개 ----
function rails() {
  const out = [];
  for (const y of RAILS) {
    out.push(S(k.slabOf({ x: RAIL_X[0], y: y - 2.5, w: RAIL_X[1] - RAIL_X[0], d: 5, r: 1 }, 0, 3, P, 3, 0.4), { tone: "mid" }));
    const bolts = [];
    for (let x = RAIL_X[0] + 8; x < RAIL_X[1] - 4; x += 24) bolts.push(at([x, y, 3]));
    out.push(D(bolts, { size: 0.4, tone: "lo" }));
  }
  // 이송 나사: 레일 사이, 캐리지 밑의 너트를 지난다. 나사산은 윗면을 가로지르는 선.
  const screw = { x: RAIL_X[0], y: SCREW_Y - 1.6, w: RAIL_X[1] - RAIL_X[0], d: 3.2, r: 1.5 };
  const threads = [];
  for (let x = screw.x + 1.5; x < screw.x + screw.w - 1; x += LEAD / 4) threads.push(k.lineOnTop([x, screw.y + 0.3], [x + 0.8, screw.y + screw.d - 0.3], 3.4, P));
  out.push(S(k.slabOf(screw, 0.6, 2.8, P, 4), { tone: "lo", crease: "none", inner: "" }));
  out.push(L(threads.join(""), { tone: "faint" }));
  return out.join("");
}

function endStop(x, w = 5) {
  const plan = { x, y: -71, w, d: 26, r: 1.2 };
  return S(k.slabOf(plan, 0, 8, P, 3, 0.5), { tone: "mid" }) + D([at([x + w / 2, -67, 8]), at([x + w / 2, -49, 8])], { size: 0.45 });
}

// 이송 손잡이: 오른쪽 멈추개 위. 한 바퀴 = 한 시간(막대 한 칸), 캐리지와 함께 돈다.
const KNOB = [RAIL_X[1] + 6, SCREW_Y];
function feedKnob() {
  const [x, y] = KNOB;
  return (
    S(k.cylinder(x, y, 3.4, 8, 1.6, P, 20), { tone: "mid" }) +
    S(k.cylinder(x, y, 6, 9.6, 4.4, P, 36, 0.4), { tone: "mid" }) +
    L(k.knurl(x, y, 6, 9.6, 14, 40, P), { tone: "lo" }) +
    L(k.ring(x, y, 4.4, 14, P, 32), { tone: "faint" })
  );
}
const knobAt = (turn) => {
  const a = turn * Math.PI * 2;
  const [x, y] = KNOB;
  return lineOnTopOf([x, y], [x + Math.sin(a) * 4.4, y - Math.cos(a) * 4.4], 14, P);
};
const lineOnTopOf = k.lineOnTop;

// ---- 캐리지(뒤): 받침판, 부싱, 기둥, 고정 손잡이. 플런저 x = 0 기준으로 만들고 translate로 옮긴다. ----
function carriageBack() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CARRIAGE, 3), CARRIAGE_Z, 0.1, P)}" style="filter:blur(4px)"/>`];
  for (const [x, y] of byDepth([[CARRIAGE.x + 6, RAILS[0]], [CARRIAGE.x + CARRIAGE.w - 6, RAILS[0]], [CARRIAGE.x + 6, RAILS[1]], [CARRIAGE.x + CARRIAGE.w - 6, RAILS[1]]])) {
    out.push(S(k.slabOf({ x: x - 4, y: y - 4, w: 8, d: 8, r: 1 }, 1.5, CARRIAGE_Z - 1.5 + 0.01, P, 2), { tone: "lo", crease: "none" }));
  }
  out.push(S(k.slabOf(CARRIAGE, CARRIAGE_Z, CARRIAGE_TOP - CARRIAGE_Z, P, 5, 0.6), { tone: "mid" }));
  out.push(D(k.corners(CARRIAGE, 3.2).map(([x, y]) => at([x, y, CARRIAGE_TOP])), { size: 0.45 }));
  // 기둥 아래 플랜지와 기둥
  out.push(S(k.slabOf(k.insetPlan(COL, -3), CARRIAGE_TOP, 2.5, P, 3, 0.4), { tone: "mid" }));
  out.push(D(k.corners(k.insetPlan(COL, -3), 1.6).map(([x, y]) => at([x, y, CARRIAGE_TOP + 2.5])), { size: 0.4, tone: "lo" }));
  const colZ = CARRIAGE_TOP + 2.5;
  out.push(S(k.slabOf(COL, colZ, ARM_Z - colZ, P, 3), { tone: "mid", inner: L([40, 70].map((z) => k.sideSeam(COL, z, P, 3)).join(""), { tone: "faint" }) }));
  // 고정 손잡이(앞면)
  const knob = [CARRIAGE.x + CARRIAGE.w + 3, CARRIAGE.y + 8];
  out.push(S(k.slabOf({ x: CARRIAGE.x + CARRIAGE.w - 1, y: knob[1] - 1.4, w: 3, d: 2.8, r: 0.8 }, CARRIAGE_Z + 1, 4, P, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(knob[0] + 1.2, knob[1], 3, CARRIAGE_Z, 6, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(knob[0] + 1.2, knob[1], 3, CARRIAGE_Z, CARRIAGE_Z + 6, 18, P), { tone: "lo" }));
  return out.join("");
}

// ---- 단(뒷줄 받침)과 막대 받이 ----
function riser() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(RISER, 0, RISE, P)}" style="opacity:.5"/>`);
  out.push(S(k.slabOf(RISER, 0, RISE, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(RISER, 8, P, 3), { tone: "faint" }) }));
  // 앞면 눈금판: 뒷줄 막대마다 눈금 하나가 윗변에 매달린다.
  const face = RISER.y + RISER.d;
  const scale = { x: X0 - 7, y: face, w: (N - 1) * PITCH + 14, d: 0.8, r: 0.3 };
  out.push(S(k.slabOf(scale, 13, 7, P, 2), { tone: "lo", crease: "none" }));
  const minor = [];
  const major = [];
  HOURS.forEach((h, i) => (h % 6 === 0 ? major : minor).push(k.segment([barX(i), face + 0.8, 20], [barX(i), face + 0.8, h % 6 === 0 ? 15.6 : 17.6], P)));
  out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  out.push(D([at([scale.x + 2.4, face + 0.8, 16.5]), at([scale.x + scale.w - 2.4, face + 0.8, 16.5])], { size: 0.45 }));
  return out.join("");
}

function holder(r) {
  const out = [];
  out.push(S(k.slabOf(r.holder, r.base, HOLD_H, P, 3, 0.5), { tone: "mid" }));
  out.push(L(Array.from({ length: N }, (_, i) => k.planOutline(k.insetPlan(barPlan(i, r.y), -0.6), r.top, P, 2)).join(""), { tone: "faint" }));
  const ends = [r.holder.x + 3.2, r.holder.x + r.holder.w - 3.2];
  out.push(D(ends.flatMap((x) => [at([x, r.holder.y + 3.2, r.top]), at([x, r.holder.y + r.holder.d - 3.2, r.top])]), { size: 0.45 }));
  return out.join("");
}

// 게이지 막대: 받이 홈에서 솟은 블록. 위에 각인 홈, 앞면에 반쯤 높이 띠.
function bar(i, r) {
  const h = barHeight(r.values[i]);
  if (h < 0.3) return `<g data-bar="${i}"></g>`;
  const plan = barPlan(i, r.y);
  const inner = h > 8 ? L(k.sideSeam(plan, r.top + h - 3, P, 2), { tone: "faint" }) : "";
  return `<g data-bar="${i}">${S(k.slabOf(plan, r.top, h, P, 2, 0.4), { tone: "hi", crease: "lo", inner })}${h > 2 ? L(k.planOutline(k.insetPlan(plan, 1.5), r.top + h, P, 2), { tone: "faint" }) : ""}</g>`;
}

// ---- 캐리지(위): 팔, 다이얼 두 개, 줄기, 바늘 ----
function dial(y, stemBottom) {
  const out = [];
  const cross = { x: ARM.x + ARM.w, y: y - 3, w: -DIAL_R - ARM.x - ARM.w + 1, d: 6, r: 1 };
  out.push(S(k.slabOf(cross, DIAL_Z + 1.5, 5, P, 2, 0.3), { tone: "mid" }));
  out.push(D([at([cross.x + 3, y, DIAL_Z + 6.5]), at([cross.x + cross.w - 5, y, DIAL_Z + 6.5])], { size: 0.4, tone: "lo" }));
  out.push(S(k.cylinder(0, y, 3.6, stemBottom, 2, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(0, y, 2.6, stemBottom + 2, DIAL_Z - stemBottom - 2, P, 20), { tone: "mid", crease: "none" }));
  out.push(L(k.sideArc(0, y, 2.6, (stemBottom + DIAL_Z) / 2, P, 12), { tone: "lo" }));
  out.push(S(k.cylinder(0, y, DIAL_R, DIAL_Z, DIAL_H, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(0, y, DIAL_R, DIAL_TOP - 3, DIAL_TOP, 64, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(0, y, DIAL_R, DIAL_TOP - 3, P, 40), { tone: "faint" }));
  out.push(L(k.ring(0, y, DIAL_R - 1.8, DIAL_TOP, P, 64), { tone: "lo" }));
  const ticks = k.radialTicks(0, y, DIAL_R - 2.2, 60, 5, DIAL_TOP, [1, 2.2], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.lineOnTop([0, y - DIAL_R + 1.8], [0, y - DIAL_R + 4.6], DIAL_TOP, P), { tone: "hi" }));
  // 크라운(+x 쪽)
  out.push(S(k.slabOf({ x: DIAL_R - 1, y: y - 2, w: 4, d: 4, r: 1 }, DIAL_Z + 2, 4.5, P, 3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: DIAL_R + 2.8, y: y - 2.8, w: 2.4, d: 5.6, r: 1.1 }, DIAL_Z + 1.4, 5.8, P, 3), { tone: "mid" }));
  out.push(L(k.ring(0, y, 1.4, DIAL_TOP, P, 16), { tone: "mid" }));
  return out.join("");
}

function carriageTop() {
  const out = [];
  out.push(S(k.slabOf(ARM, ARM_Z, 7, P, 3, 0.5), { tone: "mid" }));
  out.push(D([-60, -40, -8, 6].map((y) => at([ARM.x + 4, y, ARM_Z + 7])), { size: 0.45 }));
  out.push(S(k.slabOf({ x: COL.x - 1, y: COL.y - 1, w: COL.w + 2, d: COL.d + 2, r: 2.4 }, ARM_Z + 7, 3, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(COL.x + COL.w / 2, COL.y + COL.d / 2, 3.6, ARM_Z + 10, 3, P, 24), { tone: "mid" }));
  out.push(L(k.knurl(COL.x + COL.w / 2, COL.y + COL.d / 2, 3.6, ARM_Z + 10, ARM_Z + 13, 20, P), { tone: "lo" }));
  return out.join("");
}

const needleAt = (turn, y) => {
  const a = turn * Math.PI * 2;
  return k.lineOnTop([-Math.sin(a) * 3, y + Math.cos(a) * 3], [Math.sin(a) * (DIAL_R - 3.4), y - Math.cos(a) * (DIAL_R - 3.4)], DIAL_TOP + 0.2, P);
};

// 플런저: 받침 끝 + 줄기 아래까지 이어지는 막대. 길이가 바뀌므로 프레임마다 다시 만든다.
const plungerAt = (tip, y, stemBottom) =>
  k.solidSvg(k.cylinder(0, y, TIP_R, tip, 2, P, 20), { tone: "hi", lit: true }) +
  k.solidSvg(k.cylinder(0, y, 1.2, tip + 2, stemBottom - tip - 2 + 0.6, P, 16), { tone: "hi", crease: "none", lit: true });

// ---- 조립 ----
const startI = HOURS.indexOf(8);
const startX = barX(startI);
const tipOf = (r, i) => r.top + barHeight(r.values[i]);
const row3 = (r, key) => {
  const bars = Array.from({ length: N }, (_, i) => bar(i, r));
  const plunger = `<g data-part="plunger-${key}">${plungerAt(tipOf(r, startI), r.y, r.stem)}</g>`;
  bars.splice(startI + 1, 0, plunger);
  return `<g data-row="${key}" transform="${k.translateAlong(P, [0, 0, 0])}">${holder(r)}${bars.join("")}</g>`;
};
const moveX = (x) => k.translateAlong(P, [x, 0, 0]);

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: `강남역 승하차 게이지. 정반 위에 시간대 24칸의 게이지 막대가 두 줄로 서 있다. 앞줄은 승차, 단 위의 뒷줄은 하차이고 막대 높이는 ${month.label} 하루 평균 인원이다. 뒤쪽 레일의 캐리지가 팔에 다이얼 게이지 두 개를 매달고 지나가면, 플런저가 그 시간대 막대 위에 내려앉고 바늘이 인원을 읽는다.`,
  body: [
    plate(),
    rails(),
    endStop(RAIL_X[0] - 5),
    `<g data-part="carriage-back" transform="${moveX(startX)}">${carriageBack()}</g>`,
    endStop(RAIL_X[1], 12),
    feedKnob(),
    `<path data-part="knob" class="iso-line" data-tone="hi" style="stroke-width:.9" d="${knobAt(startX / LEAD)}"/>`,
    `<g>${D([at([KNOB[0], KNOB[1], 14])], { size: 0.55, tone: "hi" })}</g>`,
    riser(),
    row3(ROWS.off, "off"),
    row3(ROWS.on, "on"),
    `<g data-part="carriage-top" transform="${moveX(startX)}">${carriageTop()}${dial(ROWS.off.y, ROWS.off.stem)}${dial(ROWS.on.y, ROWS.on.stem)}<path data-part="needle-off" class="iso-line" data-tone="lit" data-free="start" style="stroke-width:1" d="${needleAt(OFF[startI] / PER_TURN, ROWS.off.y)}"/><path data-part="needle-on" class="iso-line" data-tone="lit" data-free="start" style="stroke-width:1" d="${needleAt(ON[startI] / PER_TURN, ROWS.on.y)}"/></g>`,
  ],
});

const readoutOf = (i, on, off) => `${hourLabel(HOURS[i])} · 승차 ${fmt(on)} · 하차 ${fmt(off)}명`;

const live = `
const P = ${JSON.stringify(P)};
const HOURS = ${JSON.stringify(HOURS)};
const ROWS = ${JSON.stringify(Object.fromEntries(Object.entries(ROWS).map(([key, r]) => [key, { y: r.y, top: r.top, stem: r.stem, values: r.values }])))};
const N = ${N}, PITCH = ${PITCH}, BAR_W = ${BAR_W}, X0 = ${X0}, PER_UNIT = ${PER_UNIT}, PER_TURN = ${PER_TURN}, TIP_R = ${TIP_R}, DIAL_R = ${DIAL_R}, DIAL_TOP = ${DIAL_TOP};
const REACH = ${JSON.stringify(REACH)};
const barX = (i) => X0 + i * PITCH;
const fmt = (n) => n.toLocaleString("ko-KR");
const hourLabel = ${hourLabel.toString()};
const needleAt = ${needleAt.toString().replace("k.lineOnTop", "lineOnTop")};
const KNOB = ${JSON.stringify(KNOB)}, LEAD = ${LEAD};
const knobAt = ${knobAt.toString().replace("lineOnTopOf", "lineOnTop")};
const knob = document.querySelector('[data-part="knob"]');
const plungerAt = ${plungerAt.toString().replace(/k\./g, "")};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const back = svg.querySelector('[data-part="carriage-back"]');
const top = svg.querySelector('[data-part="carriage-top"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
for (const [key, r] of Object.entries(ROWS)) {
  r.group = svg.querySelector('[data-row="' + key + '"]');
  r.plunger = svg.querySelector('[data-part="plunger-' + key + '"]');
  r.bars = [...r.group.querySelectorAll("[data-bar]")];
  r.needle = svg.querySelector('[data-part="needle-' + key + '"]');
  r.tip = { at: r.top + r.values[${startI}] / PER_UNIT, rate: 0 };
  r.slot = -1;
}
// 플런저 끝이 걸치는 막대 중 가장 높은 것 위에 앉는다(막대 사이 틈은 끝보다 좁다).
const restOn = (r, cx) => {
  let z = r.top;
  for (let i = 0; i < N; i++) {
    const from = barX(i) - BAR_W / 2, to = from + BAR_W;
    if (r.values[i] / PER_UNIT >= 0.3 && to > cx - TIP_R && from < cx + TIP_R) z = Math.max(z, r.top + r.values[i] / PER_UNIT);
  }
  return z;
};
const hourAt = (cx) => clamp(Math.round((cx - X0) / PITCH), 0, N - 1);
let x = ${startX}, target = x, frame = 0, last = 0, clock = 0, touring = true, visible = false, idleTimer = 0;
const tourAt = (t) => barX((${startI} + Math.floor(t / 1.6)) % N);
function draw() {
  const move = translateAlong(P, [x, 0, 0]);
  back.setAttribute("transform", move);
  top.setAttribute("transform", move);
  knob.setAttribute("d", knobAt(x / LEAD));
  for (const r of Object.values(ROWS)) {
    // 그리는 순서: 끝이 걸칠 수 있는 막대(왼쪽 끝 < cx + TIP_R) 다음에 플런저를 둔다.
    let slot = 0;
    while (slot < N && barX(slot) - BAR_W / 2 < x + TIP_R) slot++;
    if (slot !== r.slot) { r.group.insertBefore(r.plunger, r.bars[slot] || null); r.slot = slot; }
    r.plunger.setAttribute("transform", move);
    r.plunger.innerHTML = plungerAt(r.tip.at, r.y, r.stem);
    r.needle.setAttribute("d", needleAt((r.tip.at - r.top) * PER_UNIT / PER_TURN, r.y));
  }
  const on = Math.round((ROWS.on.tip.at - ROWS.on.top) * PER_UNIT);
  const off = Math.round((ROWS.off.tip.at - ROWS.off.top) * PER_UNIT);
  const text = hourLabel(HOURS[hourAt(x)]) + " · 승차 " + fmt(on) + " · 하차 " + fmt(off) + "명";
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(HOURS[hourAt(x)]));
  stage.setAttribute("aria-valuetext", text + " (하루 평균)");
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) { clock += dt; target = tourAt(clock); }
  const far = Math.abs(target - x) > PITCH * 3;
  x = calm ? target : x + (target - x) * (1 - Math.exp(-dt / (far ? 0.5 : 0.3)));
  if (Math.abs(target - x) < 0.01) x = target;
  let rest = true;
  for (const r of Object.values(ROWS)) {
    const want = restOn(r, x);
    if (calm) { r.tip.at = want; r.tip.rate = 0; continue; }
    for (let i = 0; i < 4; i++) { r.tip.rate += ((want - r.tip.at) * 300 - r.tip.rate * 28) * dt / 4; r.tip.at += r.tip.rate * dt / 4; }
    if (Math.abs(want - r.tip.at) < 0.003 && Math.abs(r.tip.rate) < 0.003) { r.tip.at = want; r.tip.rate = 0; }
    else rest = false;
  }
  draw();
  const settled = !touring && x === target && rest;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => { touring = false; target = clamp(next, REACH[0], REACH[1]); clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; clock = (hourAt(target) - ${startI} + N) % N * 1.6; run(); }, 3600); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
// 포인터 가로 위치를 막대 줄의 화면 위치에 맞춘다.
const ends = [iso([REACH[0], 0, 0], P)[0], iso([REACH[1], 0, 0], P)[0]];
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const vx = (event.clientX - box.left) / box.width * ${WIDTH};
  steer(REACH[0] + clamp((vx - ends[0]) / (ends[1] - ends[0]), 0, 1) * (REACH[1] - REACH[0]));
});
stage.addEventListener("pointerleave", () => steer(barX(hourAt(target))));
stage.addEventListener("keydown", (event) => {
  const here = hourAt(target);
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.min(N - 1, here + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.max(0, here - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = N - 1;
  if (to === null) return;
  event.preventDefault();
  steer(barX(to));
});
draw();
`;

const peakOn = ON.indexOf(Math.max(...ON));
const peakOff = OFF.indexOf(Math.max(...OFF));
const body = k.plateHtml({
  fig: "Fig 1",
  title: "강남역 승하차 게이지",
  hint: "가로로 움직이면 시간대가 바뀝니다 · ← →",
  readout: readoutOf(startI, ON[startI], OFF[startI]),
  keys: [
    { mark: "lit", label: "플런저와 바늘: 고른 시간대의 막대 높이를 읽는다. 바늘 한 바퀴 = 12,000명, 큰 눈금 = 1,000명" },
    { mark: "raised", label: "앞줄 막대 24개 = 승차, 단 위 뒷줄 24개 = 하차. 막대 높이 1 = 200명" },
  ],
  caption: `강남역(2호선) ${month.label} 시간대별 하루 평균 승하차 인원(한 달 합계 ÷ ${month.days}일)을 04시부터 다음 날 03시까지 게이지 막대로 세웠다. 아침 ${hourLabel(HOURS[peakOff])}엔 하차 ${fmt(OFF[peakOff])}명으로 뒷줄이 가장 높고, 저녁 ${hourLabel(HOURS[peakOn])}엔 승차 ${fmt(ON[peakOn])}명으로 앞줄이 가장 높다. 출처: 서울특별시, 서울 열린데이터광장(공공누리 제1유형).`,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="강남역 승하차 게이지: 화살표 키로 시간대를 옮긴다" aria-valuemin="0" aria-valuemax="23" aria-valuenow="8">${svg}</div>`,
});

const name = theme === "light" ? "gangnam-gauge-light.html" : "gangnam-gauge.html";
const html = k.pageHtml({ title: "강남역 승하차 게이지", theme, body, script: kitScript() + live }).replace('<html lang="en">', '<html lang="ko">');
writeFileSync(join(HERE, name), html);
console.log("wrote", name);

#!/usr/bin/env node
// Objective design metrics from exported Figma nodes (figma/nodes.json). Lint says pass/fail per rule;
// this turns the same export into numbers you can compare across versions.
// node scripts/design-metrics.mjs <workspace dir> [<workspace dir> ...]  -> markdown table
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { contrastRatio } from "./lib.mjs";

const solid = (paints = []) => paints.find((p) => p.type === "SOLID" && (p.opacity ?? 1) > 0);
const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const pct = (a, b) => (b ? round((100 * a) / b, 0) : 100);

export function designMetrics({ nodes, components }) {
  const interactive = new Set(components.components.filter((c) => c.interactive).map((c) => c.name));
  const texts = [], targets = [], layouts = [], perScreen = [], colors = new Set(), radii = new Set();
  let paintsTotal = 0, paintsBound = 0, gridChildren = 0, gridOn = 0;

  for (const frame of nodes.frames ?? []) {
    const screen = { name: frame.name, elements: 0, texts: 0, lefts: new Set() };
    const visit = (n, ax, ay, bg, depth, onMap = false, parent = null, first = true) => {
      onMap = onMap || ["Pins", "MapLabels", "MapBase"].includes(n.name); // 지도 위 핀·라벨은 정렬·밀도에서 뺀다
      const x = ax + (depth ? n.x : 0), y = ay + (depth ? n.y : 0);
      if (!onMap) screen.elements++;
      for (const [k, list] of [["fills", n.fills], ["strokes", n.strokes]]) {
        const p = solid(list);
        if (!p) continue;
        paintsTotal++; colors.add(p.hex.toUpperCase());
        if (n.boundVariables?.[k]) paintsBound++;
      }
      if (n.cornerRadius) radii.add(n.cornerRadius);
      const own = n.type !== "TEXT" && solid(n.fills);
      const back = own ? own.hex : bg;
      if (n.type === "TEXT") {
        if (!onMap) screen.texts++;
        // 정렬선: 줄을 시작하는 글자만(세로 묶음 안이거나 가로 줄의 첫 요소). 배지·칩(64px 이하) 안 가운데 글자는 뺀다
        const startsLine = !parent || parent.layoutMode !== "HORIZONTAL" || first;
        if (!onMap && startsLine && !(parent && parent.width <= 64)) screen.lefts.add(Math.round(x));
        const fg = solid(n.fills);
        const large = n.fontSize >= 24 || (n.fontSize >= 18.66 && n.fontWeight >= 700);
        texts.push({ size: n.fontSize, weight: n.fontWeight, ratio: fg ? contrastRatio(fg.hex, back) : null, min: large ? 3 : 4.5, chars: [...(n.characters ?? "")].length });
      }
      if (interactive.has(n.component ?? "") ) targets.push({ w: n.width, h: n.height });
      if (n.layoutMode && n.layoutMode !== "NONE") layouts.push(n);
      if (depth === 1) {
        // lint와 같은 예외: 화면을 덮는 바탕 레이어는 제외, 오른쪽 16 여백에 붙은 요소의 x는 격자로 본다
        const fullBleed = n.x <= 0 && n.x + n.width >= frame.width;
        const xOk = n.x % 4 === 0 || n.x + n.width === frame.width - 16;
        if (!fullBleed) { gridChildren++; if (xOk && n.y % 4 === 0) gridOn++; }
      }
      (n.children ?? []).forEach((c, i) => visit(c, x, y, back, depth + 1, onMap, n, i === 0));
    };
    visit(frame, 0, 0, solid(frame.fills)?.hex ?? "#FFFFFF", 0);
    perScreen.push(screen);
  }

  const sizes = [...new Set(texts.map((t) => t.size))].sort((a, b) => a - b);
  const steps = sizes.slice(1).map((s, i) => s / sizes[i]);
  const ratios = texts.filter((t) => t.ratio != null);
  const SPACE = [0, 4, 8, 12, 16, 24, 32, 40, 48];
  const spacingVals = layouts.flatMap((n) => ["itemSpacing", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom"].map((k) => n[k]).filter((v) => v != null));
  const body = sizes.includes(16) ? 16 : sizes[Math.floor(sizes.length / 2)];
  const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);

  return {
    screens: perScreen.length,
    "명도 대비 최소": ratios.length ? round(Math.min(...ratios.map((t) => t.ratio))) + ":1" : "-",
    "명도 대비 통과율(WCAG AA)": pct(ratios.filter((t) => t.ratio >= t.min).length, ratios.length) + "%",
    "터치 영역 44pt 이상": pct(targets.filter((t) => t.w >= 44 && t.h >= 44).length, targets.length) + `% (${targets.length}개)`,
    "글자 크기 단계": `${sizes.length}단계 (${sizes.join("/")})`,
    "타입 스케일 평균 비율": steps.length ? round(avg(steps)) : "-",
    "제목:본문 크기 비": round(Math.max(...sizes) / body),
    "굵기 종류": new Set(texts.map((t) => t.weight)).size,
    "최소 글자 크기": Math.min(...sizes) + "px",
    "간격 토큰 준수율": pct(spacingVals.filter((v) => SPACE.includes(v)).length, spacingVals.length) + "%",
    "4pt 격자 준수율(화면 직속)": pct(gridOn, gridChildren) + "%",
    "고유 색 수": colors.size,
    "토큰 연결률(색)": pct(paintsBound, paintsTotal) + "%",
    "모서리 종류": `${radii.size} (${[...radii].sort((a, b) => a - b).join("/")})`,
    "화면당 요소 수(평균, 지도 제외)": round(avg(perScreen.map((s) => s.elements)), 0),
    "화면당 글자 수(평균, 지도 제외)": round(avg(perScreen.map((s) => s.texts)), 0),
    "왼쪽 정렬선 수(평균, 지도 제외)": round(avg(perScreen.map((s) => s.lefts.size)), 1),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dirs = process.argv.slice(2);
  if (!dirs.length) { console.error("사용: design-metrics.mjs <작업 폴더(figma/nodes.json, components.json 포함)> ..."); process.exit(1); }
  const read = (d, f) => JSON.parse(fs.readFileSync(path.join(d, f), "utf8"));
  const cols = dirs.map((d) => ({ name: path.basename(d), m: designMetrics({ nodes: read(d, "figma/nodes.json"), components: read(d, "components.json") }) }));
  const keys = Object.keys(cols[0].m);
  console.log(`| 지표 | ${cols.map((c) => c.name).join(" | ")} |`);
  console.log(`|---|${cols.map(() => "---").join("|")}|`);
  for (const k of keys) console.log(`| ${k} | ${cols.map((c) => c.m[k]).join(" | ")} |`);
}

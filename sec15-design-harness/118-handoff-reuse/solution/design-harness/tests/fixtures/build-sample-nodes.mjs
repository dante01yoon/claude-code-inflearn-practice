#!/usr/bin/env node
// Builds two node exports in the exact shape scripts/figma/export-nodes.js returns,
// so lint-figma can be tried without a Figma file:
//   tests/fixtures/good-nodes.json    -> clean sample (fixture: true)
//   tests/fixtures/bad-nodes.json     -> same screens with deliberate mistakes
import fs from "node:fs";
import path from "node:path";
import { HARNESS as ROOT, readJson } from "../../scripts/lib.mjs";

const data = readJson(path.join(ROOT, "tests/fixtures/project/stations.json")).stations;
const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
};
const C = {
  brand: "#1F6B3A", "brand-soft": "#EAF4EC", danger: "#B3261E", "danger-soft": "#FBECEB",
  text: "#1C1F1D", "text-muted": "#55605A", "on-brand": "#FFFFFF", surface: "#FFFFFF", border: "#DCE2DE",
};
const fill = (token) => ({ fills: [{ type: "SOLID", color: rgb(C[token]), visible: true }], boundVariables: { fills: `color/${token}` } });
let id = 0;
const node = (props, children) => ({ id: `0:${++id}`, x: 0, y: 0, ...props, ...(children && { children }) });
const text = (name, characters, size, weight, color, y = 0, x = 0) =>
  node({ name, type: "TEXT", characters, fontSize: size, fontWeight: weight, fontFamily: "Pretendard", x, y, width: 280, height: Math.round(size * 1.5), ...fill(color) });

const appBar = (title, back) =>
  node({ name: "AppBar", type: "INSTANCE", component: "AppBar", width: 390, height: 56, ...fill("surface") }, [
    ...(back ? [node({ name: "BackButton", type: "INSTANCE", component: "BackButton", x: 4, y: 6, width: 44, height: 44 })] : []),
    text("Title", title, 20, 700, "text", 14, back ? 52 : 16),
  ]);
const source = (y) => text("SourceNote", "출처: 서울특별시 따릉이 실시간 대여정보, 공공누리 제1유형", 13, 400, "text-muted", y, 16);
const row = (s, y) => {
  const empty = s.parkingBikeTotCnt === 0;
  return node({ name: "StationRow", type: "INSTANCE", component: "StationRow", x: 16, y, width: 358, height: 72, layoutMode: "HORIZONTAL", itemSpacing: 12, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, ...fill("surface") }, [
    text("StationName", s.stationName, 16, 400, "text", 12, 16),
    node({ name: "CountBadge", type: "INSTANCE", component: "CountBadge", x: 270, y: 16, width: 72, height: 40, cornerRadius: 6, ...fill(empty ? "danger-soft" : "brand-soft") }, [
      text("Count", empty ? "0대" : `${s.parkingBikeTotCnt}대`, 20, 700, empty ? "danger" : "brand", 8, 8),
    ]),
  ]);
};
const message = (title, body, withRetry) =>
  node({ name: "StateMessage", type: "INSTANCE", component: "StateMessage", x: 16, y: 280, width: 358, height: 200 }, [
    text("Title", title, 20, 700, "text", 0, 0),
    text("Body", body, 16, 400, "text-muted", 40, 0),
    ...(withRetry ? [node({ name: "Button", type: "INSTANCE", component: "Button", x: 0, y: 100, width: 120, height: 44, cornerRadius: 12, ...fill("brand") }, [text("Label", "다시 시도", 16, 700, "on-brand", 10, 24)])] : []),
  ]);
const frame = (name, children) => node({ name, type: "FRAME", width: 390, height: 844, ...fill("surface") }, children);

const detail = data.find((s) => s.stationId === "ST-6");
const clean = {
  fixture: true,
  fileKey: null,
  exportedAt: new Date().toISOString(),
  page: "Screens",
  frames: [
    frame("station-list/default", [
      appBar("따릉이 대여소"),
      text("Summary", `대여소 ${data.length}곳, 자전거 있는 곳 ${data.filter((s) => s.parkingBikeTotCnt > 0).length}곳`, 16, 400, "text-muted", 64, 16),
      ...data.map((s, i) => row(s, 104 + i * 80)),
      source(800),
    ]),
    frame("station-list/empty", [appBar("따릉이 대여소"), message("표시할 대여소가 없어요", "잠시 뒤 다시 확인해 주세요", false), source(800)]),
    frame("station-list/error", [appBar("따릉이 대여소"), message("대여소 정보를 불러오지 못했어요", "인터넷 연결을 확인한 뒤 다시 시도해 주세요", true), source(800)]),
    frame("station-list/loading", [appBar("따릉이 대여소"), message("불러오는 중…", "대여소 정보를 가져오고 있어요", false), source(800)]),
    frame("station-detail/default", [
      appBar(detail.stationName, true),
      node({ name: "Hero", type: "FRAME", x: 16, y: 72, width: 358, height: 200, cornerRadius: 12, ...fill("brand-soft") }, [
        text("BikeCount", `${detail.parkingBikeTotCnt}`, 56, 700, "brand", 40, 24),
        text("Unit", "대 남음", 16, 400, "text", 128, 24),
      ]),
      text("Racks", `거치대 ${detail.rackTotCnt}개`, 16, 400, "text", 296, 16),
      text("Location", `위도 ${detail.stationLatitude}, 경도 ${detail.stationLongitude}`, 16, 400, "text-muted", 332, 16),
      source(800),
    ]),
    frame("station-detail/empty", [appBar("대여소 상세", true), message("대여소를 찾을 수 없어요", "목록에서 다시 골라 주세요", false), source(800)]),
    frame("station-detail/error", [appBar("대여소 상세", true), message("대여소 정보를 불러오지 못했어요", "인터넷 연결을 확인한 뒤 다시 시도해 주세요", true), source(800)]),
    frame("station-detail/loading", [appBar("대여소 상세", true), message("불러오는 중…", "대여소 정보를 가져오고 있어요", false), source(800)]),
  ],
};

// Typical unguided output: raw hex, off-scale type and spacing, small tap target, default names,
// low contrast, missing states, banned copy.
const bad = structuredClone(clean);
bad.fixture = true;
const list = bad.frames[0];
list.children[1].fontSize = 15; // off scale
list.children[1].fills[0].color = rgb("#9AA09C"); // low contrast, not a token
delete list.children[1].boundVariables;
list.children[2].itemSpacing = 10; // off scale
list.children[2].children[1].width = 32; // CountBadge fine (not interactive), but:
list.children[3].height = 36; // StationRow too short to tap
list.children[4].name = "Frame 12"; // default layer name
list.children[4].x = 10; // breaks side margin
bad.frames[2].children[1].children[1].characters = "오류가 발생하였습니다";
bad.frames = bad.frames.filter((f) => f.name !== "station-detail/loading"); // missing state

fs.writeFileSync(path.join(ROOT, "tests/fixtures/good-nodes.json"), JSON.stringify(clean, null, 2) + "\n");
fs.writeFileSync(path.join(ROOT, "tests/fixtures/bad-nodes.json"), JSON.stringify(bad, null, 2) + "\n");
console.log("sample nodes written");

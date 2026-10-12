import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { WINDOW_PRESETS, quietestInWindow, total, usageMonth } from "../stats.mjs";
import {
  STATION_MASTER_CSV, SUBWAY_CSV, decodeCsv, mergeStations, parseCsv, stationLocator, toSubwayRows,
} from "../subway-csv.mjs";

// 앱 기본 데이터: 2026년 9월 승하차 CSV와 역사마스터 CSV
const readCsv = (path) => parseCsv(decodeCsv(readFileSync(path)));
const rows = toSubwayRows(readCsv(SUBWAY_CSV));
const coordOf = stationLocator(readCsv(STATION_MASTER_CSV));
const find = (name, line) => rows.find((r) => r.STTN === name && r.SBWY_ROUT_LN_NM === line);

test("9월 승하차는 621행, 역명 528개, 여러 행인 역명 78곳, 노선 27개다", () => {
  assert.equal(rows.length, 621);
  const lineCount = Map.groupBy(rows, (r) => r.STTN);
  assert.equal(lineCount.size, 528);
  assert.equal([...lineCount.values()].filter((g) => g.length > 1).length, 78);
  assert.equal(new Set(rows.map((r) => r.SBWY_ROUT_LN_NM)).size, 27);
  for (const row of rows) assert.equal(usageMonth(row).label, "2026년 9월", row.STTN);
});

test("변환된 행을 count로 읽는다: 가산디지털단지(7호선) 승차+하차", () => {
  const gasan = find("가산디지털단지", "7호선");
  assert.equal(total(gasan, 11), 61201);
  assert.equal(total(gasan, 8), 403279);
  assert.equal(total(gasan, 4), 735);
});

test("서울역(1호선)은 9월에도 08시 하차가 승차보다 많다", () => {
  const seoul = find("서울역", "1호선");
  assert.equal(seoul.HR_8_GET_ON_NOPE, 195766);
  assert.equal(seoul.HR_8_GET_OFF_NOPE, 256379);
});

test("낮 창 답: 04·01시대가 답인 행이 없고, 창 안이 전부 0인 행은 경의선 계양뿐이다", () => {
  const day = WINDOW_PRESETS.find((w) => w.id === "day").hours;
  const answers = rows.map((r) => quietestInWindow(r, day));
  assert.ok(!answers.some((a) => a.includes(4) || a.includes(1)));
  const empty = rows.filter((_, i) => !answers[i].length).map((r) => `${r.SBWY_ROUT_LN_NM} ${r.STTN}`);
  assert.deepEqual(empty, ["경의선 계양"]);
});

test("좌표: 9월 승하차의 역명 528개가 모두 역사마스터에서 좌표를 찾는다", () => {
  const missing = rows.filter((r) => !coordOf(r)).map((r) => `${r.STTN}(${r.SBWY_ROUT_LN_NM})`);
  assert.deepEqual(missing, []);
});

test("좌표: 이름이 다른 곳은 매핑표로, 같은 이름의 다른 역은 노선으로 구분한다", () => {
  const near = (a, b) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
  assert.ok(near(coordOf(find("자양(뚝섬한강공원)", "7호선")), [37.53154, 127.066704])); // 역사마스터 '뚝섬유원지'
  assert.ok(near(coordOf(find("한국항공대", "경의선")), [37.602888, 126.868387])); // 역사마스터 '화전'
  assert.ok(near(coordOf(find("양평", "5호선")), [37.525569, 126.886129])); // 서울 영등포구
  assert.ok(near(coordOf(find("양평", "중앙선")), [37.492773, 127.491837])); // 경기 양평군
});

test("환승역 합산: 같은 역명을 합치되 노선별 지점이 1km 안에 있다(양평은 따로 둔다)", () => {
  const merged = mergeStations(rows);
  assert.equal(merged.length, 529); // 역명 528개 + 양평이 둘
  assert.deepEqual(merged.filter((m) => m.STTN === "양평").map((m) => m.SBWY_ROUT_LN_NM), ["5호선", "중앙선"]);
  for (const m of merged) {
    assert.ok(coordOf(m), m.STTN);
    const points = m.LINES.map((line) => coordOf({ STTN: m.STTN, SBWY_ROUT_LN_NM: line }));
    const km = (a, b) => Math.hypot((a[0] - b[0]) * 110.54, (a[1] - b[1]) * 111.32 * Math.cos((a[0] * Math.PI) / 180));
    for (const a of points) for (const b of points) assert.ok(km(a, b) < 1, `${m.STTN} ${m.SBWY_ROUT_LN_NM}`);
  }
});

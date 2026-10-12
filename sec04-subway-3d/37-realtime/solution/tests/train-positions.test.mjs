import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { STATION_MASTER_CSV, decodeCsv, parseCsv } from "../subway-csv.mjs";
import { REALTIME_LINES, lineGeometry, placeTrain, stopKey } from "../train-positions.mjs";

const records = parseCsv(decodeCsv(readFileSync(STATION_MASTER_CSV)));
const geo = lineGeometry(records);
const at = (id) => {
  const r = records.find((rec) => rec["역사_ID"] === id);
  return [Number(r["경도"]), Number(r["위도"])];
};
const meters = (a, b) => Math.hypot((a[0] - b[0]) * 111320 * Math.cos((a[1] * Math.PI) / 180), (a[1] - b[1]) * 110540);

// realtimePosition 응답 행 모양(2026-10-12 sample 키로 받은 값에서 필요한 필드만)
const row = (subwayNm, statnNm, statnTnm, updnLine, trainSttus) => ({ subwayNm, statnNm, statnTnm, updnLine, trainSttus, trainNo: "0000" });

test("역 이름 키: 괄호 부역명·공백·'종착'을 빼고, API의 '서울'은 서울역이다", () => {
  assert.equal(stopKey("강변(동서울터미널)"), "강변");
  assert.equal(stopKey("교대(법원.검찰청)"), "교대");
  assert.equal(stopKey("성수종착"), "성수");
  assert.equal(stopKey("서울"), "서울역");
  assert.equal(stopKey("응암순환(상선)"), "응암");
});

test("실시간 위치를 주는 노선은 19개다(경전철·인천 1·2호선 제외)", () => {
  assert.equal(REALTIME_LINES.length, 19);
  assert.ok(!REALTIME_LINES.includes("김포골드라인"));
  assert.ok(REALTIME_LINES.includes("GTX-A"));
});

test("한 노선 안에서 키가 같은 역은 같은 곳이다(지선이 갈라지는 역)", () => {
  for (const [line, g] of geo.lines) {
    for (const [key, hits] of g.index) {
      const points = hits.map(({ b, i }) => g.branches[b].coords[i]);
      for (const p of points) assert.ok(meters(p, points[0]) < 1000, `${line} ${key}`);
    }
  }
});

test("도착한 열차는 그 역 옆에 놓인다", () => {
  const t = placeTrain(geo, row("2호선", "신당", "성수종착", "1", "1"));
  assert.equal(t.dir, 1); // 외선: 시청 → 을지로입구 쪽 순서
  assert.ok(meters(t.position, at("0206")) < 100);
  assert.ok(meters(placeTrain(geo, row("1호선", "서울", "인천", "1", "1")).position, at("0150")) < 100);
  assert.ok(placeTrain(geo, row("5호선", "신정(은행정)", "방화", "0", "1")));
  assert.ok(placeTrain(geo, row("2호선", "강변", "성수종착", "0", "1")));
});

test("종착역 쪽이 진행 방향이고, 진입 중인 열차는 이전 역과 사이에 놓인다", () => {
  // 1호선 종각 → 연천: 경로 순서(연천 … 종각)에서 앞쪽으로 간다. 이전 역은 시청.
  const t = placeTrain(geo, row("1호선", "종각", "연천", "0", "0"));
  assert.equal(t.dir, -1);
  const here = at("0152"), prev = at("0151");
  assert.ok(meters(t.position, prev) < meters(here, prev));
  assert.ok(meters(t.position, here) > 100);
});

test("갈라지는 역에서는 종착역이 있는 경로를 쓴다", () => {
  const t = placeTrain(geo, row("2호선", "성수", "신설동", "1", "2")); // 성수지선으로 출발
  assert.equal(t.dir, 1);
  assert.ok(meters(t.position, at("0244")) < meters(at("0211"), at("0244"))); // 용답 쪽으로 움직였다
});

test("종착역이 지선 너머에 있으면 갈라지는 역 쪽으로 간다", () => {
  assert.equal(placeTrain(geo, row("1호선", "종각", "인천", "1", "1")).dir, 1); // 본선 끝 구로에서 경인선으로
  assert.equal(placeTrain(geo, row("5호선", "아차산(어린이대공원후문)", "마천", "1", "1")).dir, 1); // 강동에서 마천 지선으로
  assert.equal(placeTrain(geo, row("5호선", "오금", "방화", "0", "1")).dir, -1); // 마천 지선에서 강동 쪽으로
  assert.equal(placeTrain(geo, row("6호선", "효창공원앞", "응암순환(상선)", "0", "1")).dir, -1);
});

test("노선 순서에 없는 역은 다른 노선의 같은 역에 방향 없이 놓는다", () => {
  const t = placeTrain(geo, row("경춘선", "용산", "춘천", "1", "1"));
  assert.equal(t.dir, 0);
  assert.ok(meters(t.position, at("1003")) < 100);
});

test("노선이나 역을 모르면 null", () => {
  assert.equal(placeTrain(geo, row("없는선", "서울", "인천", "0", "1")), null);
  assert.equal(placeTrain(geo, row("2호선", "없는역", "성수", "0", "1")), null);
});

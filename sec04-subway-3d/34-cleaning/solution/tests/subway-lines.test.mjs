import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { STATION_MASTER_CSV, decodeCsv, parseCsv } from "../subway-csv.mjs";
import { DUPLICATE_STATIONS, SUBWAY_LINES, parseStop } from "../subway-lines.mjs";

const master = new Map(parseCsv(decodeCsv(readFileSync(STATION_MASTER_CSV))).map((r) => [r["역사_ID"], r]));
const km = (idA, idB) => {
  const a = master.get(idA), b = master.get(idB);
  const lat = Number(a["위도"]);
  return Math.hypot((lat - b["위도"]) * 110.54, (a["경도"] - b["경도"]) * 111.32 * Math.cos((lat * Math.PI) / 180));
};
const paths = Object.entries(SUBWAY_LINES).flatMap(([line, ps]) =>
  ps.map((p) => ({ line, ...p, label: `${line} ${p.name}`, ids: p.stops.map((s) => parseStop(s).id) })));
// 이어지는 역 쌍. 순환선은 마지막 역 → 첫 역도 넣는다.
const hops = paths.flatMap((p) => {
  const seq = p.loop ? [...p.ids, p.ids[0]] : p.ids;
  return seq.slice(1).map((id, i) => [p.label, seq[i], id]);
});

test("노선 24개, 노선마다 경로가 있고 경로마다 역이 2곳 이상이다", () => {
  assert.equal(Object.keys(SUBWAY_LINES).length, 24);
  for (const p of paths) assert.ok(p.ids.length >= 2, p.label);
  assert.equal(SUBWAY_LINES["2호선"].find((p) => p.name === "순환선").stops.length, 43);
});

test("모든 역사_ID가 역사마스터에 있고 적힌 역사명과 같다", () => {
  for (const p of paths) {
    for (const stop of p.stops) {
      const { id, name } = parseStop(stop);
      assert.equal(master.get(id)?.["역사명"], name, `${p.label} ${stop}`);
    }
  }
});

test("한 경로 안에 같은 역이 두 번 나오지 않는다", () => {
  for (const p of paths) assert.equal(new Set(p.ids).size, p.ids.length, p.label);
});

test("지선은 같은 노선의 앞선 경로에 있는 역에서 갈라진다", () => {
  for (const ps of Object.values(SUBWAY_LINES)) {
    const seen = new Set();
    ps.forEach((p, i) => {
      const ids = p.stops.map((s) => parseStop(s).id);
      if (i > 0) assert.ok(seen.has(ids[0]), `${p.name} 시작 ${p.stops[0]}`);
      ids.forEach((id) => seen.add(id));
    });
  }
});

test("역사마스터 784개 지점이 모두 노선 순서에 있거나 같은 역으로 이어진다", () => {
  const used = new Set(paths.flatMap((p) => p.ids));
  for (const id of master.keys()) {
    const target = DUPLICATE_STATIONS[id];
    if (target) {
      assert.ok(!used.has(id), `${id}는 중복 지점인데 노선에 있다`);
      assert.ok(used.has(target), `${id} → ${target}`);
      assert.equal(master.get(id)["역사명"], master.get(target)["역사명"], id);
      assert.ok(km(id, target) < 1, `${id} → ${target}`);
    } else {
      assert.ok(used.has(id), `${id} ${master.get(id)["역사명"]}(${master.get(id)["호선"]})가 어느 노선에도 없다`);
    }
  }
  assert.equal(master.size, 784);
});

test("이웃한 역 사이가 11km 안이고, 순서가 꺾이지 않는다", () => {
  for (const [label, a, b] of hops) assert.ok(km(a, b) < 11, `${label}: ${a} → ${b} ${km(a, b).toFixed(1)}km`);
  // A → B → C로 가는 길이 A → C 직선의 1.8배를 넘으면 B의 순서가 틀린 것이다(예: ID 순으로 놓은 동묘앞).
  for (const p of paths) {
    const seq = p.loop ? [...p.ids, p.ids[0]] : p.ids;
    for (let i = 0; i + 2 < seq.length; i++) {
      const [a, b, c] = seq.slice(i, i + 3);
      const direct = km(a, c);
      if (direct > 0.8) assert.ok(km(a, b) + km(b, c) < 1.8 * direct, `${p.label}: ${p.stops[i]} → ${p.stops[i + 1]}`);
    }
  }
});

test("역사_ID 순으로 놓으면 틀리는 곳을 바로잡았다", () => {
  const names = (line, path) => SUBWAY_LINES[line].find((p) => p.name === path).stops.map((s) => parseStop(s).name);
  const after = (list, name) => list[list.indexOf(name) + 1];
  const line1 = names("1호선", "본선(연천–서울역–구로)");
  assert.equal(after(line1, "신설동"), "동묘앞");
  assert.equal(after(line1, "동묘앞"), "동대문");
  assert.equal(after(names("8호선", "별내–모란"), "복정"), "남위례");
  assert.equal(after(names("공항철도", "서울역–인천공항2터미널"), "청라국제도시"), "영종");
  assert.equal(after(names("4호선", "진접–오이도"), "산본"), "수리산");
  assert.equal(after(names("경강선", "판교–여주"), "판교"), "성남");
  assert.equal(after(names("경의중앙선", "임진강–지평"), "운천"), "문산");
});

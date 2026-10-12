import { test } from "node:test";
import assert from "node:assert/strict";
import { placePeakLabels } from "../station-compare.mjs";

const OPTS = { width: 360, top: 8, bottom: 150 };
const box = (l, p) => {
  const w = [...p.text].length * 10;
  const left = l.anchor === "start" ? l.x : l.anchor === "end" ? l.x - w : l.x - w / 2;
  return { l: left, r: left + w, t: l.y - 10, b: l.y + 2 };
};
const apart = (a, b) => a.r <= b.l || b.r <= a.l || a.b <= b.t || b.b <= a.t;

test("피크가 같은 시간대·비슷한 높이면 이름표가 겹치지 않는다(강남·홍대입구 18시)", () => {
  const pts = [{ x: 239, y: 36, text: "강남" }, { x: 239, y: 34, text: "홍대입구" }];
  const [a, b] = placePeakLabels(pts, OPTS);
  assert.ok(apart(box(a, pts[0]), box(b, pts[1])));
});

test("피크가 위쪽 끝에 붙어도(위로 올릴 자리가 없어도) 겹치지 않는다", () => {
  const pts = [{ x: 200, y: 8, text: "홍대입구" }, { x: 205, y: 9, text: "잠실(송파구청)" }];
  const [a, b] = placePeakLabels(pts, OPTS);
  assert.ok(a.y >= 18 && b.y >= 18);
  assert.ok(apart(box(a, pts[0]), box(b, pts[1])));
});

test("이름표가 다른 역의 피크 점을 덮지 않는다", () => {
  const pts = [{ x: 239, y: 36, text: "강남" }, { x: 239, y: 30, text: "홍대입구" }];
  const labels = placePeakLabels(pts, OPTS);
  labels.forEach((l, i) => pts.forEach((q) => {
    assert.ok(apart(box(l, pts[i]), { l: q.x - 4, r: q.x + 4, t: q.y - 4, b: q.y + 4 }), `${pts[i].text} 이름표`);
  }));
});

test("멀리 떨어진 피크는 둘 다 점 바로 위에 단다", () => {
  const pts = [{ x: 60, y: 80, text: "강남" }, { x: 300, y: 40, text: "서울역" }];
  const [a, b] = placePeakLabels(pts, OPTS);
  assert.deepEqual([a.y, a.anchor, b.y, b.anchor], [72, "start", 32, "end"]);
});

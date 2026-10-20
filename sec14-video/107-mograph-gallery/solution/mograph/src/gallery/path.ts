// 점 목록(폴리라인) 기반의 간단한 경로 도구. 길이 비율로 일부만 그리거나 위치를 얻는다.
export type Pt = [number, number];

export const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 60): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ];
  });

export const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 60): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

const segLen = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export const polyLength = (pts: Pt[]) =>
  pts.slice(1).reduce((s, p, i) => s + segLen(pts[i], p), 0);

// 앞에서부터 length만큼 잘라낸 점 목록과, 끝점·진행 방향(도)을 돌려준다
export const cutPoly = (pts: Pt[], length: number) => {
  const out: Pt[] = [pts[0]];
  let left = length;
  for (let i = 1; i < pts.length; i++) {
    const l = segLen(pts[i - 1], pts[i]);
    const angle =
      (Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) * 180) / Math.PI;
    if (left <= l) {
      const t = l === 0 ? 0 : left / l;
      const p: Pt = [
        pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
        pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t,
      ];
      out.push(p);
      return { pts: out, tip: p, angle };
    }
    left -= l;
    out.push(pts[i]);
  }
  const n = pts.length;
  const angle =
    (Math.atan2(pts[n - 1][1] - pts[n - 2][1], pts[n - 1][0] - pts[n - 2][0]) * 180) / Math.PI;
  return { pts: out, tip: pts[n - 1], angle };
};

export const toD = (pts: Pt[]) =>
  pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

// 화면 확인 결과를 표에 붙인다. 답 카드에서 '가장 가까운'이 든 새 줄을 찾아 시(時)를 읽고 기대(10시대)와 비교한다.
// 사용: node merge-screen.mjs  → results/before-after.json에 화면 칸을 더하고 표를 다시 보여 준다
import { readFileSync, writeFileSync } from "node:fs";
const HERE = new URL(".", import.meta.url).pathname, P = `${HERE}results/before-after.json`;
const WANT = 10;  // 여의도(5·9호선 합산), 서울 09:20 → 9시대 45% → 10시대 26%. 컴퓨터 시각(한국과 다른 시간대)으로 계산하면 다른 시대가 나온다
const data = JSON.parse(readFileSync(P, "utf8"));
for (const r of data.rows) {
  const n = r._.dir.split("/").pop();
  let s; try { s = JSON.parse(readFileSync(`${HERE}results/screen/${n}.json`, "utf8")); } catch { r.화면 = "못 봄"; continue; }
  const lines = s.card.split("\n").filter((l) => /가장 가까운/.test(l));  // 새로 생긴 줄 (「한가한」·「한산한」 등 표현은 달라도 됨)
  const hours = lines.flatMap((l) => [...l.matchAll(/(\d{1,2})\s*시/g)].map((m) => Number(m[1])));
  r.화면 = !lines.length ? "표시 없음" : hours.includes(WANT) ? `맞음(${WANT}시대)` : `틀림(${hours.join(",") || "?"})`;
  r._.screen = { lines, errs: s.errs };
  r.버그 = r.버그 - (r._.screenBug ?? 0); r._.screenBug = r.화면.startsWith("맞음") ? 0 : 1; r.버그 += r._.screenBug;
}
for (const a of data.avg) a.버그합계 = data.rows.filter((r) => r.조건 === a.조건).reduce((s, r) => s + r.버그, 0);
writeFileSync(P, JSON.stringify(data, null, 2));
console.table(data.rows.map(({ _, ...r }) => r));
console.table(data.avg);

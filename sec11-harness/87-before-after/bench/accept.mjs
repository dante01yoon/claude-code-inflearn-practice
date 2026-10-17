// 숨은 채점: 클로드가 만든 next-quiet.mjs의 nextQuietHour(row, date)를 실제 9월 승하차로 확인한다.
// 클로드는 이 파일을 보지 못한다(복사본 밖에 있음). 같은 케이스를 서울 시간대와 미국 동부 시간대 컴퓨터에서 돌린다.
// 사용: node accept.mjs <복사본 폴더>   → 마지막 줄에 JSON { pass, total, fails: [...] }
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const TZS = ["Asia/Seoul", "America/New_York"];
// 실존 역 + 서울 시각. 기대값은 아래 ref()가 같은 데이터로 계산한다(손으로 적지 않음).
const CASES = [
  ["여의도", "5호선", "09:20"],    // 9시대 41% → 10시대 23%
  ["여의도", "5호선", "17:40"],    // 퇴근 붐빔을 지나 21시대
  ["홍대입구", "2호선", "13:10"],  // 자정을 넘어 0시대
  ["강남", "2호선", "10:05"],      // 23시대까지 기다림
  ["강남", "2호선", "05:59"],      // 지금 시간대가 이미 한가함
  ["서울역", "1호선", "02:30"],    // 02·03시는 0명(운행 안 함) → 건너뛰고 04시대
];

const dir = process.argv[2];
const mod = (f) => import(pathToFileURL(join(dir, f)).href);

if (process.argv[3] === "--one") {
  const { HOURS, total } = await mod("stats.mjs");
  const csv = await mod("subway-csv.mjs");
  process.chdir(dir);
  const rows = csv.toSubwayRows(csv.parseCsv(csv.decodeCsv(readFileSync(csv.SUBWAY_CSV))));
  // 기대값: 하루 띠의 '한' = 그 역 피크 대비 30% 미만, 0명 시간대는 빼고, 지금(서울) 시간대부터 24시간을 돈다
  const ref = (row, h0) => {
    const peak = Math.max(...HOURS.map((h) => total(row, h)));
    for (let k = 0; k < 24; k++) { const h = (h0 + k) % 24, v = total(row, h); if (v > 0 && v / peak < 0.3) return h; }
    return null;
  };
  // 돌려준 값에서 시(0~23)를 읽는다: 숫자, { hour }, "10시대" 같은 글자 모두 받음
  const hourOf = (v) => typeof v === "number" ? v : v && typeof v === "object" ? hourOf(v.hour ?? v.h ?? null)
    : typeof v === "string" && /(\d{1,2})\s*시/.test(v) ? Number(v.match(/(\d{1,2})\s*시/)[1]) : null;
  let fn = null, err = null;
  try { fn = (await mod("next-quiet.mjs")).nextQuietHour; } catch (e) { err = String(e.message).split("\n")[0]; }
  const out = CASES.map(([name, line, at]) => {
    const row = rows.find((r) => r.STTN === name && r.SBWY_ROUT_LN_NM === line);
    const want = ref(row, Number(at.slice(0, 2)));
    let got = null;
    try { got = fn ? hourOf(fn(row, new Date(`2026-10-17T${at}:00+09:00`))) : `없음: ${err}`; } catch (e) { got = `오류: ${String(e.message).slice(0, 60)}`; }
    return { 역: `${name}(${line})`, 서울시각: at, tz: process.env.TZ, 기대: want, 결과: got, ok: got === want };
  });
  console.log(JSON.stringify(out));
} else {
  const all = TZS.flatMap((tz) => JSON.parse(execFileSync("node", [process.argv[1], dir, "--one"], { env: { ...process.env, TZ: tz }, encoding: "utf8" }).trim().split("\n").pop()));
  const fails = all.filter((c) => !c.ok);
  // 사람이 볼 표: 케이스마다 기대 시대와 두 시간대 컴퓨터의 결과
  const lab = (v) => (typeof v === "number" ? `${String(v).padStart(2, "0")}시대` : String(v).slice(0, 24));
  console.log("숨은 채점 — 역 · 서울 시각 → 기대 | 서울 컴퓨터 | 미국 동부 컴퓨터");
  for (const [name, line, at] of CASES) {
    const [a, b] = TZS.map((tz) => all.find((c) => c.역 === `${name}(${line})` && c.서울시각 === at && c.tz === tz));
    console.log(`  ${a.역} ${at} → ${lab(a.기대)} | ${lab(a.결과)} ${a.ok ? "✓" : "✗"} | ${lab(b.결과)} ${b.ok ? "✓" : "✗"}`);
  }
  console.log(`통과 ${all.length - fails.length}/${all.length}`);
  if (!process.stdout.isTTY) console.log(JSON.stringify({ pass: all.length - fails.length, total: all.length, fails }));  // 측정 스크립트가 읽는 줄
}

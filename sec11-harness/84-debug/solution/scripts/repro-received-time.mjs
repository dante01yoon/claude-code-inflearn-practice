// 재현: subway.html 아래 실시간 열차·도시데이터 '받음' 시각이 컴퓨터 시간대를 따라 서울 시각과 달라지는지 본다.
// subway.html에서 시각을 만드는 식을 그대로 뽑아 TZ를 바꿔 가며 실행한다.
//   node scripts/repro-received-time.mjs           여러 시간대에서 차례로 실행
//   TZ=UTC node scripts/repro-received-time.mjs --one   지금 TZ에서 한 번만
// 하나라도 서울 시각과 다르면 종료 코드 1.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TIME_ZONES = ["Asia/Seoul", "UTC", "America/Sao_Paulo", "Europe/London", "Asia/Kolkata"];
// 서울 09:04:05 = UTC 00:04:05 (UTC·상파울루에서는 날짜까지 바뀌는 시각)
const UPDATED_AT = "2026-10-17T00:04:05.000Z";
const EXPECTED = { hour: 9, minute: 4, second: 5 };

const TARGETS = [
  { name: "실시간 열차", status: "trainsStatus" },
  { name: "도시데이터", status: "cityStatus" },
];

// `const at = <식>;` 바로 다음 줄에서 그 status 문구를 만드는 곳의 식을 찾는다.
function extractExpr(html, status) {
  const lines = html.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    const m = lines[i].match(/^\s*const at = (.+);\s*$/);
    if (m && lines[i + 1].includes(`${status}.textContent =`)) return m[1];
  }
  throw new Error(`subway.html에서 ${status}의 시각 식을 찾지 못함`);
}

// "오전 9:04:05", "09:04", "AM 9:04" 같은 글자를 24시간 숫자로
function parseClock(text) {
  const m = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  let hour = Number(m[1]);
  if (/오후|PM/i.test(text) && hour < 12) hour += 12;
  if (/오전|AM/i.test(text) && hour === 12) hour = 0;
  return { hour, minute: Number(m[2]), second: m[3] === undefined ? null : Number(m[3]) };
}

function runOne() {
  const html = readFileSync(new URL("../subway.html", import.meta.url), "utf8");
  const tz = process.env.TZ ?? "(TZ 없음)";
  let bad = 0;
  for (const t of TARGETS) {
    const expr = extractExpr(html, t.status);
    const text = new Function("data", `return ${expr};`)({ updatedAt: UPDATED_AT });
    const got = parseClock(text);
    const ok = got && got.hour === EXPECTED.hour && got.minute === EXPECTED.minute
      && (got.second === null || got.second === EXPECTED.second);
    if (!ok) bad++;
    console.log(`${ok ? "맞음" : "틀림"}  TZ=${tz.padEnd(16)} ${t.name.padEnd(6)} → "${text}"`);
  }
  return bad;
}

if (process.argv.includes("--one")) {
  process.exit(runOne() ? 1 : 0);
} else {
  const self = fileURLToPath(import.meta.url);
  const pad = (n) => String(n).padStart(2, "0");
  console.log(`updatedAt ${UPDATED_AT} → 기대값(서울) ${pad(EXPECTED.hour)}:${pad(EXPECTED.minute)}:${pad(EXPECTED.second)}\n`);
  let failed = 0;
  for (const tz of TIME_ZONES) {
    try {
      process.stdout.write(execFileSync(process.execPath, [self, "--one"], { env: { ...process.env, TZ: tz }, encoding: "utf8" }));
    } catch (err) {
      process.stdout.write(err.stdout ?? "");
      failed++;
    }
  }
  console.log(failed ? `\n${TIME_ZONES.length}개 시간대 중 ${failed}곳에서 서울 시각과 다름` : "\n모든 시간대에서 서울 시각과 같음");
  process.exit(failed ? 1 : 0);
}

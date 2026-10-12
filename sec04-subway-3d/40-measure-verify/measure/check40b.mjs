// 📏 40강 두 번째 실험 채점기(화면 찍기): 08시·18시 3D 지도 스크린샷, JS 오류, 375px 넘침을 기록한다. 글자 확인은 ocr40.py가 한다.
// 사용: hypit capture run check40b.mjs -- <url> <outdir>
import fs from 'node:fs';
export const options = { launch: { defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 } }, timeoutMs: 180_000 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, args, screenshot, log }) => {
  const [url, out] = args;
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch((e) => errs.push('goto ' + e.message));
  await sleep(4000);
  const setHour = (i) => page.evaluate((i) => { const s = document.getElementById('hour'); s.value = String(i); s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new Event('change', { bubbles: true })); }, i);
  await setHour(4); await sleep(3000);
  await screenshot({ path: `${out}/h08.png` });
  await setHour(14); await sleep(3000);
  await screenshot({ path: `${out}/h18.png` });
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
  await sleep(2000);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  fs.writeFileSync(`${out}/shot.json`, JSON.stringify({ errs, sw }, null, 1));
  log('ok ' + JSON.stringify({ errs: errs.length, sw }));
};

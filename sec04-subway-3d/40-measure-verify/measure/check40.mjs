// 📏 40강 버그 채점기: subway.html의 "지금 시간대 혼잡 TOP 5"(#top5)를 같은 7개 항목으로 검사한다.
// 사용: hypit capture run check40.mjs -- <url> <expected.json> <out.json>
import fs from 'node:fs';
export const options = { launch: { defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 } }, timeoutMs: 180_000 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = (s) => s.split('(')[0].trim();
export default async ({ page, args, log }) => {
  const [url, expPath, outPath] = args;
  const exp = JSON.parse(fs.readFileSync(expPath, 'utf8'));
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  const R = {};
  const ok = (k, v, note = '') => { R[k] = { pass: !!v, note }; };
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch((e) => errs.push('goto ' + e.message));
  await sleep(4000);
  const names = () => page.evaluate(() => {
    const el = document.getElementById('top5');
    if (!el) return null;
    let items = [...el.querySelectorAll('li')];
    if (!items.length) items = [...el.querySelectorAll('button, a, [role=button]')];
    return items.filter((x) => x.offsetParent !== null).map((x) => x.textContent.replace(/\s+/g, ' ').trim());
  });
  const setHour = (i) => page.evaluate((i) => { const s = document.getElementById('hour'); s.value = String(i); s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new Event('change', { bubbles: true })); }, i);
  const match = (shown, want) => shown && shown.length === 5 && want.every((w, k) => shown[k] && shown[k].includes(base(w.split('|')[0])));
  const n0 = await names();
  ok('C2_panel_5_items', n0 && n0.length === 5, JSON.stringify(n0));
  await setHour(4); await sleep(1500);
  const n8 = await names();
  ok('C3_top5_at_08_correct', match(n8, exp['4']), JSON.stringify(n8) + ' want ' + JSON.stringify(exp['4']));
  await setHour(14); await sleep(1500);
  const n18 = await names();
  ok('C4_updates_at_18', match(n18, exp['14']), JSON.stringify(n18) + ' want ' + JSON.stringify(exp['14']));
  // C5: 첫 항목을 누르면 그 역이 선택된다(답 카드 영역에 이름이 나타나고 "역을 골라 주세요"가 사라짐)
  let c5 = false, c5note = '';
  try {
    const target = base(exp['14'][0].split('|')[0]);
    const clicked = await page.evaluate(() => {
      const el = document.getElementById('top5'); if (!el) return false;
      const it = el.querySelector('button, a, [role=button]') || el.querySelector('li');
      if (!it) return false; it.click(); return true;
    });
    await sleep(1500);
    c5 = clicked && await page.evaluate((target) => {
      const q = document.getElementById('q');
      const cards = [...document.querySelectorAll('section, article, div')].filter((d) => d.offsetParent && /하루 평균/.test(d.textContent) && d.textContent.length < 600);
      return (q && q.value.includes(target)) || cards.some((d) => d.textContent.includes(target));
    }, target);
    c5note = 'clicked=' + clicked;
  } catch (e) { c5note = e.message; }
  ok('C5_click_selects_station', c5, c5note);
  // C7: 항목이 키보드로 누를 수 있는 요소이고, #top5 안 버튼에 aria-label이 있다
  const a11y = await page.evaluate(() => {
    const el = document.getElementById('top5'); if (!el) return { ok: false, why: 'no #top5' };
    const clickables = [...el.querySelectorAll('button, a[href], [role=button][tabindex]')];
    const btns = [...el.querySelectorAll('button')];
    const missing = btns.filter((b) => !b.getAttribute('aria-label')).length;
    return { ok: clickables.length >= 5 && missing === 0, why: `clickables=${clickables.length} buttonsWithoutAria=${missing}` };
  });
  ok('C7_keyboard_and_aria', a11y.ok, a11y.why);
  // C6: 375px에서 가로 넘침 없음 + #top5가 보인다
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
  await sleep(2000);
  const m = await page.evaluate(() => {
    const el = document.getElementById('top5'); const b = el && el.getBoundingClientRect();
    return { sw: document.documentElement.scrollWidth, vis: !!(b && b.width > 0 && b.height > 0 && b.right <= 376) };
  });
  ok('C6_375px_no_overflow', m.sw <= 375 && m.vis, JSON.stringify(m));
  ok('C1_no_js_errors', errs.length === 0, JSON.stringify(errs.slice(0, 5)));
  const bugs = Object.values(R).filter((x) => !x.pass).length;
  fs.writeFileSync(outPath, JSON.stringify({ url, bugs, checks: R }, null, 1));
  log('bugs ' + bugs + ' ' + JSON.stringify(Object.fromEntries(Object.entries(R).map(([k, v]) => [k, v.pass]))));
};

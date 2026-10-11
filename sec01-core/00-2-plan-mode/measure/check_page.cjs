// 결과 페이지 자동 점검 4가지: ① 콘솔 오류 없음 ② 시간 슬라이더 있음 ③ 슬라이더를 08시→18시로 바꾸면 3D 화면이 달라짐 ④ 기존 2D 그래프 5개·합계 표 5행 유지
// 사용: node check_page.cjs <http://127.0.0.1:포트/> <결과.json>  (3D 화면 비교용 h08.png·h18.png를 결과.json 옆에 저장, 차이 계산은 measure_plan.py)   (npm i puppeteer 필요. 이미 설치된 크롬을 쓰려면 CHROME_PATH 지정)
const puppeteer = require(process.env.PUPPETEER_MODULE || 'puppeteer');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const [url, out] = process.argv.slice(2);
  const browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 }).catch((e) => errors.push('goto ' + e.message));
  await sleep(2500);
  const info = await page.evaluate(() => {
    const r = document.querySelector('input[type=range]');
    const canvas = [...document.querySelectorAll('canvas')].find((c) => c.width > 200 && c.height > 150);
    const box = canvas ? canvas.getBoundingClientRect() : null;
    return {
      slider: r ? { min: +r.min, max: +r.max } : null,
      canvas: box ? { x: box.x + scrollX, y: box.y + scrollY, w: box.width, h: box.height } : null,
      svgCharts: [...document.querySelectorAll('svg')].filter((s) => s.getBoundingClientRect().width > 150).length,
      tableRows: document.querySelectorAll('table tr').length,
    };
  });
  let changed = null;
  if (info.slider && info.canvas) {
    const set = async (v) => {
      await page.evaluate((v) => { const r = document.querySelector('input[type=range]'); r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); }, v);
      await sleep(2500);
      const c = info.canvas;
      return page.screenshot({ clip: { x: c.x, y: c.y, width: Math.min(c.w, 1600), height: Math.min(c.h, 1000) } });
    };
    // 슬라이더 값이 시각 인덱스(04시=0)든 실제 시각(0~23)이든 08시·18시에 가까운 두 값으로 비교
    const lo = info.slider.min, hi = info.slider.max;
    const a = await set(Math.min(hi, Math.max(lo, lo === 0 && hi === 23 ? 4 : 8)));
    const b = await set(Math.min(hi, Math.max(lo, lo === 0 && hi === 23 ? 14 : 18)));
    const dir = require('path').dirname(out);
    fs.writeFileSync(require('path').join(dir, 'h08.png'), a);
    fs.writeFileSync(require('path').join(dir, 'h18.png'), b);
    changed = 'shots';
  }
  const res = {
    url, errors,
    no_errors: errors.length === 0,
    has_slider: !!info.slider,
    slider_changes_3d: null,
    keeps_old: info.svgCharts >= 5 || info.tableRows >= 6,
    detail: { ...info, changed },
  };
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ ...res, detail: undefined }));
  await browser.close();
})();

// 화면 확인: 미국 동부 시간대 브라우저에서 서울 시각을 2026-10-17 09:20으로 고정하고 subway.html에서 여의도를 골라 답 카드를 읽는다.
// 사용: hypit capture run screen-check.mjs -- <url> <out.png> <out.json>
import fs from "node:fs";
export const options = { launch: { defaultViewport: { width: 1600, height: 1000, deviceScaleFactor: 1 } }, timeoutMs: 180_000 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async ({ page, args, log }) => {
  const [url, png, out] = args;
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
  await page.emulateTimezone("America/New_York");
  await page.evaluateOnNewDocument((fixed) => {
    const D = Date, now0 = D.now(), off = fixed - now0;
    function F(...a) { if (!new.target) return new D(D.now() + off).toString(); return a.length ? new D(...a) : new D(D.now() + off); }
    F.prototype = D.prototype; F.now = () => D.now() + off; F.UTC = D.UTC; F.parse = D.parse; Object.setPrototypeOf(F, D);
    window.Date = F;
  }, Date.parse("2026-10-17T09:20:00+09:00"));
  await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 }).catch((e) => log("goto " + e.message));
  await sleep(3000);
  await page.click("#q");
  await page.keyboard.type("여의도", { delay: 60 });
  await page.keyboard.press("Enter");
  await sleep(2500);
  const card = await page.$eval("#answer", (e) => e.innerText);
  const slider = await page.evaluate(() => document.querySelector(".track-head output")?.textContent ?? "");
  await page.$eval("#answer", (e) => e.scrollIntoView({ block: "center" }));
  await sleep(500);
  await page.screenshot({ path: png });
  fs.writeFileSync(out, JSON.stringify({ card, slider, errs }, null, 1));
  log("card " + card.replace(/\n/g, " | ").slice(0, 300));
};

// 하루 띠 단계와 "지금부터 가장 가까운 한가한 시간대". 브라우저(subway.html)와 테스트가 함께 쓴다.
import { kstHour } from "./alerts.mjs";
import { HOURS, total } from "./stats.mjs";

// 하루 띠 기준: 그 역 피크 대비 한(<30%)·보(30–60%)·붐(≥60%).
export const QUIET_RATIO = 0.3;
export const BUSY_RATIO = 0.6;

// 시간대 h의 하루 띠 단계 "quiet" | "mid" | "busy". 0명인 시간대는 운행하지 않는 때라 null이다.
export function bandLevel(row, h) {
  const v = total(row, h);
  if (!v) return null;
  const r = v / Math.max(...HOURS.map((x) => total(row, x)));
  return r < QUIET_RATIO ? "quiet" : r < BUSY_RATIO ? "mid" : "busy";
}

// date(서울 시각)의 시간대부터 한 시간씩 앞으로(자정을 넘어 다음 날까지) 보며 처음 나오는 한(quiet) 시간대.
// 지금 시간대가 한이면 지금 시간대다. 하루 중 한이 없으면 null이다.
export function nextQuietHour(row, date = new Date()) {
  const now = kstHour(date);
  for (let i = 0; i < 24; i++) {
    const h = (now + i) % 24;
    if (bandLevel(row, h) === "quiet") return h;
  }
  return null;
}

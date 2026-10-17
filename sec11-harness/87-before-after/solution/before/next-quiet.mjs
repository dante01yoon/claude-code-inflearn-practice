// 지금(KST)부터 가장 가까운 한가한 시간대. 브라우저(subway.html 답 카드)와 테스트가 함께 쓴다.
// 한가함은 하루 띠의 「한」과 같은 기준이다: 승하차가 그 역 하루 피크의 QUIET_RATIO 미만이고 0명이 아닌 시간대.
// 0명인 시간대(02·03시)는 운행하지 않는 때라서 고르지 않는다. 9월 통계(하루 평균)라 실시간 값이 아니다.

import { kstHour } from "./alerts.mjs";
import { peakRatio, total } from "./stats.mjs";

// 하루 띠: 한 <30% · 보 30–60% · 붐 ≥60%
export const QUIET_RATIO = 0.3;

export const isQuietHour = (row, h) => total(row, h) > 0 && peakRatio(row, h) < QUIET_RATIO;

// 지금 시간대(0시간 뒤)부터 시계 순서로 23시간 뒤까지 살펴 처음 만나는 한가한 시간대를 돌려준다.
// 통계는 하루 평균이라 자정·04시를 넘어도 같은 하루 모양이 되풀이된다고 본다.
// { hour: 0–23, inHours: 몇 시간 뒤(0이면 지금), ratio: 피크 대비 } 또는 한가한 때가 없으면 null.
export function nextQuietHour(row, date = new Date()) {
  const now = kstHour(date);
  for (let inHours = 0; inHours < 24; inHours++) {
    const hour = (now + inHours) % 24;
    if (isQuietHour(row, hour)) return { hour, inHours, ratio: peakRatio(row, hour) };
  }
  return null;
}

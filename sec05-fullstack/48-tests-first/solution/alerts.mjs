// 즐겨찾기 붐빔 알림 판단. 브라우저(subway.html)와 테스트가 함께 쓴다.
// 장소: 실시간 도시데이터의 지금 혼잡도가 사용자가 고른 단계(notify_level) 이상이면 알린다.
// 역: 지금(KST) 시간대의 승하차가 그 역 하루 피크의 notify_ratio% 이상이면 알린다. 9월 통계라 실시간 값이 아니다.
// 기준이 null이면 그 즐겨찾기는 알리지 않는다. 판단은 페이지가 열려 있는 동안에만 한다.

import { CONGEST_LEVELS } from "./citydata-areas.mjs";
import { peakRatio, total } from "./stats.mjs";

// 고를 수 있는 기준. DB check(favorites.notify_level, favorite_stations.notify_ratio)와 맞춘다.
export const PLACE_ALERT_LEVELS = CONGEST_LEVELS.slice(1); // 보통, 약간 붐빔, 붐빔
export const STATION_ALERT_RATIOS = [40, 50, 60, 70, 80, 90];

// 지금 KST 시(0–23). 승하차 시간대(HR_<시>)와 같은 단위다.
export const kstHour = (date = new Date()) => (date.getUTCHours() + 9) % 24;

const rank = (level) => CONGEST_LEVELS.indexOf(level);

// 장소 즐겨찾기 { place_code, notify_level } + 영역 { name, live } → 알림 또는 null
export function placeAlert(fav, area) {
  const now = area?.live?.now;
  if (!fav.notify_level || !now || rank(now.level) < 0 || rank(now.level) < rank(fav.notify_level)) return null;
  return { key: `place:${fav.place_code}`, kind: "place", name: area.name, level: now.level, time: now.time, min: now.min, max: now.max };
}

// 역 즐겨찾기 { station_name, notify_ratio } + 승하차 행(노선 합산) + 지금 시 → 알림 또는 null
export function stationAlert(fav, row, hour) {
  if (!fav.notify_ratio || !row || !(total(row, hour) > 0)) return null;
  const ratio = peakRatio(row, hour);
  if (ratio * 100 < fav.notify_ratio) return null;
  return { key: `station:${fav.station_name}`, kind: "station", name: fav.station_name, hour, ratio, value: total(row, hour) };
}

// 지금 울려야 할 알림 전부. areaOf(code)와 rowOf(역명)가 못 찾으면 그 즐겨찾기는 건너뛴다.
export function activeAlerts({ places = [], stations = [], areaOf, rowOf, hour }) {
  return [
    ...places.map((f) => placeAlert(f, areaOf(f.place_code))),
    ...stations.map((f) => stationAlert(f, rowOf(f.station_name), hour)),
  ].filter(Boolean);
}

// 지난번에 없던 알림만(붐비지 않다가 붐비게 된 것). prevKeys가 null이면 처음 확인이라 아무것도 새로 울리지 않는다.
export const newAlerts = (prevKeys, alerts) => (prevKeys ? alerts.filter((a) => !prevKeys.has(a.key)) : []);

// 같은 장소 알림을 다시 울리기까지 쉬는 시간. 혼잡도가 기준 언저리에서 오르내리면 5분마다 "새로 붐빔"이 되기 때문이다.
export const PLACE_ALERT_COOLDOWN_MS = 60 * 60 * 1000;

// 쉬는 시간 안에 이미 울린 장소 알림을 뺀다. sentAt은 key → 마지막으로 울린 시각(ms). 역 알림은 시간대 단위라 그대로 둔다.
export const throttleAlerts = (alerts, sentAt, now, cooldownMs = PLACE_ALERT_COOLDOWN_MS) =>
  alerts.filter((a) => a.kind !== "place" || !(now - (sentAt.get(a.key) ?? -Infinity) < cooldownMs));

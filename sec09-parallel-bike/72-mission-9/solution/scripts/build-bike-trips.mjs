// 따릉이 대여이력 CSV(git에 없음, 받는 법은 README) → bike.html이 읽는 재생용 JSON.
// 이용자 정보 열은 버리고 대여·반납 대여소 번호와 시각만 남긴다(toTripsJson).
// 인자로 날짜(2026-06-10)를 주면 그날만, 없으면 BIKE_DAYS 중 CSV가 있는 날을 모두 만든다.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { BIKE_COORDS, BIKE_DAYS, bikeCsv, bikeTripsJson, toTripsJson, tripsFromCsv } from "../bike-trips.mjs";

const coords = JSON.parse(readFileSync(BIKE_COORDS, "utf8"));
const asked = process.argv.slice(2);
const days = asked.length ? asked : BIKE_DAYS.map((d) => d.day).filter((day) => existsSync(bikeCsv(day)));
if (!days.length) {
  console.error(`대여이력 CSV가 없습니다: ${BIKE_DAYS.map((d) => bikeCsv(d.day)).join(", ")} (만드는 법은 README)`);
  process.exit(1);
}
for (const day of days) {
  const built = tripsFromCsv(readFileSync(bikeCsv(day)), coords, day);
  const json = JSON.stringify(toTripsJson(built, day));
  writeFileSync(bikeTripsJson(day), json + "\n");
  console.log(`${bikeTripsJson(day)}: ${built.total.toLocaleString("ko-KR")}행 → ${built.trips.length.toLocaleString("ko-KR")}건, ${(json.length / 1e6).toFixed(1)}MB`);
}

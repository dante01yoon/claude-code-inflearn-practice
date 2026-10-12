// 따릉이 대여이력 CSV(git에 없음, 받는 법은 README) → bike.html이 읽는 재생용 JSON.
// 이용자 정보 열은 버리고 대여·반납 대여소 번호와 시각만 남긴다(toTripsJson).
import { readFileSync, writeFileSync } from "node:fs";
import { BIKE_COORDS, BIKE_CSV, BIKE_TRIPS_JSON, toTripsJson, tripsFromCsv } from "../bike-trips.mjs";

const built = tripsFromCsv(readFileSync(BIKE_CSV), JSON.parse(readFileSync(BIKE_COORDS, "utf8")));
const json = JSON.stringify(toTripsJson(built));
writeFileSync(BIKE_TRIPS_JSON, json + "\n");
console.log(`${BIKE_TRIPS_JSON}: ${built.total.toLocaleString("ko-KR")}행 → ${built.trips.length.toLocaleString("ko-KR")}건, ${(json.length / 1e6).toFixed(1)}MB`);

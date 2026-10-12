// 데이터 파일 점검: 역마다 데이터 기준 달(USE_MM)이 올바른지, 0~23시 승차·하차 값이 모두 있는지, 음수가 없는지 확인한다.
// 확장자로 형식을 구분한다. .csv는 열린데이터광장 승하차 CSV(CP949), .json은 CardSubwayTime API 응답이다.
import { readFileSync } from "node:fs";
import { usageMonth } from "../stats.mjs";
import { SUBWAY_CSV, decodeCsv, parseCsv, toSubwayRows } from "../subway-csv.mjs";

const file = process.argv[2] ?? SUBWAY_CSV;
const rows = file.endsWith(".csv")
  ? toSubwayRows(parseCsv(decodeCsv(readFileSync(file))))
  : JSON.parse(readFileSync(file, "utf8")).CardSubwayTime.row;
let problems = 0;
for (const row of rows) {
  const name = `${row.STTN}(${row.SBWY_ROUT_LN_NM})`;
  if (!usageMonth(row)) {
    console.log(`${name} USE_MM: ${row.USE_MM}`);
    problems++;
  }
  for (let h = 0; h < 24; h++) {
    for (const kind of ["ON", "OFF"]) {
      const v = row[`HR_${h}_GET_${kind}_NOPE`];
      if (typeof v !== "number" || !(v >= 0)) {
        console.log(`${name} ${h}시 ${kind}: ${v}`);
        problems++;
      }
    }
  }
}
console.log(`역 ${rows.length}곳, 문제 ${problems}건`);
process.exit(problems ? 1 : 0);

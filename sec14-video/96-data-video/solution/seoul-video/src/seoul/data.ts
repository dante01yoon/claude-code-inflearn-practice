import raw from "../../public/seoul/subway-hourly-202607.json";

// 서울 열린데이터광장 CardSubwayTime 응답에서 서울역(1호선) 행만 사용한다.
// 값은 2026년 7월 한 달 합계이며 가공 없이 그대로 쓴다.
const row = raw.CardSubwayTime.row.find((r) => r.STTN === "서울역");
if (!row) {
  throw new Error("서울역 데이터가 없습니다");
}
const station = row as unknown as Record<string, number | string>;

export type HourData = {
  readonly hour: number;
  readonly on: number;
  readonly off: number;
  readonly total: number;
};

// 운행일 기준 04시 → 익일 03시 순서
const SERVICE_HOURS = [
  4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0,
  1, 2, 3,
];

export const allHours: HourData[] = SERVICE_HOURS.map((hour) => {
  const on = Number(station[`HR_${hour}_GET_ON_NOPE`]);
  const off = Number(station[`HR_${hour}_GET_OFF_NOPE`]);
  return { hour, on, off, total: on + off };
});

// 승하차가 모두 0인 시간대는 막대에서 빼고 각주로 알린다.
export const hours = allHours.filter((h) => h.total > 0);
export const emptyHours = allHours.filter((h) => h.total === 0);

const maxBy = (key: keyof HourData) =>
  hours.reduce((a, b) => (b[key] > a[key] ? b : a));

export const peakTotal = maxBy("total");
export const peakOn = maxBy("on");
export const peakOff = maxBy("off");
export const maxTotal = peakTotal.total;

export const lineName = String(station.SBWY_ROUT_LN_NM);
export const useMonth = String(station.USE_MM);
export const monthLabel = `${useMonth.slice(0, 4)}년 ${Number(useMonth.slice(4))}월`;

export const fmt = (n: number) => n.toLocaleString("ko-KR");
export const hourLabel = (h: number) => `${String(h).padStart(2, "0")}시`;

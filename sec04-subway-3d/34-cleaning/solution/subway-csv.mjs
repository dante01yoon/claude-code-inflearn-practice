// 열린데이터광장 CSV(9월 승하차, 역사마스터) 어댑터. 브라우저(index.html)와 Node(테스트, scripts/)가 함께 쓴다.
// 원본 파일은 고치지 않고, 읽을 때 API JSON 행과 같은 모양으로 바꾼다.

// 앱 기본 데이터(2026년 9월). 저장소 루트 기준 경로다.
export const SUBWAY_CSV = "data/raw/서울시 지하철 호선별 역별 시간대별 승하차 인원 정보.csv";
export const STATION_MASTER_CSV = "data/raw/서울시 역사마스터 정보.csv";

// 바이트(ArrayBuffer·Uint8Array·Buffer) → 문자열. 열린데이터광장 CSV는 CP949라서 euc-kr로 디코딩한다.
export const decodeCsv = (bytes) => new TextDecoder("euc-kr").decode(bytes);

// CSV 문자열 → 머리글을 키로 하는 객체 배열.
// 열린데이터광장 CSV는 모든 필드가 큰따옴표로 감싸져 있고 필드 안에 쉼표·따옴표가 없다.
export function parseCsv(text) {
  const split = (line) => line.slice(1, -1).split('","');
  const [header, ...lines] = text.replace(/^﻿/, "").trim().split(/\r?\n/);
  const keys = split(header);
  return lines.map((line, i) => {
    const values = split(line);
    if (values.length !== keys.length) throw new Error(`${i + 2}번째 줄: 필드 ${values.length}개(머리글 ${keys.length}개)`);
    return Object.fromEntries(keys.map((k, j) => [k, values[j]]));
  });
}

// URL에서 CSV를 받아 객체 배열로 돌려준다(브라우저용).
export async function fetchCsv(url) {
  const res = await fetch(encodeURI(url));
  if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
  return parseCsv(decodeCsv(await res.arrayBuffer()));
}

// 숫자만 있는 문자열만 숫자로 바꾼다. 빈 값이나 이상한 값은 NaN이 되어 check-data에서 걸린다.
const toCount = (v) => (/^\d+$/.test(v) ? Number(v) : NaN);

// "04시-05시 승차인원" → HR_4_GET_ON_NOPE. 23시 열은 "23시-24시"로 끝난다.
const HOUR_COLUMN = /^(\d{2})시-\d{2}시 (승차|하차)인원$/;

// 승하차 CSV 레코드 → API JSON 행 모양(USE_MM, SBWY_ROUT_LN_NM, STTN, JOB_YMD, HR_<시>_GET_<ON|OFF>_NOPE).
export function toSubwayRows(records) {
  return records.map((rec) => {
    const row = { USE_MM: rec["사용월"], SBWY_ROUT_LN_NM: rec["호선명"], STTN: rec["지하철역"], JOB_YMD: rec["작업일자"] };
    for (const [key, value] of Object.entries(rec)) {
      const m = HOUR_COLUMN.exec(key);
      if (m) row[`HR_${Number(m[1])}_GET_${m[2] === "승차" ? "ON" : "OFF"}_NOPE`] = toCount(value);
    }
    return row;
  });
}

// 이름은 같지만 서로 다른 역. 환승역으로 합치지 않는다.
// 양평: 5호선(서울 영등포구)과 중앙선(경기 양평군)은 약 54km 떨어져 있다.
const SAME_NAME_DIFFERENT_STATIONS = new Set(["양평"]);

// 같은 역명의 노선별 행을 합친 행을 만든다(환승역 합산). 노선이 하나인 역도 같은 모양으로 돌려준다.
// 합친 행: STTN, USE_MM, LINES(노선 배열), SBWY_ROUT_LN_NM("2호선·4호선"), HR_* 합계.
export function mergeStations(rows) {
  const groups = new Map();
  for (const row of rows) {
    const key = SAME_NAME_DIFFERENT_STATIONS.has(row.STTN) ? `${row.STTN}\t${row.SBWY_ROUT_LN_NM}` : row.STTN;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.values()].map((members) => {
    const merged = { USE_MM: members[0].USE_MM, STTN: members[0].STTN, LINES: members.map((r) => r.SBWY_ROUT_LN_NM) };
    merged.SBWY_ROUT_LN_NM = merged.LINES.join("·");
    for (const key of Object.keys(members[0])) {
      if (key.startsWith("HR_")) merged[key] = members.reduce((a, r) => a + r[key], 0);
    }
    return merged;
  });
}

// 승하차 CSV의 역명 → 역사마스터의 역사명. 부역명 괄호가 다르거나 역 이름이 바뀐 곳이다.
export const STATION_NAME_ALIASES = {
  "낙성대(강감찬)": "낙성대",
  "동대문역사문화공원(DDP)": "동대문역사문화공원",
  "삼각지(전쟁기념관)": "삼각지",
  "숙대입구(서울시교육청)": "숙대입구(갈월)",
  "하남시청(덕풍?신장)": "하남시청(덕풍-신장)", // 승하차 CSV 원본에 '?'가 그대로 들어 있다
  "상봉": "상봉(시외버스터미널)",
  "용마산(용마폭포공원)": "용마산",
  "자양(뚝섬한강공원)": "뚝섬유원지", // 역 이름이 바뀌었다
  "마곡나루(서울식물원)": "마곡나루",
  "평택지제": "지제", // 역 이름이 바뀌었다
  "한국항공대": "화전", // 역 이름이 바뀌었다
};

// 승하차 CSV의 호선명 → 역사마스터의 호선. 같은 역명 안에서 노선별 지점을 고를 때 쓴다.
const LINE_ALIASES = {
  "경의선": "경의중앙선",
  "공항철도 1호선": "공항철도1호선",
  "9호선2~3단계": "9호선(연장)",
};

const mean = (points) => [0, 1].map((k) => points.reduce((a, p) => a + p[k], 0) / points.length);

// 역사마스터 레코드로 좌표 찾기 함수를 만든다. coordOf(row) → [위도, 경도] 또는 못 찾으면 null.
// 노선이 같은 지점을 먼저 쓰고, 없으면 같은 역명 지점들의 평균을 쓴다(창동 경원선 → 4호선 지점 등).
// 합친 행(LINES)은 노선별 좌표의 평균이다.
export function stationLocator(masterRecords) {
  const byName = new Map();
  for (const rec of masterRecords) {
    if (!byName.has(rec["역사명"])) byName.set(rec["역사명"], []);
    byName.get(rec["역사명"]).push({ line: rec["호선"], point: [Number(rec["위도"]), Number(rec["경도"])] });
  }
  const locate = (name, line) => {
    const sites = byName.get(STATION_NAME_ALIASES[name] ?? name);
    if (!sites) return null;
    const sameLine = sites.filter((s) => s.line === (LINE_ALIASES[line] ?? line));
    return mean((sameLine.length ? sameLine : sites).map((s) => s.point));
  };
  return (row) => {
    const points = (row.LINES ?? [row.SBWY_ROUT_LN_NM]).map((line) => locate(row.STTN, line));
    return points.every(Boolean) ? mean(points) : null;
  };
}

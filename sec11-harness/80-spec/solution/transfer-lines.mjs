// 환승역 노선 묶기. 브라우저(subway.html, 답 카드 노선 칩)와 테스트가 함께 쓴다.
// CSV 호선명은 운영 기관 기준(경부선·경의선·공항철도 1호선 등)이라 승객이 아는 노선으로 묶는다.
// 원본 행(toSubwayRows 결과)은 바꾸지 않는다.

// 경원선 중 경의중앙선으로 다니는 역(CSV 지하철역 이름 그대로). 그 밖의 경원선 역은 1호선이다.
export const GYEONGUI_JUNGANG_ON_GYEONGWON = new Set([
  "서빙고", "옥수", "응봉", "한남", "이촌(국립중앙박물관)", "왕십리(성동구청)", "청량리(서울시립대입구)",
]);

// CSV 호선명 → 묶은 노선. 여기 없는 호선명은 그대로 쓴다.
const PASSENGER_LINES = {
  경부선: "1호선", 경인선: "1호선", 장항선: "1호선",
  경의선: "경의중앙선", 중앙선: "경의중앙선",
  일산선: "3호선",
  과천선: "4호선", 안산선: "4호선",
  "9호선2~3단계": "9호선",
  분당선: "수인분당선", 수인선: "수인분당선",
  "공항철도 1호선": "공항철도",
};

export function passengerLine(row) {
  const line = row.SBWY_ROUT_LN_NM;
  if (line === "경원선") return GYEONGUI_JUNGANG_ON_GYEONGWON.has(row.STTN) ? "경의중앙선" : "1호선";
  return PASSENGER_LINES[line] ?? line;
}

// 같은 역의 행들 → 묶은 노선별 행(처음 나온 순서). 모양은 API 행과 같고 HR_*는 합계다.
export function groupByLine(rows) {
  const groups = new Map();
  for (const row of rows) {
    const line = passengerLine(row);
    const group = groups.get(line);
    if (!group) {
      groups.set(line, { ...row, SBWY_ROUT_LN_NM: line });
      continue;
    }
    for (const key of Object.keys(row)) {
      if (key.startsWith("HR_")) group[key] += row[key];
    }
  }
  return [...groups.values()];
}

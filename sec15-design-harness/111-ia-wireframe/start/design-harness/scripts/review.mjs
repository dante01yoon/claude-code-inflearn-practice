#!/usr/bin/env node
// Creates review.json: what a person must judge after the machine lint passes.
// Scores are 0-2 (0 = 문제, 1 = 보통, 2 = 좋음). "suggested" is the critic agent's guess;
// "score" is only ever filled by a person.
import fs from "node:fs";
import { exists, paths, projectName } from "./lib.mjs";

const ITEMS = [
  ["hierarchy", "와이어프레임 우선순위 1번 영역이 실제로 가장 먼저 눈에 들어오는가"],
  ["primary-action", "화면마다 주요 행동이 하나로 분명한가"],
  ["status", "시스템 상태가 보이는가: 로딩·빈·오류가 무엇이 일어났고 무엇을 하면 되는지 말하는가 (Nielsen 1, 9)"],
  ["real-world", "사용자 말로 쓰였는가: 실제 대여소명·단위(대, 개) 그대로인가 (Nielsen 2)"],
  ["consistency", "같은 요소가 화면마다 같은 모양·위치인가 (Nielsen 4)"],
  ["control", "되돌아가기·다시 시도가 항상 가능한가 (Nielsen 3)"],
  ["freshness", "실시간처럼 보이는 숫자에 기준 시각·출처가 보이는가"],
  ["affordance", "누를 수 있는 것이 누를 수 있어 보이는가(화살표, 눌림 상태)"],
  ["minimal", "필요 없는 장식·정보가 없는가 (Nielsen 8)"],
  ["tone", "카피 톤이 copy.json의 tone과 맞는가"],
  ["not-generic", "기본값 같은 인상인가: 똑같은 둥근 카드+회색 그림자, 대문자 라벨, 의미 없는 숫자 표식 등이 없는가"],
  ["brand", "서비스 성격(공공자전거, 출근길)에 맞는 인상인가"],
];
const p = paths(projectName());
if (exists(p.review) && !process.argv.includes("--force")) {
  console.log("review.json이 이미 있습니다 (--force로 다시 만듦)");
} else {
  const checklist = ITEMS.map(([id, question]) => ({ id, question, suggested: null, score: null, note: "" }));
  fs.writeFileSync(p.review, JSON.stringify({ reviewer: null, checklist, findings: [] }, null, 2) + "\n");
  console.log(`review.json 생성: 항목 ${ITEMS.length}개, 만점 ${ITEMS.length * 2}`);
}

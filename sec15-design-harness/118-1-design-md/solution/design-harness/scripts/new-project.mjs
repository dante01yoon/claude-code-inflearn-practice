#!/usr/bin/env node
// Start a design in the current project: design-harness new <이름>
// Creates work/<이름>/PRD.md with the sections the prd gate checks, and marks it active.
import fs from "node:fs";
import path from "node:path";
import { ROOT, paths } from "./lib.mjs";

const name = process.argv[2];
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error("사용법: design-harness new <이름>  (영문 소문자·숫자·-)");
  process.exit(1);
}
const p = paths(name);
fs.mkdirSync(p.work, { recursive: true });
if (fs.existsSync(p.prd)) console.log(`이미 있음: ${path.relative(ROOT, p.prd)}`);
else {
  fs.writeFileSync(
    p.prd,
    `# ${name}

## 목표

## 사용자

## 기능
- F1:

## 데이터 출처
<!-- 실존 서비스·공개 데이터만. 제공처, 데이터셋 ID·URL, 이용 허락 조건을 적는다. -->

## 범위 밖
`,
  );
  console.log(`만듦: ${path.relative(ROOT, p.prd)}`);
}
fs.writeFileSync(path.join(ROOT, "work", ".active"), name + "\n");
console.log(`활성 프로젝트: ${name}`);

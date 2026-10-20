// DanteRawShort의 handoff 파일을 out/handoff/에 만든다. 영상은 따로 렌더한다.
//   node scripts/dante-handoff.mts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { buildTimeline } from "../src/dante/rawCutTimeline.ts";
import type { RawCut } from "../src/dante/rawCutTimeline.ts";

const OUT = "out/handoff";
const cut: RawCut = JSON.parse(readFileSync("src/dante/rawCut.json", "utf8"));
const { segments, durationInFrames, cues } = buildTimeline(cut);
const fps = cut.fps;

const pad = (n: number, w = 2) => String(n).padStart(w, "0");
const srtTime = (ms: number) => {
  const t = Math.round(ms);
  return `${pad(Math.floor(t / 3600000))}:${pad(Math.floor(t / 60000) % 60)}:${pad(Math.floor(t / 1000) % 60)},${pad(t % 1000, 3)}`;
};
// HH:MM:SS:FF (30fps non-drop)
const tc = (frames: number) =>
  `${pad(Math.floor(frames / fps / 3600))}:${pad(Math.floor(frames / fps / 60) % 60)}:${pad(Math.floor(frames / fps) % 60)}:${pad(frames % fps)}`;
const sec = (frames: number) => (frames / fps).toFixed(2);

mkdirSync(OUT, { recursive: true });

// 1) 자막: 쇼츠(자막 없는 세로 영상) 타임라인 기준
const srt = cues
  .map((c, i) => {
    const text = c.lines.map((l) => l.map((w) => w.text).join(" ")).join("\n");
    return `${i + 1}\n${srtTime(c.startMs)} --> ${srtTime(c.endMs)}\n${text}\n`;
  })
  .join("\n");
writeFileSync(`${OUT}/dante-raw-short.srt`, srt);

// 2) 구간 목록 CSV (엑셀·시트에서 열기 쉽게 BOM 포함)
const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
const csv = [
  ["순서", "구간", "원본 시작", "원본 끝", "원본 시작(초)", "원본 끝(초)", "쇼츠 시작", "쇼츠 끝", "길이(초)", "고른 이유"],
  ...segments.map((s, i) => [
    i + 1,
    s.label,
    tc(s.in),
    tc(s.out),
    sec(s.in),
    sec(s.out),
    tc(s.at),
    tc(s.at + s.out - s.in),
    sec(s.out - s.in),
    s.why,
  ]),
]
  .map((row) => row.map(csvCell).join(","))
  .join("\r\n");
writeFileSync(`${OUT}/segments.csv`, "﻿" + csv + "\r\n");

// 3) 프리미어용 EDL(CMX3600): raw.mp4에 다시 연결하면 가로 원본으로 같은 컷을 복원할 수 있다
const edl = [
  "TITLE: DANTE RAW SHORT",
  "FCM: NON-DROP FRAME",
  "",
  ...segments.flatMap((s, i) => [
    `${pad(i + 1, 3)}  AX       AV    C        ${tc(s.in)} ${tc(s.out)} ${tc(s.at)} ${tc(s.at + s.out - s.in)}`,
    "* FROM CLIP NAME: raw.mp4",
    "",
  ]),
].join("\r\n");
writeFileSync(`${OUT}/dante-raw-short.edl`, edl);

// 4) 사람이 읽는 요약
const md = `# 단테 쇼츠 handoff

원본: \`${cut.source}\` (78.2초, 1920x1080 30fps) → 쇼츠 ${sec(durationInFrames)}초 (${durationInFrames}프레임, 1080x1920 30fps)

## 고른 구간

| # | 구간 | 원본 | 쇼츠 | 길이 | 고른 이유 |
|---|---|---|---|---|---|
${segments
  .map(
    (s, i) =>
      `| ${i + 1} | ${s.label} | ${sec(s.in)}–${sec(s.out)}s | ${sec(s.at)}–${sec(s.at + s.out - s.in)}s | ${sec(s.out - s.in)}s | ${s.why} |`,
  )
  .join("\n")}

## 파일

- \`dante-raw-short-clean.mp4\` — 자막·훅 문구·진행 바 없는 세로 영상. 음량 -14 LUFS(True Peak -1 dB)로 맞춤
- \`dante-raw-short.srt\` — 위 영상 타임라인 기준 자막 (CapCut: 텍스트 → 자막 가져오기 / 프리미어: 파일 가져오기 후 캡션 트랙에 올리기)
- \`segments.csv\` — 구간 목록 (타임코드는 30fps HH:MM:SS:FF)
- \`dante-raw-short.edl\` — 프리미어용 EDL. 가져온 뒤 클립을 \`raw.mp4\`에 다시 연결하면 가로 원본으로 같은 컷이 복원됨
`;
writeFileSync(`${OUT}/README.md`, md);

console.log(`${OUT}/ 에 srt(${cues.length}큐)·segments.csv·edl·README.md 작성, 총 ${sec(durationInFrames)}초`);

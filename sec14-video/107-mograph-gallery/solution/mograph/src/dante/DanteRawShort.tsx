import React from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions, CLAMP, Hook, ProgressBar, YELLOW } from "./DanteShort";
import type { HookWord } from "./DanteShort";
import cut from "./rawCut.json";
import { buildTimeline } from "./rawCutTimeline";
import type { Segment } from "./rawCutTimeline";

// raw.mp4(78.2초)에서 고른 구간을 이어 붙인 쇼츠. 구간·자막 단어 시각은 rawCut.json 하나에서 관리하고,
// handoff용 srt·구간 목록(scripts/dante-handoff.mts)도 같은 파일·같은 계산(rawCutTimeline)으로 만든다.
const { segments: SEGMENTS, durationInFrames, cues: CUES } = buildTimeline(cut);
export const DANTE_RAW_FPS = cut.fps;
export const DANTE_RAW_FRAMES = durationInFrames;

// 16:9 원본을 가로 1080에 맞추면 높이 607.5. raw.mp4에는 구워진 자막이 없어서 자르지 않는다
const VIDEO_H = 1080 * (9 / 16);
const VIDEO_TOP = (1920 - VIDEO_H) / 2;
const CAPTION_TOP = VIDEO_TOP + VIDEO_H + 56;

const HOOK: HookWord[] = [
  { text: "단테,", size: 110, y: -150, from: [-600, 0], rot: -5, color: "#FFFFFF" },
  { text: "벽돌을", size: 100, y: -20, from: [600, 0], rot: 3, color: "#FFFFFF" },
  { text: "넘을까?", size: 150, y: 135, from: [0, 300], rot: -3, color: YELLOW, mark: true },
];

const SRC = staticFile("dante/raw.mp4");
// 컷 경계에서 '틱' 소리가 나지 않게 구간 앞뒤 2프레임만 음량을 올리고 내린다
const FADE = 2;

const SegmentClip: React.FC<{ seg: Segment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const len = seg.out - seg.in;
  const volume = interpolate(frame, [0, FADE, len - FADE, len], [0, 1, 1, 0], CLAMP);
  return (
    <>
      {/* 위아래 빈 공간은 같은 장면을 크게 흐리게 깔아서 채운다 */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Video
          src={SRC}
          trimBefore={seg.in}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%", filter: "blur(40px) brightness(0.45)", scale: 1.3 }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: VIDEO_TOP,
          width: 1080,
          height: VIDEO_H,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <Video src={SRC} trimBefore={seg.in} volume={volume} style={{ width: 1080, height: VIDEO_H }} />
      </div>
    </>
  );
};

// clean: CapCut·프리미어 handoff용. 자막·훅·진행 바 없이 세로 화면과 소리만 남긴다
export const DanteRawShort: React.FC<{ clean: boolean }> = ({ clean }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0B10" }}>
      {SEGMENTS.map((seg) => (
        <Sequence key={seg.in} from={seg.at} durationInFrames={seg.out - seg.in} premountFor={fps}>
          <SegmentClip seg={seg} />
        </Sequence>
      ))}
      {clean ? null : (
        <>
          <Hook words={HOOK} top={VIDEO_TOP / 2} />
          <Captions cues={CUES} top={CAPTION_TOP} />
          <ProgressBar />
        </>
      )}
    </AbsoluteFill>
  );
};

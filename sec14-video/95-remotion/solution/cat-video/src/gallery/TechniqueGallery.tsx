import type React from "react";
import { AbsoluteFill, Series } from "remotion";
import { juaFont } from "../fonts";
import { KenBurns, Pan, Parallax, PullOut, PushIn, RackFocus, WhipPan } from "./camera";
import { BeatSync, ReadingHold, ScreenStudioZoom, SpringEntrance } from "./motion";
import { FloodTransition, IrisTransition, MatchCut, MorphTransition } from "./transitions";

export const TECHNIQUE_FRAMES = 105;

const TECHNIQUES: { ko: string; en: string; Component: React.FC }[] = [
  { ko: "푸시 인", en: "Push-in", Component: PushIn },
  { ko: "풀 아웃", en: "Pull-out", Component: PullOut },
  { ko: "팬", en: "Pan", Component: Pan },
  { ko: "켄 번스", en: "Ken Burns", Component: KenBurns },
  { ko: "패럴랙스", en: "Parallax", Component: Parallax },
  { ko: "휩 팬", en: "Whip Pan", Component: WhipPan },
  { ko: "랙 포커스", en: "Rack Focus", Component: RackFocus },
  { ko: "스프링 등장", en: "Spring Entrance", Component: SpringEntrance },
  { ko: "리딩 홀드", en: "Reading Hold", Component: ReadingHold },
  { ko: "매치 컷", en: "Match Cut", Component: MatchCut },
  { ko: "아이리스 전환", en: "Iris Transition", Component: IrisTransition },
  { ko: "플러드 전환", en: "Flood Transition", Component: FloodTransition },
  { ko: "모핑 전환", en: "Morph Transition", Component: MorphTransition },
  { ko: "스크린 스튜디오 줌", en: "Screen Studio Zoom", Component: ScreenStudioZoom },
  { ko: "비트 싱크", en: "Beat Sync", Component: BeatSync },
];

export const GALLERY_FRAMES = TECHNIQUES.length * TECHNIQUE_FRAMES;

const NameTag: React.FC<{ readonly index: number; readonly ko: string; readonly en: string }> = ({ index, ko, en }) => (
  <div
    style={{
      position: "absolute",
      left: 40,
      top: 36,
      padding: "12px 30px",
      borderRadius: 20,
      background: "rgba(20,10,40,0.78)",
      border: "2px solid rgba(255,207,122,0.55)",
      fontFamily: juaFont,
      fontSize: 56,
      lineHeight: 1.2,
      color: "#fff6e0",
      whiteSpace: "pre",
    }}
  >
    <span style={{ color: "#ffcf7a" }}>{String(index + 1).padStart(2, "0")}</span> {ko} · {en}
  </div>
);

export const TechniqueGallery: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#1a0f2e" }}>
    <Series>
      {TECHNIQUES.map(({ ko, en, Component }, i) => (
        <Series.Sequence key={en} name={`${String(i + 1).padStart(2, "0")} ${en}`} durationInFrames={TECHNIQUE_FRAMES}>
          <Component />
          <NameTag index={i} ko={ko} en={en} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);

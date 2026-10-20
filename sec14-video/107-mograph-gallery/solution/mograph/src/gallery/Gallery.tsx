import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TechniqueLabel } from "./TechniqueLabel";
import { C, SCENE_FRAMES } from "./theme";
import { KineticTypo } from "./scenes/KineticTypo";
import { WordHighlight } from "./scenes/WordHighlight";
import { Typewriter } from "./scenes/Typewriter";
import { MaskReveal } from "./scenes/MaskReveal";
import { LineDraw } from "./scenes/LineDraw";
import { CountUp } from "./scenes/CountUp";
import { ChartGrowth } from "./scenes/ChartGrowth";
import { Stagger } from "./scenes/Stagger";
import { PathFollow } from "./scenes/PathFollow";
import { LowerThird } from "./scenes/LowerThird";
import { Highlighter } from "./scenes/Highlighter";
import { Callout } from "./scenes/Callout";
import { ProgressBar } from "./scenes/ProgressBar";
import { SplitCompare } from "./scenes/SplitCompare";
import { ChatMockup } from "./scenes/ChatMockup";

const SCENES = [
  { ko: "키네틱 타이포", en: "Kinetic Typography", Comp: KineticTypo },
  { ko: "단어 하이라이트 자막", en: "Word Highlight Captions", Comp: WordHighlight },
  { ko: "타자기", en: "Typewriter", Comp: Typewriter },
  { ko: "마스크 리빌", en: "Mask Reveal", Comp: MaskReveal },
  { ko: "선 그리기", en: "Line Drawing", Comp: LineDraw },
  { ko: "숫자 카운트업", en: "Number Count-up", Comp: CountUp },
  { ko: "차트 성장", en: "Chart Growth", Comp: ChartGrowth },
  { ko: "순차 등장", en: "Staggered Entrance", Comp: Stagger },
  { ko: "경로 따라가기", en: "Path Following", Comp: PathFollow },
  { ko: "이름표", en: "Lower Third", Comp: LowerThird },
  { ko: "형광펜 강조", en: "Highlighter", Comp: Highlighter },
  { ko: "콜아웃", en: "Callout", Comp: Callout },
  { ko: "진행 바", en: "Progress Bar", Comp: ProgressBar },
  { ko: "화면 분할 비교", en: "Split-screen Comparison", Comp: SplitCompare },
  { ko: "UI 목업", en: "UI Mockup", Comp: ChatMockup },
];

export const GALLERY_FRAMES = SCENES.length * SCENE_FRAMES;

export const Gallery: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.night }}>
      {SCENES.map(({ ko, Comp }, i) => (
        <Sequence
          key={ko}
          name={`${String(i + 1).padStart(2, "0")} ${ko}`}
          from={i * SCENE_FRAMES}
          durationInFrames={SCENE_FRAMES}
        >
          <Comp />
        </Sequence>
      ))}
      <TechniqueLabel techniques={SCENES} />
    </AbsoluteFill>
  );
};

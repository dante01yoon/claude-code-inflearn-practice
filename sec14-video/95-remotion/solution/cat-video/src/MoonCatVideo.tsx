import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { useVideoConfig } from "remotion";
import { AlleyScene } from "./scenes/AlleyScene";
import { FestivalScene } from "./scenes/FestivalScene";
import { PlazaScene } from "./scenes/PlazaScene";

export const MoonCatVideo = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Alley" durationInFrames={110}>
        <AlleyScene style={{ backgroundColor: "#1a0f2e" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 0.5 * fps })}
      />
      <TransitionSeries.Sequence name="Plaza" durationInFrames={110}>
        <PlazaScene style={{ backgroundColor: "#1a0f2e" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 0.5 * fps })}
      />
      <TransitionSeries.Sequence name="Festival" durationInFrames={110}>
        <FestivalScene style={{ backgroundColor: "#1a0f2e" }} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

import { Track, useVideoConfig } from "remotion";
import { HourlyChartScene } from "./HourlyChartScene";
import { IntroScene } from "./IntroScene";
import { PeakScene } from "./PeakScene";

export const SeoulDay = () => {
  const { fps } = useVideoConfig();

  return (
    <Track name="Scenes">
      <IntroScene
        name="Intro"
        durationInFrames={2.5 * fps}
        style={{ backgroundColor: "#111417" }}
      />
      <HourlyChartScene
        name="Hourly chart"
        from={2.5 * fps}
        durationInFrames={8.5 * fps}
        style={{ backgroundColor: "#111417" }}
      />
      <PeakScene
        name="Peak"
        from={11 * fps}
        durationInFrames={4 * fps}
        style={{ backgroundColor: "#111417" }}
      />
    </Track>
  );
};

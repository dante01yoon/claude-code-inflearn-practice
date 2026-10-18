import { Composition, Folder } from "remotion";
import { MyComposition } from "./Composition";
import { HourlyChartScene } from "./seoul/HourlyChartScene";
import { IntroScene } from "./seoul/IntroScene";
import { PeakScene } from "./seoul/PeakScene";
import { SeoulDay } from "./seoul/SeoulDay";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="SeoulDay"
        component={SeoulDay}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
      <Folder name="SeoulScenes">
        <Composition
          id="SeoulIntro"
          component={IntroScene}
          durationInFrames={75}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ style: { backgroundColor: "#111417" } }}
        />
        <Composition
          id="SeoulHourlyChart"
          component={HourlyChartScene}
          durationInFrames={255}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ style: { backgroundColor: "#111417" } }}
        />
        <Composition
          id="SeoulPeak"
          component={PeakScene}
          durationInFrames={120}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ style: { backgroundColor: "#111417" } }}
        />
      </Folder>
    </>
  );
};

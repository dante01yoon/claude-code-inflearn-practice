import { Composition } from "remotion";
import { DanteRawShort, DANTE_RAW_FPS, DANTE_RAW_FRAMES } from "./dante/DanteRawShort";
import { DanteShort, DANTE_FPS, DANTE_FRAMES } from "./dante/DanteShort";
import { DataShort, DATA_FPS, DATA_FRAMES } from "./data/DataShort";
import { Gallery, GALLERY_FRAMES } from "./gallery/Gallery";
import { StoryShort, STORY_FPS, STORY_FRAMES } from "./story/StoryShort";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Gallery"
        component={Gallery}
        durationInFrames={GALLERY_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DanteShort"
        component={DanteShort}
        durationInFrames={DANTE_FRAMES}
        fps={DANTE_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DanteRawShort"
        component={DanteRawShort}
        defaultProps={{ clean: false }}
        durationInFrames={DANTE_RAW_FRAMES}
        fps={DANTE_RAW_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DanteRawShortClean"
        component={DanteRawShort}
        defaultProps={{ clean: true }}
        durationInFrames={DANTE_RAW_FRAMES}
        fps={DANTE_RAW_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DataShort"
        component={DataShort}
        durationInFrames={DATA_FRAMES}
        fps={DATA_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="StoryShort"
        component={StoryShort}
        durationInFrames={STORY_FRAMES}
        fps={STORY_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

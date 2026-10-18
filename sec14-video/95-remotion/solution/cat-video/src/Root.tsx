import { Composition, Folder } from "remotion";
import { Caption } from "./elements/Caption";
import { LanternCat } from "./elements/LanternCat";
import { Rain } from "./elements/Rain";
import { Sparkles } from "./elements/Sparkles";
import { GALLERY_FRAMES, TechniqueGallery } from "./gallery/TechniqueGallery";
import { MoonCatVideo } from "./MoonCatVideo";
import { AlleyScene } from "./scenes/AlleyScene";
import { FestivalScene } from "./scenes/FestivalScene";
import { PlazaScene } from "./scenes/PlazaScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MoonCat"
        component={MoonCatVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TechniqueGallery"
        component={TechniqueGallery}
        durationInFrames={GALLERY_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Folder name="Scenes">
        <Composition
          id="AlleyScene"
          component={AlleyScene}
          durationInFrames={110}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ style: { backgroundColor: "#1a0f2e" } }}
        />
        <Composition
          id="PlazaScene"
          component={PlazaScene}
          durationInFrames={110}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ style: { backgroundColor: "#1a0f2e" } }}
        />
        <Composition
          id="FestivalScene"
          component={FestivalScene}
          durationInFrames={110}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ style: { backgroundColor: "#1a0f2e" } }}
        />
      </Folder>
      <Folder name="Elements">
        <Composition
          id="LanternCat"
          component={LanternCat}
          durationInFrames={90}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ size: 820, style: { left: 680, top: 160 } }}
        />
        <Composition
          id="Caption"
          component={Caption}
          durationInFrames={90}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            children: "달빛 고양이 야시장",
            style: { left: 160, top: 420, fontSize: 120 },
          }}
        />
        <Composition
          id="Rain"
          component={Rain}
          durationInFrames={90}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ drops: 140 }}
        />
        <Composition
          id="Sparkles"
          component={Sparkles}
          durationInFrames={90}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ count: 45, color: "#ffcf7a" }}
        />
      </Folder>
    </>
  );
};

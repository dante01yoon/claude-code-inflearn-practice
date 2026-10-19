import {
  CanvasImage,
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption } from "../elements/Caption";
import { LanternCat } from "../elements/LanternCat";
import { Sparkles } from "../elements/Sparkles";

const FestivalSceneInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <CanvasImage
        name="Background"
        src={staticFile("mooncat/backgrounds/256-rooftop-festival-square.png")}
        width={2112}
        height={1408}
        style={{
          position: "absolute",
          left: -96,
          top: -120,
          transformOrigin: "50% 30%",
          scale: interpolate(frame, [0, 3.7 * fps], [1, 1.1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <Interactive.Div
        name="Shade"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(25,10,45,0) 0%, rgba(25,10,45,0.15) 50%, rgba(25,10,45,0.55) 100%)",
        }}
      />
      <Sparkles name="Sparkles" count={45} color="#ffcf7a" />
      <CanvasImage
        name="Moon gem"
        src={staticFile("mooncat/props/262-moon-gem.png")}
        width={230}
        height={230}
        style={{
          position: "absolute",
          left: 790,
          top: 150 + Math.sin((frame / fps) * 2.5) * 10,
          translate: interpolate(frame, [0.4 * fps, 1.8 * fps], ["0px 380px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          rotate: `${Math.sin((frame / fps) * 1.8) * 8}deg`,
          filter: "drop-shadow(0 0 40px rgba(190,170,255,0.9))",
        }}
      />
      <CanvasImage
        name="Firefly"
        src={staticFile("mooncat/characters/054_lantern_firefly_companion.png")}
        width={180}
        height={197}
        style={{
          position: "absolute",
          left: 620 + Math.cos((frame / fps) * 2.2) * 320,
          top: 420 + Math.sin((frame / fps) * 2.2) * 90,
          filter: "drop-shadow(0 0 26px rgba(255,200,90,0.7))",
        }}
      />
      <LanternCat
        name="Lantern cat"
        size={800}
        style={{
          left: 400,
          top: 300,
          transformOrigin: "50% 100%",
          scale: interpolate(frame, [0, 0.8 * fps], [0.92, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Caption
        name="Ending title"
        style={{
          right: 150,
          top: 360,
          fontSize: 118,
          textAlign: "right",
          lineHeight: 1.15,
          opacity: interpolate(frame, [1 * fps, 1.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [1 * fps, 2 * fps], ["0px 40px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {"오늘 밤도\n불을 밝혀요"}
      </Caption>
      <Interactive.Div
        name="Fade out"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#0d0618",
          opacity: interpolate(frame, [3 * fps, 3.65 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </>
  );
};

export const FestivalScene = Interactive.create({
  Component: FestivalSceneInner,
  layout: "absolute-fill",
});

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
import { Rain } from "../elements/Rain";

const AlleySceneInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <CanvasImage
        name="Background"
        src={staticFile("mooncat/backgrounds/246-rainy-lantern-alley.png")}
        width={2112}
        height={1408}
        style={{
          position: "absolute",
          left: -96,
          top: -164,
          scale: interpolate(frame, [0, 3.7 * fps], [1, 1.08], {
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
            "linear-gradient(90deg, rgba(25,10,45,0.15) 0%, rgba(25,10,45,0.1) 45%, rgba(25,10,45,0.6) 100%)",
        }}
      />
      <Rain name="Rain" drops={140} />
      <CanvasImage
        name="Firefly"
        src={staticFile("mooncat/characters/054_lantern_firefly_companion.png")}
        width={220}
        height={241}
        style={{
          position: "absolute",
          left: 820,
          top: 300 + Math.sin((frame / fps) * 3) * 22,
          rotate: `${Math.sin((frame / fps) * 2.2) * 6}deg`,
          translate: interpolate(frame, [0.3 * fps, 2.4 * fps], ["-700px 200px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }),
          filter: "drop-shadow(0 0 30px rgba(255,200,90,0.7))",
        }}
      />
      <LanternCat
        name="Lantern cat"
        size={820}
        style={{
          left: 230,
          top:
            300 -
            Math.abs(Math.sin(frame * 0.42)) *
              interpolate(frame, [0, 2.2 * fps], [20, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
          translate: interpolate(frame, [0, 2.2 * fps], ["-900px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }),
        }}
      />
      <Caption
        name="Title"
        style={{
          right: 140,
          top: 230,
          fontSize: 132,
          textAlign: "right",
          lineHeight: 1.1,
          opacity: interpolate(frame, [0.8 * fps, 1.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0.8 * fps, 1.8 * fps], ["0px 40px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {"달빛 고양이\n야시장"}
      </Caption>
      <Caption
        name="Subtitle"
        style={{
          right: 146,
          top: 540,
          fontSize: 54,
          color: "#ffd99a",
          opacity: interpolate(frame, [1.4 * fps, 2.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        비 내리는 등불 골목에서
      </Caption>
    </>
  );
};

export const AlleyScene = Interactive.create({
  Component: AlleySceneInner,
  layout: "absolute-fill",
});

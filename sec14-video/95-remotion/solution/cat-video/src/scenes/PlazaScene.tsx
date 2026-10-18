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

const PlazaSceneInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <CanvasImage
        name="Background"
        src={staticFile("mooncat/backgrounds/241-lantern-station-plaza.png")}
        width={2112}
        height={1408}
        style={{
          position: "absolute",
          left: -96,
          top: -230,
          scale: interpolate(frame, [0, 3.7 * fps], [1.08, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <CanvasImage
        name="Customer"
        src={staticFile("mooncat/characters/019_astronomer_customer.png")}
        width={467}
        height={700}
        style={{
          position: "absolute",
          left: 170,
          top: 400,
          translate: interpolate(frame, [0.3 * fps, 1.6 * fps], ["-700px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }),
        }}
      />
      <CanvasImage
        name="Table"
        src={staticFile("mooncat/props/182_crescent_cafe_table.png")}
        width={480}
        height={480}
        style={{ position: "absolute", left: 700, top: 590 }}
      />
      <CanvasImage
        name="Bungeoppang"
        src={staticFile("mooncat/props/061_bungeoppang.png")}
        width={210}
        height={210}
        style={{
          position: "absolute",
          left: 760,
          top: 560,
          scale: interpolate(frame, [1 * fps, 1.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <CanvasImage
        name="Tteokbokki"
        src={staticFile("mooncat/props/062_tteokbokki.png")}
        width={210}
        height={210}
        style={{
          position: "absolute",
          left: 920,
          top: 570,
          scale: interpolate(frame, [1.3 * fps, 1.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <CanvasImage
        name="Paw coin 1"
        src={staticFile("mooncat/props/261-paw-coin.png")}
        width={120}
        height={120}
        style={{
          position: "absolute",
          left: 640,
          top: 560,
          translate: interpolate(frame, [1.9 * fps, 2.9 * fps], ["0px 0px", "-30px -260px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [1.9 * fps, 2.1 * fps, 3.1 * fps, 3.5 * fps], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          rotate: interpolate(frame, [1.9 * fps, 3.5 * fps], ["-20deg", "20deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <CanvasImage
        name="Paw coin 2"
        src={staticFile("mooncat/props/261-paw-coin.png")}
        width={120}
        height={120}
        style={{
          position: "absolute",
          left: 760,
          top: 540,
          translate: interpolate(frame, [2.1 * fps, 3.1 * fps], ["0px 0px", "10px -300px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [2.1 * fps, 2.3 * fps, 3.2 * fps, 3.6 * fps], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          rotate: interpolate(frame, [2.1 * fps, 3.6 * fps], ["15deg", "-15deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <CanvasImage
        name="Paw coin 3"
        src={staticFile("mooncat/props/261-paw-coin.png")}
        width={120}
        height={120}
        style={{
          position: "absolute",
          left: 880,
          top: 560,
          translate: interpolate(frame, [2.3 * fps, 3.3 * fps], ["0px 0px", "40px -240px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [2.3 * fps, 2.5 * fps, 3.3 * fps, 3.7 * fps], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          rotate: interpolate(frame, [2.3 * fps, 3.7 * fps], ["-10deg", "25deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <LanternCat
        name="Lantern cat"
        size={780}
        style={{
          left: 1230,
          top: 330 - Math.max(0, Math.sin(((frame - 0.6 * fps) / (0.5 * fps)) * Math.PI)) * (frame > 0.6 * fps && frame < 1.1 * fps ? 40 : 0),
        }}
      />
      <Caption
        name="Speech bubble"
        style={{
          left: 1120,
          top: 110,
          padding: "26px 44px",
          borderRadius: 48,
          backgroundColor: "rgba(255,248,232,0.94)",
          color: "#4a2a5e",
          textShadow: "none",
          boxShadow: "0 10px 40px rgba(40,10,60,0.45)",
          fontSize: 60,
          lineHeight: 1.2,
          textAlign: "center",
          transformOrigin: "70% 100%",
          scale: interpolate(frame, [0.7 * fps, 1.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 14 }),
            output: "perceptual-scale",
          }),
        }}
      >
        {"어서 오세요!\n등불가게 문 열었어요"}
      </Caption>
    </>
  );
};

export const PlazaScene = Interactive.create({
  Component: PlazaSceneInner,
  layout: "absolute-fill",
});

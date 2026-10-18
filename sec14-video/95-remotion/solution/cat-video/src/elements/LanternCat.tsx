import type React from "react";
import { Img, Interactive, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// 원본 PNG(1024×1536) 기준 등불 중심 위치 비율
const LANTERN_X = 0.85;
const LANTERN_Y = 0.6;
const ASPECT = 1024 / 1536;

type LanternCatProps = {
  readonly size: number;
  readonly style?: React.CSSProperties;
};

const LanternCatInner: React.FC<LanternCatProps> = ({ size, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const width = size * ASPECT;
  const glow = size * 0.42;
  const flicker =
    0.75 + 0.15 * Math.sin((frame / fps) * 5.1) + 0.1 * Math.sin((frame / fps) * 13.7);

  return (
    <div style={{ position: "absolute", width, height: size, ...style }}>
      <div
        style={{
          position: "absolute",
          left: width * LANTERN_X - glow / 2,
          top: size * LANTERN_Y - glow / 2,
          width: glow,
          height: glow,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,200,110,0.75) 0%, rgba(255,160,70,0.3) 40%, rgba(255,140,60,0) 70%)",
          opacity: flicker,
          scale: 0.9 + flicker * 0.25,
        }}
      />
      <Img
        src={staticFile("mooncat/characters/003_lantern_shopkeeper.png")}
        style={{ position: "absolute", width, height: size }}
      />
    </div>
  );
};

export const LanternCat = Interactive.create({
  Component: LanternCatInner,
  layout: "none",
  schema: {
    size: { type: "number", default: 820, min: 100, step: 1, description: "높이(px)", hiddenFromList: false },
  },
});

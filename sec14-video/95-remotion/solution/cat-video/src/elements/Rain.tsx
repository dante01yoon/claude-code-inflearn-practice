import type React from "react";
import { Interactive, random, useCurrentFrame, useVideoConfig } from "remotion";

type RainProps = {
  readonly drops: number;
  readonly style?: React.CSSProperties;
};

const RainInner: React.FC<RainProps> = ({ drops, style }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
      {new Array(drops).fill(true).map((_, i) => {
        const speed = 28 + random(`speed-${i}`) * 18;
        const length = 40 + random(`len-${i}`) * 50;
        const x = random(`x-${i}`) * (width + 300);
        const y = ((random(`y-${i}`) * (height + 200) + frame * speed) % (height + 200)) - 200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - y * 0.18,
              top: y,
              width: 2,
              height: length,
              rotate: "10deg",
              borderRadius: 1,
              background: "linear-gradient(rgba(220,210,255,0), rgba(220,210,255,0.55))",
              opacity: 0.4 + random(`o-${i}`) * 0.5,
            }}
          />
        );
      })}
    </div>
  );
};

export const Rain = Interactive.create({
  Component: RainInner,
  layout: "none",
  schema: {
    drops: { type: "number", default: 120, min: 0, step: 1, description: "빗방울 수", hiddenFromList: false },
  },
});

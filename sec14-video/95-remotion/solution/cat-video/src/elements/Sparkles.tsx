import type React from "react";
import { Interactive, random, useCurrentFrame, useVideoConfig } from "remotion";

type SparklesProps = {
  readonly count: number;
  readonly color: string;
  readonly style?: React.CSSProperties;
};

const SparklesInner: React.FC<SparklesProps> = ({ count, color, style }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
      {new Array(count).fill(true).map((_, i) => {
        const size = 6 + random(`s-${i}`) * 12;
        const phase = random(`p-${i}`) * Math.PI * 2;
        const rise = 20 + random(`r-${i}`) * 50;
        const twinkle = 0.5 + 0.5 * Math.sin(t * (2 + random(`t-${i}`) * 3) + phase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`x-${i}`) * width + Math.sin(t + phase) * 20,
              top: ((random(`y-${i}`) * height - t * rise) % height + height) % height,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, #fff 0%, ${color} 45%, rgba(0,0,0,0) 72%)`,
              opacity: twinkle,
              scale: 0.6 + twinkle * 0.6,
            }}
          />
        );
      })}
    </div>
  );
};

export const Sparkles = Interactive.create({
  Component: SparklesInner,
  layout: "none",
  schema: {
    count: { type: "number", default: 40, min: 0, step: 1, description: "반짝이 수", hiddenFromList: false },
    color: { type: "color", default: "#ffcf7a", description: "색" },
  },
});

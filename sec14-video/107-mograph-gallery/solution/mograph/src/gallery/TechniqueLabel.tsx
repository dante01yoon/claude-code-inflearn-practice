import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, EASE_OUT, FONT, SCENE_FRAMES } from "./theme";

export type Technique = { ko: string; en: string };

// 영상 내내 떠 있는 기법 이름표. 앱 상단 UI(250px) 바로 아래에 놓는다.
export const TechniqueLabel: React.FC<{ techniques: Technique[] }> = ({
  techniques,
}) => {
  const frame = useCurrentFrame();
  const index = Math.min(
    techniques.length - 1,
    Math.floor(frame / SCENE_FRAMES),
  );
  const local = frame - index * SCENE_FRAMES;
  const { ko, en } = techniques[index];
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      style={{
        position: "absolute",
        top: 270,
        left: 60,
        right: 60,
        height: 150,
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "0 36px",
        borderRadius: 32,
        backgroundColor: "rgba(20,16,43,0.82)",
        border: `3px solid ${C.gold}`,
        fontFamily: FONT,
        color: C.cream,
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          fontSize: 76,
          fontWeight: 800,
          color: C.night,
          backgroundColor: C.gold,
          borderRadius: 22,
          padding: "6px 22px",
          scale: interpolate(local, [0, 12], [0.6, 1], {
            ...CLAMP,
            easing: EASE_OUT,
          }),
        }}
      >
        {num}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          opacity: interpolate(local, [0, 10], [0, 1], CLAMP),
          translate: interpolate(local, [0, 12], ["40px 0px", "0px 0px"], {
            ...CLAMP,
            easing: EASE_OUT,
          }),
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>
          {ko}
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 500,
            color: C.lavender,
            lineHeight: 1.15,
          }}
        >
          · {en}
        </div>
      </div>
    </div>
  );
};

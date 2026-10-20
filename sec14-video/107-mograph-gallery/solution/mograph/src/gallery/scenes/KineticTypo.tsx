import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, EASE_OUT, FONT, SceneBg } from "../theme";

// 단어마다 크기·위치·각도를 달리해서 문장이 화면 위에서 '움직이며' 쌓인다
const WORDS = [
  { text: "달빛", size: 210, x: -170, y: -380, rot: -7, color: C.gold, from: [-500, 0] },
  { text: "야시장에", size: 140, x: 120, y: -170, rot: 4, color: C.cream, from: [500, 0] },
  { text: "오늘도", size: 96, x: -200, y: 10, rot: 0, color: C.lavender, from: [0, -300] },
  { text: "불이", size: 250, x: 110, y: 220, rot: -5, color: C.gold, from: [0, 400] },
  { text: "켜졌어요!", size: 128, x: 0, y: 440, rot: 3, color: C.pink, from: [-400, 200] },
];

export const KineticTypo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SceneBg src="241-lantern-station-plaza.png" darkness={0.62} blur={4} />
      <ContentArea>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            rotate: interpolate(frame, [0, 105], ["-2deg", "2deg"]),
          }}
        >
          {WORDS.map((w, i) => {
            const start = 6 + i * 14;
            const spring = Easing.spring({ damping: 12, stiffness: 140 });
            return (
              <div
                key={w.text}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 0,
                  height: 0,
                  opacity: interpolate(frame, [start, start + 4], [0, 1], CLAMP),
                  translate: interpolate(
                    frame,
                    [start, start + 16],
                    [`${w.x + w.from[0]}px ${w.y + w.from[1]}px`, `${w.x}px ${w.y}px`],
                    { ...CLAMP, easing: EASE_OUT },
                  ),
                  scale: interpolate(frame, [start, start + 16], [2.4, 1], {
                    ...CLAMP,
                    easing: spring,
                  }),
                  rotate: interpolate(
                    frame,
                    [start, start + 16],
                    [`${w.rot * 4}deg`, `${w.rot}deg`],
                    { ...CLAMP, easing: spring },
                  ),
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    translate: "-50% -50%",
                    whiteSpace: "nowrap",
                    fontFamily: FONT,
                    fontWeight: 900,
                    fontSize: w.size,
                    color: w.color,
                    textShadow: "0 8px 30px rgba(0,0,0,0.6)",
                  }}
                >
                  {w.text}
                </div>
              </div>
            );
          })}
        </div>
      </ContentArea>
    </AbsoluteFill>
  );
};


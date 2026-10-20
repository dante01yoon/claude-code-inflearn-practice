import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, SceneBg, asset } from "../theme";

// 말하는 순간의 단어만 노란 배경으로 강조하는 자막
const WORDS = ["어서", "오세요,", "따끈한", "붕어빵이", "방금", "나왔어요!"];
const START = 8;
const PER_WORD = 15;

export const WordHighlight: React.FC = () => {
  const frame = useCurrentFrame();
  const active = Math.floor((frame - START) / PER_WORD);
  return (
    <AbsoluteFill>
      <SceneBg src="246-rainy-lantern-alley.png" darkness={0.55} />
      <ContentArea>
        <Img
          src={asset("characters/003_lantern_shopkeeper.png")}
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            height: 700,
            translate: "-50% 0px",
            // 말할 때 살짝 들썩이게
            scale: 1 + 0.02 * Math.sin(frame * 0.6),
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 730,
            padding: "40px 36px",
            borderRadius: 36,
            backgroundColor: "rgba(20,16,43,0.85)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "18px 22px",
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.25,
          }}
        >
          {WORDS.map((w, i) => {
            const isActive = i === active;
            const t = frame - (START + i * PER_WORD);
            return (
              <span
                key={w}
                style={{
                  padding: "0 14px",
                  borderRadius: 18,
                  color: isActive ? C.night : i < active ? C.cream : C.dim,
                  backgroundColor: isActive ? C.gold : "transparent",
                  scale: isActive
                    ? interpolate(t, [0, 5], [1, 1.12], CLAMP)
                    : 1,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </ContentArea>
    </AbsoluteFill>
  );
};

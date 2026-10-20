import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, EASE_OUT, SceneBg, asset, prog } from "../theme";

// 인물 아래쪽에 이름·설명 카드(로워 서드)가 미끄러져 들어온다
export const LowerThird: React.FC = () => {
  const frame = useCurrentFrame();
  const bar = prog(frame, 10, 24);
  const card = prog(frame, 18, 38);
  return (
    <AbsoluteFill>
      <SceneBg src="243-station-train-platform.png" darkness={0.45} />
      <ContentArea>
        <Img
          src={asset("characters/001_tea_shopkeeper.png")}
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: 760,
            translate: "-50% 0px",
          }}
        />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 20, height: 300 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 22,
              height: 300,
              borderRadius: 11,
              backgroundColor: C.gold,
              scale: `1 ${bar}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 0,
              top: 0,
              height: 300,
              borderRadius: 28,
              backgroundColor: "rgba(20,16,43,0.9)",
              padding: "40px 44px",
              boxSizing: "border-box",
              clipPath: `inset(0 ${100 - card * 100}% 0 0 round 28px)`,
            }}
          >
            <div
              style={{
                fontSize: 96,
                fontWeight: 900,
                color: C.cream,
                opacity: interpolate(frame, [26, 36], [0, 1], CLAMP),
                translate: interpolate(frame, [26, 40], ["0px 30px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
              }}
            >
              치즈 사장님
            </div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 600,
                color: C.gold,
                marginTop: 12,
                opacity: interpolate(frame, [34, 44], [0, 1], CLAMP),
                translate: interpolate(frame, [34, 48], ["0px 30px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
              }}
            >
              「달빛 다실」 찻집 주인 · 12년 차
            </div>
          </div>
        </div>
      </ContentArea>
    </AbsoluteFill>
  );
};

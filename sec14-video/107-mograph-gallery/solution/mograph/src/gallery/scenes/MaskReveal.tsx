import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, EASE_OUT, SceneBg, asset, prog } from "../theme";

// 가림막(금색 판)이 걷히면서 아래 글자가 드러난다
const Curtain: React.FC<{
  text: string;
  size: number;
  color: string;
  start: number;
  end: number;
}> = ({ text, size, color, start, end }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, end);
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1.15,
        color,
        // 글자는 가림막이 지나간 만큼만 보인다
        clipPath: `inset(0 ${100 - p * 100}% 0 0)`,
      }}
    >
      {text}
    </div>
  );
};

const Bar: React.FC<{ start: number; end: number; height: number }> = ({
  start,
  end,
  height,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, end);
  // 막대가 왼→오로 쓸고 지나가며, 지나간 자리에 글자가 남는다
  const left = p * 100;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        height,
        left: `${left}%`,
        width: interpolate(p, [0, 0.15, 0.85, 1], [0, 26, 26, 0], CLAMP) + "%",
        backgroundColor: C.gold,
        borderRadius: 8,
        translate: "-100% 0px",
      }}
    />
  );
};

export const MaskReveal: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SceneBg src="256-rooftop-festival-square.png" darkness={0.6} blur={3} />
      <ContentArea
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
        }}
      >
        <div style={{ position: "relative" }}>
          <Curtain text="등불 축제" size={190} color={C.cream} start={10} end={60} />
          <Bar start={10} end={60} height={220} />
        </div>
        <div style={{ position: "relative" }}>
          <Curtain text="오늘 밤 8시" size={130} color={C.gold} start={32} end={82} />
          <Bar start={32} end={82} height={150} />
        </div>
        <div
          style={{
            overflow: "hidden",
            height: 460,
            width: 460,
            borderRadius: 230,
            marginTop: 30,
            // 원형 마스크가 아래에서 위로 열린다
            clipPath: `inset(${interpolate(frame, [50, 90], [100, 0], { ...CLAMP, easing: EASE_OUT })}% 0 0 0 round 230px)`,
            backgroundColor: "rgba(255,200,87,0.25)",
          }}
        >
          <Img
            src={asset("characters/003_lantern_shopkeeper.png")}
            style={{ width: 460, marginTop: -10 }}
          />
        </div>
      </ContentArea>
    </AbsoluteFill>
  );
};

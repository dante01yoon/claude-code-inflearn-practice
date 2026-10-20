import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, SceneBg, asset } from "../theme";

// 야시장 투어 4곳 중 지금 어디쯤인지 막대로 보여준다
const STOPS = ["등불 역", "비 골목", "달 다리", "옥상 신사"];
const BAR_W = 840;

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [8, 92], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.quad),
  });
  const current = Math.min(STOPS.length - 1, Math.floor(p * (STOPS.length - 1) + 0.001));

  return (
    <AbsoluteFill>
      <SceneBg src="260-rooftop-moon-shrine.png" darkness={0.6} blur={4} />
      <ContentArea style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.lavender }}>야시장 투어 진행률</div>
        <div style={{ fontSize: 240, fontWeight: 900, color: C.gold, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(p * 100)}%
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, marginBottom: 150 }}>
          지금: {STOPS[current]} ({current + 1}/{STOPS.length})
        </div>

        <div style={{ position: "relative", width: BAR_W, height: 44 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 22, backgroundColor: "rgba(255,244,220,0.2)" }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: BAR_W * p,
              borderRadius: 22,
              background: `linear-gradient(90deg, ${C.pink}, ${C.gold})`,
            }}
          />
          {STOPS.map((s, i) => {
            const x = (i / (STOPS.length - 1)) * BAR_W;
            const reached = p * (STOPS.length - 1) >= i - 0.001;
            return (
              <React.Fragment key={s}>
                <div
                  style={{
                    position: "absolute",
                    left: x - 34,
                    top: -12,
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    backgroundColor: reached ? C.gold : C.night,
                    border: `6px solid ${reached ? C.cream : "rgba(255,244,220,0.4)"}`,
                    boxSizing: "border-box",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: x,
                    top: 80,
                    translate: "-50% 0px",
                    whiteSpace: "nowrap",
                    fontSize: 44,
                    fontWeight: 700,
                    color: reached ? C.cream : C.dim,
                  }}
                >
                  {s}
                </div>
              </React.Fragment>
            );
          })}
          <Img
            src={asset("characters/003_lantern_shopkeeper.png")}
            style={{ position: "absolute", left: BAR_W * p - 70, top: -200, width: 140 }}
          />
        </div>
      </ContentArea>
    </AbsoluteFill>
  );
};

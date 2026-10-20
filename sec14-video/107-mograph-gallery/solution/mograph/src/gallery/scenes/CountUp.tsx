import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, SceneBg, asset } from "../theme";

// 0에서 목표 숫자까지 올라가는 카운터
const TARGET = 12480;
const RING_R = 250;
const RING_LEN = 2 * Math.PI * RING_R;

export const CountUp: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [8, 88], [0, 1], {
    ...CLAMP,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const value = Math.round(TARGET * p);
  const done = p >= 1;

  return (
    <AbsoluteFill>
      <SceneBg src="252-harbor-lighthouse-pier.png" darkness={0.62} blur={4} />
      <ContentArea
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <div style={{ position: "relative", width: 600, height: 600, marginTop: 20 }}>
          <svg width={600} height={600} style={{ position: "absolute" }}>
            <circle cx={300} cy={300} r={RING_R} stroke="rgba(255,244,220,0.18)" strokeWidth={22} fill="none" />
            <circle
              cx={300}
              cy={300}
              r={RING_R}
              stroke={C.gold}
              strokeWidth={22}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={RING_LEN}
              strokeDashoffset={RING_LEN * (1 - p)}
              transform="rotate(-90 300 300)"
            />
          </svg>
          <Img
            src={asset("props/261-paw-coin.png")}
            style={{
              position: "absolute",
              left: 110,
              top: 110,
              width: 380,
              // 숫자가 오르는 동안 동전이 돈다
              scale: `${Math.cos(p * Math.PI * 6)} 1`,
            }}
          />
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.lavender, marginTop: 40 }}>
          오늘 밤 모인 발바닥 동전
        </div>
        <div
          style={{
            fontSize: 210,
            fontWeight: 900,
            fontVariantNumeric: "tabular-nums",
            color: done ? C.gold : C.cream,
            lineHeight: 1.1,
            scale: interpolate(frame, [88, 94, 100], [1, 1.12, 1], CLAMP),
          }}
        >
          {value.toLocaleString("ko-KR")}
          <span style={{ fontSize: 100, marginLeft: 12 }}>개</span>
        </div>
      </ContentArea>
    </AbsoluteFill>
  );
};

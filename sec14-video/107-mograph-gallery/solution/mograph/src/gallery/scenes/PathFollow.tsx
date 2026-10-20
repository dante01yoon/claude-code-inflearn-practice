import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, SceneBg, asset } from "../theme";
import { Pt, cubic, cutPoly, polyLength, toD } from "../path";

// 고양이가 S자 곡선 길을 따라 출발점에서 달 보석까지 걸어간다
const W = 920;
const H = 1180;
const ROUTE: Pt[] = [
  ...cubic([140, 1060], [700, 1080], [860, 820], [520, 640]),
  ...cubic([520, 640], [180, 460], [120, 260], [700, 140]),
];
const LEN = polyLength(ROUTE);

export const PathFollow: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [8, 92], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.cubic),
  });
  const cut = cutPoly(ROUTE, LEN * p);
  const [x, y] = cut.tip;
  // 오른쪽으로 갈 때와 왼쪽으로 갈 때 고양이 방향을 바꾼다
  const facingLeft = Math.abs(cut.angle) > 90;

  return (
    <AbsoluteFill>
      <SceneBg src="250-alley-moon-bridge.png" darkness={0.5} />
      <ContentArea>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <path d={toD(ROUTE)} stroke="rgba(255,244,220,0.55)" strokeWidth={10} strokeDasharray="4 26" strokeLinecap="round" fill="none" />
          <path d={toD(cut.pts)} stroke={C.gold} strokeWidth={14} strokeLinecap="round" fill="none" />
          <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r={22} fill={C.pink} />
        </svg>
        <div
          style={{
            position: "absolute",
            left: ROUTE[0][0] - 110,
            top: ROUTE[0][1] + 30,
            fontSize: 48,
            fontWeight: 800,
          }}
        >
          출발
        </div>
        <Img
          src={asset("props/262-moon-gem.png")}
          style={{
            position: "absolute",
            left: 700 - 90,
            top: 140 - 100,
            width: 180,
            scale: interpolate(frame, [90, 96, 102], [1, 1.25, 1], CLAMP),
          }}
        />
        <Img
          src={asset("characters/003_lantern_shopkeeper.png")}
          style={{
            position: "absolute",
            left: x - 110,
            top: y - 300,
            width: 220,
            scale: `${facingLeft ? -1 : 1} 1`,
            // 걷는 느낌으로 통통 튄다
            translate: `0px ${-Math.abs(Math.sin(frame * 0.5)) * 18}px`,
          }}
        />
      </ContentArea>
    </AbsoluteFill>
  );
};

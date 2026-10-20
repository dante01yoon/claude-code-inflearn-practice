import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, EASE_OUT, SceneBg, asset } from "../theme";
import { Pt, cutPoly, polyLength, toD } from "../path";

// 위: 메뉴별 판매 막대가 자라남 / 아래: 시간대별 손님 선 그래프가 그려짐
const BARS = [
  { name: "붕어빵", value: 128, img: "061_bungeoppang.png" },
  { name: "떡볶이", value: 96, img: "062_tteokbokki.png" },
  { name: "우동", value: 64, img: "063_udon.png" },
  { name: "라멘", value: 112, img: "064_ramen.png" },
];
const MAX = 140;
const BAR_H = 360;

const HOURS = ["6시", "7시", "8시", "9시", "10시", "11시"];
const GUESTS = [80, 140, 260, 420, 360, 220];
const LW = 840;
const LH = 300;
const LINE: Pt[] = GUESTS.map((g, i) => [
  (i / (GUESTS.length - 1)) * LW,
  LH - (g / 450) * LH,
]);
const LINE_LEN = polyLength(LINE);

export const ChartGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const lineP = interpolate(frame, [30, 92], [0, 1], CLAMP);
  const cut = cutPoly(LINE, LINE_LEN * lineP);

  const title: React.CSSProperties = {
    fontSize: 56,
    fontWeight: 800,
    color: C.cream,
    marginBottom: 16,
  };

  return (
    <AbsoluteFill>
      <SceneBg src="241-lantern-station-plaza.png" darkness={0.75} blur={8} />
      <ContentArea>
        <div style={title}>메뉴별 판매량</div>
        <div
          style={{
            position: "relative",
            height: BAR_H + 150,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            borderBottom: "2px solid rgba(255,244,220,0.5)",
            paddingBottom: 0,
          }}
        >
          {BARS.map((b, i) => {
            const start = 6 + i * 7;
            const g = interpolate(frame, [start, start + 26], [0, 1], {
              ...CLAMP,
              easing: EASE_OUT,
            });
            return (
              <div
                key={b.name}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 170 }}
              >
                <div style={{ fontSize: 52, fontWeight: 800, color: C.cream, opacity: g }}>
                  {Math.round(b.value * g)}
                </div>
                <div
                  style={{
                    width: 120,
                    height: (b.value / MAX) * BAR_H * g,
                    backgroundColor: C.gold,
                    borderRadius: "4px 4px 0 0",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8 }}>
          {BARS.map((b) => (
            <div key={b.name} style={{ width: 170, textAlign: "center" }}>
              <Img src={asset(`props/${b.img}`)} style={{ width: 96 }} />
              <div style={{ fontSize: 44, fontWeight: 700, color: C.cream }}>{b.name}</div>
            </div>
          ))}
        </div>

        <div style={{ ...title, marginTop: 40 }}>시간대별 손님</div>
        <svg width={920} height={LH + 80} viewBox={`-40 -20 920 ${LH + 80}`}>
          {[0, 0.5, 1].map((t) => (
            <line key={t} x1={0} x2={LW} y1={LH * t} y2={LH * t} stroke="rgba(255,244,220,0.15)" strokeWidth={2} />
          ))}
          <path d={toD(cut.pts)} stroke={C.mint} strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {LINE.map((p, i) =>
            cut.pts.length > i ? (
              <circle key={i} cx={p[0]} cy={p[1]} r={12} fill={C.mint} stroke={C.night} strokeWidth={4} />
            ) : null,
          )}
          {lineP < 1 && lineP > 0 && <circle cx={cut.tip[0]} cy={cut.tip[1]} r={18} fill={C.cream} />}
          {HOURS.map((h, i) => (
            <text key={h} x={LINE[i][0]} y={LH + 52} fill={C.cream} fontSize={40} fontWeight={600} textAnchor="middle">
              {h}
            </text>
          ))}
        </svg>
      </ContentArea>
    </AbsoluteFill>
  );
};

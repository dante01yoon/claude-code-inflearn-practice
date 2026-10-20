import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, SceneBg, asset, prog } from "../theme";
import { Pt, cubic, cutPoly, polyLength, toD } from "../path";

// 세 그릇 중 라멘 하나를 동그라미와 화살표로 콕 집는다
const DISHES = [
  { img: "062_tteokbokki.png", x: 160, y: 820 },
  { img: "063_udon.png", x: 760, y: 820 },
  { img: "064_ramen.png", x: 460, y: 480 },
];
const TARGET = { x: 460, y: 480, r: 230 };
const ARROW: Pt[] = cubic([300, 120], [180, 160], [180, 220], [270, 290], 40);
const ARROW_LEN = polyLength(ARROW);
const RING_LEN = 2 * Math.PI * TARGET.r;

export const Callout: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = prog(frame, 12, 38, Easing.inOut(Easing.quad));
  const arrow = prog(frame, 34, 50);
  const arrowCut = cutPoly(ARROW, ARROW_LEN * arrow);
  const label = prog(frame, 44, 58, Easing.spring({ damping: 12 }));
  const focus = interpolate(frame, [30, 45], [1, 0.35], CLAMP);

  return (
    <AbsoluteFill>
      <SceneBg src="243-station-train-platform.png" darkness={0.65} blur={5} />
      <ContentArea>
        {DISHES.map((d, i) => (
          <Img
            key={d.img}
            src={asset(`props/${d.img}`)}
            style={{
              position: "absolute",
              left: d.x - 160,
              top: d.y - 160,
              width: 320,
              opacity: i === 2 ? 1 : focus,
            }}
          />
        ))}
        <svg width={920} height={1180} style={{ position: "absolute", left: 0, top: 0 }}>
          <circle
            cx={TARGET.x}
            cy={TARGET.y}
            r={TARGET.r}
            stroke={C.pink}
            strokeWidth={14}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={RING_LEN}
            strokeDashoffset={RING_LEN * (1 - ring)}
            transform={`rotate(-120 ${TARGET.x} ${TARGET.y})`}
          />
          <path d={toD(arrowCut.pts)} stroke={C.pink} strokeWidth={14} strokeLinecap="round" fill="none" />
          {arrow >= 1 && (
            <g transform={`translate(${arrowCut.tip[0]} ${arrowCut.tip[1]}) rotate(${arrowCut.angle})`}>
              <polygon points="18,0 -30,-26 -30,26" fill={C.pink} />
            </g>
          )}
        </svg>
        <div
          style={{
            position: "absolute",
            left: 330,
            top: 20,
            padding: "20px 36px",
            borderRadius: 28,
            backgroundColor: C.pink,
            color: C.night,
            fontSize: 72,
            fontWeight: 900,
            scale: label,
            transformOrigin: "left bottom",
          }}
        >
          오늘의 추천!
        </div>
      </ContentArea>
    </AbsoluteFill>
  );
};

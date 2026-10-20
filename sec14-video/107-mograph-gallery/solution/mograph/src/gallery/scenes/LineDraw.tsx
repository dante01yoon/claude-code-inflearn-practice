import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, SceneBg } from "../theme";
import { Pt, arc, cubic, cutPoly, polyLength, toD } from "../path";

// 고양이 얼굴 선화를 획 순서대로 펜이 그려 나간다
const STROKES: Pt[][] = [
  // 머리 윤곽 + 귀
  [
    ...cubic([-250, -40], [-260, -200], [-250, -300], [-220, -400]),
    ...cubic([-220, -400], [-160, -340], [-110, -290], [-70, -270]),
    ...cubic([-70, -270], [-20, -280], [20, -280], [70, -270]),
    ...cubic([70, -270], [110, -290], [160, -340], [220, -400]),
    ...cubic([220, -400], [250, -300], [260, -200], [250, -40]),
    ...arc(0, -40, 250, 0, 180, 80),
  ],
  // 눈
  arc(-100, -90, 42, -90, 270, 40),
  arc(100, -90, 42, -90, 270, 40),
  // 코와 입
  [...cubic([-25, 10], [0, 30], [0, 30], [25, 10]), ...cubic([25, 10], [0, 0], [0, 0], [-25, 10])],
  [...cubic([0, 25], [0, 60], [-40, 80], [-70, 55])],
  [...cubic([0, 25], [0, 60], [40, 80], [70, 55])],
  // 수염
  [[-150, 20], [-330, -10]],
  [[-150, 50], [-330, 70]],
  [[150, 20], [330, -10]],
  [[150, 50], [330, 70]],
  // 달 모양 머리 장식
  [...arc(0, -330, 70, 60, 300, 40), ...cubic([35, -390], [-10, -360], [-10, -300], [35, -270])],
];

const LENGTHS = STROKES.map(polyLength);
const TOTAL = LENGTHS.reduce((a, b) => a + b, 0);

export const LineDraw: React.FC = () => {
  const frame = useCurrentFrame();
  const drawn =
    TOTAL *
    interpolate(frame, [8, 88], [0, 1], {
      ...CLAMP,
      easing: Easing.inOut(Easing.quad),
    });

  let left = drawn;
  let tip: Pt = STROKES[0][0];
  const paths = STROKES.map((pts, i) => {
    if (left <= 0) return null;
    const cut = cutPoly(pts, Math.min(left, LENGTHS[i]));
    left -= LENGTHS[i];
    tip = cut.tip;
    return <path key={i} d={toD(cut.pts)} />;
  });
  const done = drawn >= TOTAL;

  return (
    <AbsoluteFill>
      <SceneBg src="260-rooftop-moon-shrine.png" darkness={0.7} blur={6} />
      <ContentArea>
        <svg
          viewBox="-400 -520 800 900"
          style={{ position: "absolute", left: 0, top: 40, width: 920, height: 1035 }}
        >
          {/* 완성본의 희미한 밑그림 */}
          <g stroke="rgba(255,244,220,0.12)" strokeWidth={4} fill="none" strokeDasharray="8 12">
            {STROKES.map((pts, i) => (
              <path key={i} d={toD(pts)} />
            ))}
          </g>
          <g
            stroke={C.gold}
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 10px rgba(255,200,87,0.7))" }}
          >
            {paths}
          </g>
          {/* 펜촉 */}
          {!done && (
            <g transform={`translate(${tip[0]} ${tip[1]}) rotate(35)`}>
              <g>
                <polygon points="0,0 14,-34 -14,-34" fill={C.cream} />
                <polygon points="0,0 5,-12 -5,-12" fill={C.night} />
                <rect x={-14} y={-150} width={28} height={116} rx={4} fill={C.pink} />
                <rect x={-14} y={-168} width={28} height={22} rx={6} fill={C.lavender} />
              </g>
            </g>
          )}
        </svg>
      </ContentArea>
    </AbsoluteFill>
  );
};

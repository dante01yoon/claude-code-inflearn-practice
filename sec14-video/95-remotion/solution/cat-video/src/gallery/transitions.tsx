import type React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bg, catFace, CLAMP, HeroCat, Prop, Vignette } from "./common";

// 10 매치 컷: 가게의 발바닥 동전(원)이 같은 자리·같은 크기의 보름달로 이어진다.
const MATCH = { x: 1180, y: 450, d: 400 };
const CUT_AT = 52;
export const MatchCut: React.FC = () => {
  const frame = useCurrentFrame();
  const bOpacity = interpolate(frame, [CUT_AT - 4, CUT_AT + 4], [0, 1], CLAMP);
  const pushA = interpolate(frame, [0, CUT_AT + 4], [1, 1.08], CLAMP);
  const pushB = interpolate(frame, [CUT_AT - 4, 104], [1.08, 1], { ...CLAMP, easing: Easing.out(Easing.quad) });
  const origin = `${MATCH.x}px ${MATCH.y}px`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: pushA, transformOrigin: origin }}>
        <Bg name="alley" style={{ filter: "blur(10px) brightness(0.6)", scale: 1.15 }} />
        <HeroCat size={720} cx={500} feet={1060} />
        <Prop name="coin" size={MATCH.d} cx={MATCH.x} cy={MATCH.y} />
      </AbsoluteFill>
      <AbsoluteFill style={{ scale: pushB, transformOrigin: origin, opacity: bOpacity }}>
        <Bg name="pier" style={{ filter: "brightness(0.55) saturate(1.1)" }} />
        <div
          style={{
            position: "absolute",
            left: MATCH.x - MATCH.d / 2,
            top: MATCH.y - MATCH.d / 2,
            width: MATCH.d,
            height: MATCH.d,
            borderRadius: "50%",
            background: "radial-gradient(circle at 42% 40%, #fffbe8 0%, #fde9b0 55%, #f3cf7c 100%)",
            boxShadow: "0 0 80px 30px rgba(255,226,150,0.55), 0 0 220px 80px rgba(255,200,120,0.25)",
          }}
        />
        <HeroCat size={520} cx={460} feet={1050} />
      </AbsoluteFill>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// 11 아이리스 전환: 고양이 얼굴을 중심으로 원이 닫혔다가 다음 장면에서 다시 열린다.
const IRIS_MAX = 1250;
export const IrisTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const closing = frame < 44;
  const r = closing
    ? interpolate(frame, [8, 42], [IRIS_MAX, 0], { ...CLAMP, easing: Easing.in(Easing.cubic) })
    : interpolate(frame, [46, 86], [0, IRIS_MAX], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const sizeA = 640;
  const sizeB = 640;
  const faceA = catFace(sizeA, 960, 1030);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${faceA.x}px ${faceA.y}px)` }}>
        {closing ? (
          <>
            <Bg name="alley" />
            <HeroCat size={sizeA} cx={960} feet={1030} />
          </>
        ) : (
          <>
            <Bg name="shrine" />
            <HeroCat size={sizeB} cx={960} feet={1030} />
          </>
        )}
        <Vignette strength={0.4} />
      </AbsoluteFill>
      {/* 원 테두리 */}
      <div
        style={{
          position: "absolute",
          left: faceA.x - r,
          top: faceA.y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          boxShadow: "0 0 0 6px rgba(255,207,122,0.8), 0 0 40px 10px rgba(255,207,122,0.35)",
          opacity: r > 2 && r < IRIS_MAX - 50 ? 1 : 0,
        }}
      />
    </AbsoluteFill>
  );
};

// 12 플러드 전환: 검은 발바닥 도형이 왼쪽 아래에서 번져 화면을 덮고, 오른쪽 위로 줄어들며 다음 장면을 드러낸다.
const PAW_COVER = 14;
const PawShape: React.FC<{ readonly x: number; readonly y: number; readonly scale: number }> = ({ x, y, scale }) => (
  <svg
    width={1920}
    height={1080}
    style={{ position: "absolute", left: 0, top: 0 }}
  >
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(-20)`} fill="#0b0414">
      <ellipse cx={0} cy={30} rx={130} ry={110} />
      <ellipse cx={-130} cy={-80} rx={48} ry={60} />
      <ellipse cx={-50} cy={-140} rx={48} ry={62} />
      <ellipse cx={50} cy={-140} rx={48} ry={62} />
      <ellipse cx={130} cy={-80} rx={48} ry={60} />
    </g>
  </svg>
);
export const FloodTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [4, 38], [0, 1], { ...CLAMP, easing: Easing.in(Easing.cubic) });
  const shrink = interpolate(frame, [42, 78], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const covered = frame >= 40;
  const pawX = covered ? interpolate(shrink, [0, 1], [960, 1620]) : interpolate(grow, [0, 1], [260, 960]);
  const pawY = covered ? interpolate(shrink, [0, 1], [500, 260]) : interpolate(grow, [0, 1], [860, 500]);
  const pawScale = covered ? interpolate(shrink, [0, 1], [PAW_COVER, 0]) : interpolate(grow, [0, 1], [0.4, PAW_COVER]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      {covered ? (
        <>
          <Bg name="pier" />
          <HeroCat size={640} cx={760} feet={1030} />
        </>
      ) : (
        <>
          <Bg name="plaza" />
          <HeroCat size={640} cx={1160} feet={1030} />
        </>
      )}
      <Vignette strength={0.4} />
      <PawShape x={pawX} y={pawY} scale={pawScale} />
    </AbsoluteFill>
  );
};

// 13 모핑 전환: 노란 원이 둥근 사각형으로 변하며 커지고, 그 안에서 다음 장면이 화면 전체로 펼쳐진다.
export const MorphTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [4, 16], [0, 1], { ...CLAMP, easing: Easing.out(Easing.back(1.8)) });
  const morph = interpolate(frame, [20, 62], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });
  const expand = interpolate(frame, [66, 92], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });

  const w = interpolate(morph, [0, 1], [260, 1000]) + expand * (1920 - 1000);
  const h = interpolate(morph, [0, 1], [260, 600]) + expand * (1080 - 600);
  const radius = interpolate(morph, [0, 1], [130, 40]) * (1 - expand);
  const rot = interpolate(morph, [0, 1], [-90, 0]);
  const scene = interpolate(morph, [0.35, 1], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <Bg name="bridge" style={{ filter: `brightness(${1 - morph * 0.4})` }} />
      <HeroCat size={600} cx={440} feet={1040} />
      <Vignette strength={0.45} />
      <div
        style={{
          position: "absolute",
          left: 960 - w / 2,
          top: 540 - h / 2,
          width: w,
          height: h,
          borderRadius: radius,
          overflow: "hidden",
          rotate: `${rot}deg`,
          scale: appear,
          background: "radial-gradient(circle at 40% 40%, #fff3c4 0%, #ffcf7a 60%, #f0a040 100%)",
          boxShadow: expand < 1 ? "0 0 60px 10px rgba(255,207,122,0.6)" : undefined,
        }}
      >
        <div style={{ position: "absolute", left: (w - 1920) / 2, top: (h - 1080) / 2, width: 1920, height: 1080, opacity: scene }}>
          <Bg name="festival" />
          <HeroCat size={600} cx={1260} feet={1040} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

import type React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from "remotion";
import { juaFont } from "../fonts";
import { Bg, bgSrc, catFace, CAT_ASPECT, Character, charSrc, CLAMP, HeroCat, Prop, Vignette } from "./common";

const smooth = Easing.inOut(Easing.cubic);

// 01 푸시 인: 카메라가 고양이 얼굴 쪽으로 다가간다. 배경보다 고양이가 더 크게 커져 돌리 느낌을 준다.
export const PushIn: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [6, 98], [0, 1], { ...CLAMP, easing: smooth });
  const face = catFace(660, 960, 1030);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: interpolate(p, [0, 1], [1, 1.6]), transformOrigin: `${face.x}px ${face.y}px` }}>
        <Bg name="plaza" />
      </AbsoluteFill>
      <AbsoluteFill style={{ scale: interpolate(p, [0, 1], [1, 2.3]), transformOrigin: `${face.x}px ${face.y}px` }}>
        <Prop name="barrel" size={360} cx={560} cy={880} />
        <Prop name="ramen" size={190} cx={560} cy={720} />
        <HeroCat size={660} cx={960} feet={1030} />
      </AbsoluteFill>
      <Vignette strength={interpolate(p, [0, 1], [0.35, 0.8])} />
    </AbsoluteFill>
  );
};

// 02 풀 아웃: 얼굴 클로즈업에서 시작해 멀어지며 시장 사람들과 소품이 드러난다.
export const PullOut: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [4, 100], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.quad) });
  const face = catFace(560, 960, 960);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: interpolate(p, [0, 1], [3.2, 1]), transformOrigin: `${face.x}px ${face.y}px` }}>
        <Bg name="festival" />
        <Character name="astronomer" height={400} cx={1500} feet={720} />
        <Character name="tea" height={520} cx={330} feet={1000} />
        <Character name="firefly" height={430} cx={1640} feet={1030} />
        <Prop name="picnic" size={420} cx={640} cy={860} />
        <Prop name="tteokbokki" size={150} cx={600} cy={760} />
        <Prop name="bungeoppang" size={140} cx={700} cy={770} />
        <Prop name="barrel" size={330} cx={1290} cy={900} />
        <Prop name="udon" size={160} cx={1290} cy={770} />
        <HeroCat size={560} cx={960} feet={960} />
      </AbsoluteFill>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// 03 팬: 넓은 비 오는 골목을 카메라가 오른쪽으로 훑으며 손님들을 지나 고양이에게 도착한다.
const PAN_WORLD_W = 3100;
export const Pan: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [4, 100], [0, 1], { ...CLAMP, easing: smooth });
  const x = -p * (PAN_WORLD_W - 1920);
  const bgH = (PAN_WORLD_W / 1536) * 1024;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: x, top: 0, width: PAN_WORLD_W, height: 1080 }}>
        <Img src={bgSrc("alley")} style={{ position: "absolute", left: 0, top: -(bgH - 1080) * 0.55, width: PAN_WORLD_W, height: bgH }} />
        <Character name="raincoat" height={560} cx={420} feet={1010} />
        <Prop name="stool" size={260} cx={900} cy={930} />
        <Character name="astronomer" height={560} cx={1380} feet={1010} />
        <Prop name="cafeTable" size={340} cx={1900} cy={880} />
        <Prop name="udon" size={150} cx={1900} cy={735} />
        <HeroCat size={680} cx={2560} feet={1040} />
      </div>
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};

// 04 켄 번스: 액자 속 정지 사진을 천천히 확대하며 고양이 쪽으로 미끄러진다.
export const KenBurns: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 104], [0, 1], CLAMP);
  const scale = interpolate(t, [0, 1], [1.05, 1.45]);
  const tx = interpolate(t, [0, 1], [60, -170]);
  const ty = interpolate(t, [0, 1], [40, -60]);
  const PW = 1400;
  const PH = 790;

  return (
    <AbsoluteFill style={{ backgroundColor: "#140a24", overflow: "hidden" }}>
      <Bg name="shrine" style={{ filter: "blur(28px) brightness(0.35)", scale: 1.1 }} />
      <div
        style={{
          position: "absolute",
          left: (1920 - PW) / 2 - 24,
          top: 150,
          padding: "24px 24px 90px",
          background: "#fbf3e2",
          borderRadius: 8,
          rotate: "-2deg",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ position: "relative", width: PW, height: PH, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
            <Bg name="shrine" />
            {/* 정지 사진이므로 등불이 깜빡이지 않는 원본 이미지를 쓴다 */}
            <Img src={charSrc("cat")} style={{ position: "absolute", height: 560, left: 930, top: 210, width: 560 * CAT_ASPECT }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center", fontFamily: juaFont, fontSize: 48, color: "#5b4370" }}>
          달 신사에서, 등불가게 고양이
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 05 패럴랙스: 같은 카메라 이동에 뒤(배경) < 중간(고양이) < 앞(소품) 순으로 더 많이 움직인다.
export const Parallax: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 104], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.sin) });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, translate: `${interpolate(t, [0, 1], [60, -60])}px 0`, scale: 1.12 }}>
        <Bg name="bridge" />
      </div>
      <div style={{ position: "absolute", inset: 0, translate: `${interpolate(t, [0, 1], [320, -320])}px 0` }}>
        <Character name="raincoat" height={430} cx={1380} feet={900} />
        <HeroCat size={640} cx={880} feet={1000} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: `${interpolate(t, [0, 1], [1100, -1100])}px 0`,
          filter: "blur(5px) brightness(0.55)",
        }}
      >
        <Prop name="bench" size={900} cx={-200} cy={1000} />
        <Prop name="barrel" size={760} cx={760} cy={1120} />
        <Prop name="armchair" size={820} cx={1800} cy={1060} />
        <Prop name="picnic" size={900} cx={2700} cy={1060} />
      </div>
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// 06 휩 팬: 광장 → 부두로 아주 빠르게 쓸고 지나가며 가로 모션 블러로 장면을 잇는다.
const whipX = (f: number) => interpolate(f, [36, 68], [0, -1920], { ...CLAMP, easing: Easing.inOut(Easing.poly(5)) });
export const WhipPan: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 36, 68, 104], [0, -40, 0, -30], CLAMP);
  const x = whipX(frame) + drift;
  const speed = Math.abs(whipX(frame) - whipX(frame - 1));
  const blur = Math.min(speed * 1.1, 220);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="whip-blur" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <div
        style={{
          position: "absolute",
          left: x - 200,
          top: 0,
          width: 1920 * 2 + 400,
          height: 1080,
          filter: blur > 0.5 ? "url(#whip-blur)" : undefined,
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920 + 200, height: 1080, overflow: "hidden" }}>
          <Bg name="plaza" />
          <HeroCat size={640} cx={1060} feet={1020} />
        </div>
        <div style={{ position: "absolute", left: 1920 + 200, top: 0, width: 1920 + 200, height: 1080, overflow: "hidden" }}>
          <Bg name="pier" />
          <HeroCat size={640} cx={1160} feet={1020} />
        </div>
      </div>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// 07 랙 포커스: 앞의 달 보석에 맞던 초점이 뒤의 고양이로 옮겨간다.
export const RackFocus: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [26, 50], [0, 1], { ...CLAMP, easing: smooth });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: -40, filter: `blur(${interpolate(p, [0, 1], [14, 6])}px)` }}>
        <Bg name="shrine" />
      </div>
      <div style={{ position: "absolute", inset: 0, filter: `blur(${interpolate(p, [0, 1], [16, 0])}px)` }}>
        <HeroCat size={600} cx={1240} feet={960} />
      </div>
      <div style={{ position: "absolute", inset: 0, filter: `blur(${interpolate(p, [0, 1], [0, 26])}px)`, scale: interpolate(p, [0, 1], [1, 1.04]) }}>
        <Prop name="gem" size={760} cx={470} cy={690} />
      </div>
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

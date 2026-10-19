import type React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "./elements/Caption";
import { Rain } from "./elements/Rain";
import { Sparkles } from "./elements/Sparkles";
import { juaFont } from "./fonts";
import { Bg, catFace, Character, CLAMP, HeroCat, Prop, Vignette } from "./gallery/common";

// 「달빛 고양이 야시장」 트레일러 (30fps, 584프레임)
export const TRAILER_FRAMES = 584;

const smooth = Easing.inOut(Easing.cubic);
const slideIn = Easing.bezier(0.22, 1, 0.36, 1);
const rise = Easing.bezier(0.16, 1, 0.3, 1);
const pop = Easing.spring({ damping: 12 });

const COPY = 84;

/** 글자가 0.8초(24프레임) 동안 40px 아래에서 떠오른다 */
const useRiseIn = (start: number) => {
  const frame = useCurrentFrame();
  return {
    opacity: interpolate(frame, [start, start + 18], [0, 1], CLAMP),
    translate: `0px ${interpolate(frame, [start, start + 24], [40, 0], { ...CLAMP, easing: rise })}px`,
  };
};

const Shade: React.FC<{ readonly background: string }> = ({ background }) => (
  <AbsoluteFill style={{ background }} />
);

// ── 샷1 0–75f 훅: 광장 한가운데 등불을 든 주인공, 3겹 패럴랙스 푸시 인 ──
const HOOK_HERO = { size: 680, cx: 960, feet: 990 };
const Shot1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 75], [0, 1], { ...CLAMP, easing: smooth });
  const face = catFace(HOOK_HERO.size, HOOK_HERO.cx, HOOK_HERO.feet);
  const origin = `${face.x}px ${face.y}px`;
  const text = useRiseIn(8);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      {/* 뒤: 가장 느리게 */}
      <AbsoluteFill
        style={{
          scale: interpolate(p, [0, 1], [1.06, 1.1]),
          translate: `${interpolate(p, [0, 1], [24, -24])}px 0px`,
          transformOrigin: origin,
        }}
      >
        <Bg name="plaza" />
      </AbsoluteFill>
      <Shade background="linear-gradient(180deg, rgba(25,10,45,0.6) 0%, rgba(25,10,45,0.15) 35%, rgba(25,10,45,0) 60%)" />
      <Sparkles count={40} color="#ffcf7a" />
      {/* 중간: 주인공 1.0 → 1.1 */}
      <AbsoluteFill style={{ scale: interpolate(p, [0, 1], [1, 1.1]), transformOrigin: origin }}>
        <HeroCat {...HOOK_HERO} />
      </AbsoluteFill>
      {/* 앞: 가장 빠르게, 살짝 흐린 소품 */}
      <AbsoluteFill
        style={{
          scale: interpolate(p, [0, 1], [1, 1.22]),
          translate: `${interpolate(p, [0, 1], [60, -60])}px 0px`,
          transformOrigin: origin,
          filter: "blur(4px) brightness(0.7)",
        }}
      >
        <Prop name="barrel" size={520} cx={190} cy={1010} />
        <Prop name="bungeoppang" size={220} cx={190} cy={800} />
        <Prop name="armchair" size={520} cx={1740} cy={1030} />
      </AbsoluteFill>
      <Caption style={{ left: 0, right: 0, top: 110, fontSize: COPY, textAlign: "center", ...text }}>
        달이 뜨면, 가게 문을 엽니다
      </Caption>
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// ── 샷2 75–165f 게임 소개: 음식 3개가 15프레임 박자로 팝 ──
const FOODS = [
  { name: "tteokbokki", cx: 930, at: 6 },
  { name: "udon", cx: 1080, at: 21 },
  { name: "ramen", cx: 1230, at: 36 },
] as const;
const Shot2Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const text = useRiseIn(42);
  const hop = (at: number) => -Math.sin(interpolate(frame, [at, at + 10], [0, Math.PI], CLAMP)) * 18;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: interpolate(frame, [0, 130], [1, 1.08], CLAMP), transformOrigin: "30% 60%" }}>
        <Bg name="plaza" />
      </AbsoluteFill>
      <Shade background="linear-gradient(90deg, rgba(25,10,45,0.1) 0%, rgba(25,10,45,0.2) 45%, rgba(25,10,45,0.62) 100%)" />
      <Sparkles count={40} color="#ffcf7a" />
      <Prop name="picnic" size={480} cx={1080} cy={900} />
      {FOODS.map((f) => (
        <Prop
          key={f.name}
          name={f.name}
          size={170}
          cx={f.cx}
          cy={760}
          style={{
            transformOrigin: "50% 90%",
            scale: interpolate(frame, [f.at, f.at + 14], [0, 1], { ...CLAMP, easing: pop, output: "perceptual-scale" }),
          }}
        />
      ))}
      <div style={{ position: "absolute", inset: 0, translate: `0px ${hop(6) + hop(21) + hop(36)}px` }}>
        <HeroCat size={740} cx={500} feet={1040} />
      </div>
      <Caption style={{ right: 140, top: 150, fontSize: COPY, lineHeight: 1.3, textAlign: "right", ...text }}>
        {"등불가게를 열고\n손님을 맞는\n야시장 게임"}
      </Caption>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// ── 샷3 165–189f 비 오는 골목 ──
const AlleyPanel: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: interpolate(frame, [0, 24], [1.04, 1.1], CLAMP) }}>
        <Bg name="alley" />
      </AbsoluteFill>
      <Rain drops={130} />
      <HeroCat size={700} cx={interpolate(frame, [0, 24], [1180, 1120], CLAMP)} feet={1030} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

const whipX = (f: number) => interpolate(f, [0, 16], [0, -1920], { ...CLAMP, easing: Easing.inOut(Easing.poly(4)) });
const Shot3Whip: React.FC = () => {
  const frame = useCurrentFrame();
  const x = whipX(frame);
  const blur = Math.min(Math.abs(whipX(frame + 1) - x) * 1.1, 200);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="trailer-whip" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <div
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: 3840,
          height: 1080,
          filter: blur > 0.5 ? "url(#trailer-whip)" : undefined,
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, overflow: "hidden" }}>
          <Sequence from={-90} layout="none">
            <Shot2Intro />
          </Sequence>
        </div>
        <div style={{ position: "absolute", left: 1920, top: 0, width: 1920, height: 1080, overflow: "hidden" }}>
          <AlleyPanel />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── 샷4 189–344f 달 다리 켄 번스, 손님 셋이 차례로 ──
const GUESTS = [
  { name: "tea", cx: 300, at: 14 },
  { name: "astronomer", cx: 640, at: 44 },
  { name: "raincoat", cx: 980, at: 74 },
] as const;
const Shot4Guests: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 155], [0, 1], CLAMP);
  const text = useRiseIn(104);
  const greet = GUESTS.reduce(
    (y, g) => y - Math.sin(interpolate(frame, [g.at + 30, g.at + 42], [0, Math.PI], CLAMP)) * 28,
    0,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#140a24", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: interpolate(t, [0, 1], [1.08, 1.22]),
          translate: `${interpolate(t, [0, 1], [60, -60])}px ${interpolate(t, [0, 1], [10, -20])}px`,
          transformOrigin: "55% 55%",
        }}
      >
        <Bg name="bridge" />
      </AbsoluteFill>
      <Shade background="linear-gradient(180deg, rgba(25,10,45,0.62) 0%, rgba(25,10,45,0.2) 30%, rgba(25,10,45,0) 55%)" />
      <Sparkles count={30} color="#ffcf7a" />
      {GUESTS.map((g) => {
        const enter = interpolate(frame, [g.at, g.at + 39], [0, 1], { ...CLAMP, easing: slideIn });
        const walk = -Math.abs(Math.sin(enter * Math.PI * 4)) * 16 * (1 - enter);
        return (
          <Character
            key={g.name}
            name={g.name}
            height={520}
            cx={interpolate(enter, [0, 1], [-320, g.cx])}
            feet={1010 + walk}
          />
        );
      })}
      <div style={{ position: "absolute", inset: 0, translate: `0px ${greet}px` }}>
        <HeroCat size={720} cx={1520} feet={1040} />
      </div>
      <Caption style={{ left: 140, top: 110, fontSize: COPY, ...text }}>오늘 밤 손님은 누구일까?</Caption>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// ── 샷5 344–434f 랙 포커스: 앞 음식 → 뒤 주인공과 손님 ──
const RACK_HERO = { size: 660, cx: 1470, feet: 990 };
const Shot5Rack: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [12, 42], [0, 1], { ...CLAMP, easing: smooth });
  const give = interpolate(frame, [40, 70], [0, 1], { ...CLAMP, easing: smooth });
  const text = useRiseIn(46);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -40,
          scale: interpolate(frame, [0, 110], [1.04, 1.1], CLAMP),
          filter: `blur(${interpolate(p, [0, 1], [12, 5])}px) brightness(0.85)`,
        }}
      >
        <Bg name="plaza" />
      </div>
      <Shade background="linear-gradient(180deg, rgba(25,10,45,0.6) 0%, rgba(25,10,45,0.15) 35%, rgba(25,10,45,0) 55%)" />
      <Sparkles count={30} color="#ffcf7a" />
      <AbsoluteFill style={{ filter: `blur(${interpolate(p, [0, 1], [14, 0])}px)` }}>
        <Character name="raincoat" height={540} cx={1020} feet={970} />
        <Prop
          name="udon"
          size={170}
          cx={interpolate(give, [0, 1], [1290, 1120])}
          cy={interpolate(give, [0, 0.5, 1], [700, 650, 720])}
        />
        <HeroCat {...RACK_HERO} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          filter: `blur(${interpolate(p, [0, 1], [0, 22])}px) brightness(${interpolate(p, [0, 1], [1, 0.8])})`,
          scale: interpolate(p, [0, 1], [1, 1.04]),
          transformOrigin: "20% 90%",
        }}
      >
        <Prop name="ramen" size={540} cx={380} cy={880} />
        <Prop name="bungeoppang" size={380} cx={720} cy={970} />
      </AbsoluteFill>
      <Caption style={{ left: 140, top: 110, fontSize: COPY, lineHeight: 1.3, ...text }}>
        {"따끈한 한 그릇으로\n단골 만들기"}
      </Caption>
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// ── 샷6 434–584f 아이리스 → 옥상 축제 엔딩 ──
const END_HERO = { size: 660, cx: 1000, feet: 1015 };
const FestivalPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = (i: number) => -Math.abs(Math.sin(((frame + i * 7) / 15) * Math.PI)) * 10;
  const titleUp = interpolate(frame, [44, 66], [1, 0], { ...CLAMP, easing: rise });
  const line = interpolate(frame, [36, 50], [0, 1], { ...CLAMP, easing: smooth });
  const sub = interpolate(frame, [68, 82], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: interpolate(frame, [0, 150], [1.1, 1.0], CLAMP), transformOrigin: "50% 40%" }}>
        <Bg name="festival" />
      </AbsoluteFill>
      <Shade background="linear-gradient(180deg, rgba(25,10,45,0.75) 0%, rgba(25,10,45,0.45) 28%, rgba(25,10,45,0) 45%)" />
      <Sparkles count={45} color="#ffcf7a" />
      <Character name="tea" height={480} cx={380} feet={990 + beat(0)} />
      <Character name="astronomer" height={500} cx={680} feet={990 + beat(1)} />
      <Character name="raincoat" height={480} cx={1330} feet={990 + beat(2)} />
      <Character
        name="firefly"
        height={260}
        cx={1620}
        feet={760 + Math.sin((frame / fps) * 2.4) * 22}
        style={{ rotate: `${Math.sin((frame / fps) * 1.8) * 6}deg`, filter: "drop-shadow(0 0 26px rgba(255,200,90,0.7))" }}
      />
      <HeroCat {...END_HERO} />
      {/* 타이틀: 금빛 마스크 선 아래에서 올라온다 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 50, height: 160, overflow: "hidden" }}>
        <Caption
          style={{
            left: 0,
            right: 0,
            top: 10,
            fontSize: 124,
            lineHeight: 1.1,
            textAlign: "center",
            translate: `0px ${titleUp * 160}px`,
          }}
        >
          달빛 고양이 야시장
        </Caption>
      </div>
      <div
        style={{
          position: "absolute",
          left: 960 - 560 * line,
          width: 1120 * line,
          top: 210,
          height: 4,
          borderRadius: 2,
          background: "linear-gradient(90deg, rgba(255,207,122,0), #ffcf7a 20%, #ffcf7a 80%, rgba(255,207,122,0))",
        }}
      />
      <Caption
        style={{
          left: 0,
          right: 0,
          top: 236,
          fontSize: 54,
          textAlign: "center",
          color: "#ffd99a",
          opacity: sub,
          translate: `0px ${(1 - sub) * 16}px`,
        }}
      >
        지금 <span style={{ color: "#ffcf7a" }}>quokkaplay.com</span>에서 플레이
      </Caption>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

const IRIS_MAX = 1300;
const Shot6Iris: React.FC = () => {
  const frame = useCurrentFrame();
  const closing = frame < 18;
  const a = catFace(RACK_HERO.size, RACK_HERO.cx, RACK_HERO.feet);
  const b = catFace(END_HERO.size, END_HERO.cx, END_HERO.feet);
  const c = closing ? a : b;
  const r = closing
    ? interpolate(frame, [0, 16], [IRIS_MAX + 700, 0], { ...CLAMP, easing: Easing.in(Easing.cubic) })
    : interpolate(frame, [20, 44], [0, IRIS_MAX + 400], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const fade = interpolate(frame, [138, 150], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0414", overflow: "hidden" }}>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${c.x}px ${c.y}px)` }}>
        {closing ? (
          <Sequence from={-90} layout="none">
            <Shot5Rack />
          </Sequence>
        ) : (
          <FestivalPanel />
        )}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: c.x - r,
          top: c.y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          boxShadow: "0 0 0 6px rgba(255,207,122,0.8), 0 0 40px 10px rgba(255,207,122,0.35)",
          opacity: r > 2 && r < IRIS_MAX + 300 ? 1 : 0,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#0d0618", opacity: fade }} />
    </AbsoluteFill>
  );
};

export const Trailer: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#1a0f2e", fontFamily: juaFont }}>
    <Sequence durationInFrames={75}>
      <Shot1Hook />
    </Sequence>
    <Sequence from={75} durationInFrames={90}>
      <Shot2Intro />
    </Sequence>
    <Sequence from={165} durationInFrames={24}>
      <Shot3Whip />
    </Sequence>
    <Sequence from={189} durationInFrames={155}>
      <Shot4Guests />
    </Sequence>
    <Sequence from={344} durationInFrames={90}>
      <Shot5Rack />
    </Sequence>
    <Sequence from={434} durationInFrames={150}>
      <Shot6Iris />
    </Sequence>
  </AbsoluteFill>
);

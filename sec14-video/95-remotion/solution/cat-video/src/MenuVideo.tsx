import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import type React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "./elements/Caption";
import { Rain } from "./elements/Rain";
import { Sparkles } from "./elements/Sparkles";
import { bgSrc, type BgName, Character, charSrc, CLAMP, HeroCat, Prop, type PropName, Vignette } from "./gallery/common";

export const MENU_SCENE_FRAMES = 110;

const SceneBg: React.FC<{
  readonly name: BgName;
  readonly top: number;
  readonly from: number;
  readonly to: number;
  readonly origin?: string;
}> = ({ name, top, from, to, origin }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Img
      src={bgSrc(name)}
      style={{
        position: "absolute",
        left: -96,
        top,
        width: 2112,
        height: 1408,
        transformOrigin: origin,
        scale: interpolate(frame, [0, 3.7 * fps], [from, to], CLAMP),
      }}
    />
  );
};

const Shade: React.FC<{ readonly background: string }> = ({ background }) => (
  <div style={{ position: "absolute", inset: 0, background }} />
);

/** 탁자 위에 스프링으로 톡 튀어나오는 음식 */
const PopFood: React.FC<{
  readonly name: PropName;
  readonly at: number;
  readonly size: number;
  readonly cx: number;
  readonly cy: number;
}> = ({ name, at, size, cx, cy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Prop
      name={name}
      size={size}
      cx={cx}
      cy={cy}
      style={{
        transformOrigin: "50% 80%",
        scale: interpolate(frame, [at * fps, (at + 0.5) * fps], [0, 1], {
          ...CLAMP,
          easing: Easing.spring({ damping: 12 }),
          output: "perceptual-scale",
        }),
      }}
    />
  );
};

const Firefly: React.FC<{ readonly size: number; readonly style?: React.CSSProperties }> = ({ size, style }) => (
  <Img
    src={charSrc("firefly")}
    style={{
      position: "absolute",
      height: size,
      filter: "drop-shadow(0 0 28px rgba(255,200,90,0.7))",
      ...style,
    }}
  />
);

// 1. 골목 오프닝: 주인공이 걸어 들어오고 오른쪽에 타이틀
const MenuOpening = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e" }}>
      <SceneBg name="alley" top={-164} from={1} to={1.08} />
      <Shade background="linear-gradient(90deg, rgba(25,10,45,0.15) 0%, rgba(25,10,45,0.1) 45%, rgba(25,10,45,0.6) 100%)" />
      <Rain drops={140} />
      <Firefly
        size={220}
        style={{
          left: 780,
          top: 540 + Math.sin(t * 3) * 22,
          rotate: `${Math.sin(t * 2.2) * 6}deg`,
          translate: interpolate(frame, [0.3 * fps, 2.4 * fps], ["-700px 200px", "0px 0px"], {
            ...CLAMP,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }),
        }}
      />
      <HeroCat
        size={800}
        cx={500}
        feet={1040}
        style={{
          top: -Math.abs(Math.sin(frame * 0.42)) * interpolate(frame, [0, 2.2 * fps], [20, 0], CLAMP),
          translate: interpolate(frame, [0, 2.2 * fps], ["-900px 0px", "0px 0px"], {
            ...CLAMP,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }),
        }}
      />
      <Caption
        style={{
          right: 140,
          top: 300,
          fontSize: 132,
          lineHeight: 1.1,
          textAlign: "right",
          opacity: interpolate(frame, [0.8 * fps, 1.6 * fps], [0, 1], CLAMP),
          translate: interpolate(frame, [0.8 * fps, 1.8 * fps], ["0px 40px", "0px 0px"], {
            ...CLAMP,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        오늘의 메뉴
      </Caption>
      <Caption
        style={{
          right: 146,
          top: 480,
          fontSize: 54,
          textAlign: "right",
          color: "#ffd99a",
          opacity: interpolate(frame, [1.4 * fps, 2.2 * fps], [0, 1], CLAMP),
        }}
      >
        따끈한 야식이 기다려요
      </Caption>
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// 2. 광장 가게: 손님이 오고 탁자 위에 붕어빵·떡볶이, 주인공 말풍선
const MenuShop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hop =
    frame > 0.7 * fps && frame < 1.2 * fps ? Math.sin(((frame - 0.7 * fps) / (0.5 * fps)) * Math.PI) * 40 : 0;

  const coin = (at: number, cx: number, cy: number, dx: number, spin: [number, number]) => (
    <Prop
      name="coin"
      size={110}
      cx={cx}
      cy={cy}
      style={{
        translate: interpolate(frame, [at * fps, (at + 1) * fps], ["0px 0px", `${dx}px -260px`], {
          ...CLAMP,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        opacity: interpolate(frame, [at * fps, (at + 0.2) * fps, (at + 1.1) * fps, (at + 1.5) * fps], [0, 1, 1, 0], CLAMP),
        rotate: interpolate(frame, [at * fps, (at + 1.5) * fps], [`${spin[0]}deg`, `${spin[1]}deg`], CLAMP),
      }}
    />
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e" }}>
      <SceneBg name="plaza" top={-230} from={1.08} to={1} />
      <Shade background="linear-gradient(90deg, rgba(25,10,45,0.15) 0%, rgba(25,10,45,0.1) 50%, rgba(25,10,45,0.4) 100%)" />
      <Sparkles count={40} color="#ffcf7a" />
      <Character
        name="astronomer"
        height={540}
        cx={400}
        feet={1040}
        style={{
          translate: interpolate(frame, [0.3 * fps, 1.6 * fps], ["-700px 0px", "0px 0px"], {
            ...CLAMP,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }),
        }}
      />
      <Prop name="cafeTable" size={480} cx={940} cy={830} />
      <PopFood name="bungeoppang" at={1} size={210} cx={865} cy={665} />
      <PopFood name="tteokbokki" at={1.3} size={210} cx={1025} cy={675} />
      {coin(1.9, 720, 640, -30, [-20, 20])}
      {coin(2.2, 840, 610, 20, [15, -15])}
      <HeroCat size={780} cx={1490} feet={1050} style={{ top: -hop }} />
      <Caption
        style={{
          left: 1110,
          top: 110,
          padding: "26px 44px",
          borderRadius: 48,
          backgroundColor: "rgba(255,248,232,0.94)",
          color: "#4a2a5e",
          textShadow: "none",
          boxShadow: "0 10px 40px rgba(40,10,60,0.45)",
          fontSize: 60,
          lineHeight: 1.2,
          textAlign: "center",
          transformOrigin: "70% 100%",
          scale: interpolate(frame, [0.7 * fps, 1.1 * fps], [0, 1], {
            ...CLAMP,
            easing: Easing.spring({ damping: 14 }),
            output: "perceptual-scale",
          }),
        }}
      >
        {"붕어빵이랑 떡볶이\n갓 나왔어요!"}
      </Caption>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// 3. 옥상 축제 엔딩: 우동·라멘이 놓이고 엔딩 타이틀, 암전
const MenuEnding = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e" }}>
      <SceneBg name="festival" top={-120} from={1} to={1.1} origin="50% 30%" />
      <Shade background="linear-gradient(90deg, rgba(25,10,45,0) 0%, rgba(25,10,45,0.15) 50%, rgba(25,10,45,0.6) 100%)" />
      <Sparkles count={45} color="#ffcf7a" />
      <Prop name="barrel" size={400} cx={1330} cy={870} />
      <PopFood name="udon" at={0.4} size={180} cx={1255} cy={720} />
      <PopFood name="ramen" at={0.7} size={180} cx={1405} cy={725} />
      <Firefly
        size={180}
        style={{
          left: 560 + Math.cos(t * 2.2) * 300,
          top: 470 + Math.sin(t * 2.2) * 80,
        }}
      />
      <HeroCat
        size={800}
        cx={620}
        feet={1050}
        style={{
          transformOrigin: "620px 1050px",
          scale: interpolate(frame, [0, 0.8 * fps], [0.92, 1], {
            ...CLAMP,
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Caption
        style={{
          right: 150,
          top: 220,
          fontSize: 118,
          lineHeight: 1.15,
          textAlign: "right",
          opacity: interpolate(frame, [0.8 * fps, 1.6 * fps], [0, 1], CLAMP),
          translate: interpolate(frame, [0.8 * fps, 1.8 * fps], ["0px 40px", "0px 0px"], {
            ...CLAMP,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {"따끈할 때\n드시러 오세요"}
      </Caption>
      <Vignette strength={0.5} />
      <AbsoluteFill
        style={{
          backgroundColor: "#0d0618",
          opacity: interpolate(frame, [3 * fps, 3.65 * fps], [0, 1], CLAMP),
        }}
      />
    </AbsoluteFill>
  );
};

/** 「오늘의 메뉴」 10초: 110 × 3 − 15 × 2 = 300프레임 */
export const MenuVideo = () => {
  const { fps } = useVideoConfig();
  const transition = (
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-right" })}
      timing={linearTiming({ durationInFrames: 0.5 * fps })}
    />
  );

  return (
    <TransitionSeries style={{ backgroundColor: "#1a0f2e" }}>
      <TransitionSeries.Sequence name="Opening" durationInFrames={MENU_SCENE_FRAMES}>
        <MenuOpening />
      </TransitionSeries.Sequence>
      {transition}
      <TransitionSeries.Sequence name="Shop" durationInFrames={MENU_SCENE_FRAMES}>
        <MenuShop />
      </TransitionSeries.Sequence>
      {transition}
      <TransitionSeries.Sequence name="Ending" durationInFrames={MENU_SCENE_FRAMES}>
        <MenuEnding />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

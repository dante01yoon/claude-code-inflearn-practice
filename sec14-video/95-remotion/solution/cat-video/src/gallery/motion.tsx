import type React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { juaFont } from "../fonts";
import { Bg, bgSrc, CLAMP, HeroCat, Prop, propSrc, Vignette, type PropName } from "./common";

// 08 스프링 등장: 소품들이 차례로 튀어나오고, 마지막에 고양이가 떨어져 찌그러졌다 튕기며 안착한다.
const SPRING_PROPS: { name: PropName; cx: number; cy: number; size: number; at: number }[] = [
  { name: "coin", cx: 380, cy: 760, size: 230, at: 4 },
  { name: "gem", cx: 1560, cy: 740, size: 240, at: 12 },
  { name: "bungeoppang", cx: 560, cy: 960, size: 220, at: 20 },
  { name: "ramen", cx: 1400, cy: 960, size: 230, at: 28 },
];
const CAT_DROP_AT = 44;

export const SpringEntrance: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - CAT_DROP_AT, fps, config: { damping: 7, stiffness: 140, mass: 0.8 } });
  // s < 1: 공중, s > 1: 착지 후 눌림
  const lift = Math.max(0, 1 - s) * 900;
  const squash = Math.max(0, s - 1);
  const scaleY = 1 - squash * 0.9;
  const scaleX = 1 + squash * 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <Bg name="festival" />
      <Vignette strength={0.45} />
      {SPRING_PROPS.map((p) => {
        const ps = spring({ frame: frame - p.at, fps, config: { damping: 8, stiffness: 180 } });
        return <Prop key={p.name} name={p.name} size={p.size} cx={p.cx} cy={p.cy} style={{ scale: ps, transformOrigin: "50% 90%" }} />;
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: `0 ${-lift}px`,
          scale: `${scaleX} ${scaleY}`,
          transformOrigin: "960px 1030px",
          opacity: frame < CAT_DROP_AT ? 0 : 1,
        }}
      >
        <HeroCat size={680} cx={960} feet={1030} shadow={false} />
      </div>
      {/* 떨어지는 높이에 따라 줄어드는 그림자 */}
      <div
        style={{
          position: "absolute",
          left: 960 - 150,
          top: 1030 - 24,
          width: 300,
          height: 48,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(10,0,25,0.6) 0%, rgba(10,0,25,0) 70%)",
          scale: frame < CAT_DROP_AT ? 0 : interpolate(lift, [0, 900], [1, 0.3], CLAMP),
        }}
      />
    </AbsoluteFill>
  );
};

// 09 리딩 홀드: 말풍선 글자가 타이핑된 뒤, 읽을 시간 동안 그대로 멈춰 있다.
const HOLD_TEXT = "어서 오세요!\n오늘 밤 등불가게가\n문을 열었어요.";
const TYPE_START = 6;
const TYPE_END = 32;
const HOLD_END = 90;
export const ReadingHold: React.FC = () => {
  const frame = useCurrentFrame();
  const chars = Math.round(interpolate(frame, [TYPE_START, TYPE_END], [0, HOLD_TEXT.length], CLAMP));
  const hold = interpolate(frame, [TYPE_END, HOLD_END], [0, 1], CLAMP);
  const out = interpolate(frame, [HOLD_END, 102], [1, 0], { ...CLAMP, easing: Easing.in(Easing.cubic) });
  const bubbleIn = interpolate(frame, [0, 8], [0, 1], { ...CLAMP, easing: Easing.out(Easing.back(2)) });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <Bg name="platform" style={{ filter: "brightness(0.8)" }} />
      <Vignette strength={0.5} />
      <HeroCat size={700} cx={520} feet={1050} />
      <div
        style={{
          position: "absolute",
          left: 880,
          top: 250,
          width: 860,
          padding: "50px 60px 70px",
          borderRadius: 48,
          background: "#fff8ea",
          boxShadow: "0 20px 60px rgba(20,0,40,0.5)",
          scale: bubbleIn * (0.85 + 0.15 * out),
          opacity: out,
          transformOrigin: "0% 80%",
        }}
      >
        <div style={{ fontFamily: juaFont, fontSize: 84, lineHeight: 1.3, color: "#3b2552", whiteSpace: "pre", minHeight: 330 }}>
          {HOLD_TEXT.slice(0, chars)}
        </div>
        {/* 읽는 시간(홀드)을 보여주는 바 */}
        <div style={{ position: "absolute", left: 60, right: 60, bottom: 34, height: 10, borderRadius: 5, background: "rgba(59,37,82,0.15)" }}>
          <div style={{ width: `${hold * 100}%`, height: "100%", borderRadius: 5, background: "#f0a040" }} />
        </div>
        {/* 말꼬리 */}
        <div
          style={{
            position: "absolute",
            left: -40,
            bottom: 90,
            width: 0,
            height: 0,
            borderTop: "30px solid transparent",
            borderBottom: "30px solid transparent",
            borderRight: "60px solid #fff8ea",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// 14 스크린 스튜디오 줌: 앱 화면에서 커서가 향하는 곳으로 부드럽게 확대했다가 원래대로 돌아온다.
const MENU: { name: PropName; label: string; price: number }[] = [
  { name: "bungeoppang", label: "붕어빵", price: 3 },
  { name: "tteokbokki", label: "떡볶이", price: 5 },
  { name: "udon", label: "우동", price: 6 },
  { name: "ramen", label: "라멘", price: 7 },
  { name: "gem", label: "달 보석", price: 20 },
  { name: "coin", label: "발바닥 동전", price: 1 },
];
const WIN = { x: 210, y: 110, w: 1500, h: 880 };
const CARD_W = 270;
const CARD_H = 300;
const GRID_X = WIN.x + 640;
const GRID_Y = WIN.y + 150;
const GAP = 30;
// 확대할 대상: 첫 번째 카드(붕어빵)
const FOCUS = { x: GRID_X + CARD_W / 2, y: GRID_Y + CARD_H / 2 };
const CLICK_AT = 48;
const ZOOM = 2.3;

const Cursor: React.FC<{ readonly x: number; readonly y: number; readonly press: number }> = ({ x, y, press }) => (
  <svg width={44} height={56} viewBox="0 0 22 28" style={{ position: "absolute", left: x - 4, top: y - 2, scale: 1 - press * 0.15, transformOrigin: "4px 2px" }}>
    <path d="M2 1 L2 22 L7.5 17 L11 26 L14.5 24.5 L11 16 L18 16 Z" fill="#fff" stroke="#111" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

export const ScreenStudioZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const zoomIn = interpolate(frame, [16, 40], [0, 1], { ...CLAMP, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const zoomOut = interpolate(frame, [74, 98], [0, 1], { ...CLAMP, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const z = zoomIn - zoomOut;
  const s = interpolate(z, [0, 1], [1, ZOOM]);
  const cx = interpolate(z, [0, 1], [960, FOCUS.x]);
  const cy = interpolate(z, [0, 1], [540, FOCUS.y]);

  const move = interpolate(frame, [6, 36], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });
  const curX = interpolate(move, [0, 1], [1300, FOCUS.x + 30]);
  const curY = interpolate(move, [0, 1], [820, FOCUS.y + 40]);
  const press = interpolate(frame, [CLICK_AT - 3, CLICK_AT, CLICK_AT + 4], [0, 1, 0], CLAMP);
  const ripple = interpolate(frame, [CLICK_AT, CLICK_AT + 18], [0, 1], CLAMP);
  const picked = frame >= CLICK_AT;
  const toast = interpolate(frame, [CLICK_AT + 2, CLICK_AT + 10], [0, 1], { ...CLAMP, easing: Easing.out(Easing.back(2)) });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #3a1d5c 0%, #7a3d6e 55%, #e0925a 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${960 - cx * s}px, ${540 - cy * s}px) scale(${s})` }}>
        <div
          style={{
            position: "absolute",
            left: WIN.x,
            top: WIN.y,
            width: WIN.w,
            height: WIN.h,
            borderRadius: 24,
            overflow: "hidden",
            background: "#fdf6ea",
            boxShadow: "0 40px 100px rgba(20,0,40,0.55)",
          }}
        >
          <div style={{ height: 64, background: "#efe3d0", display: "flex", alignItems: "center", gap: 14, paddingLeft: 26 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
            ))}
            <div style={{ marginLeft: 30, fontFamily: juaFont, fontSize: 30, color: "#6b5580" }}>달빛 야시장 — 등불가게 주문</div>
          </div>
          <div style={{ position: "absolute", left: 30, top: 94, width: 570, height: 756, borderRadius: 20, overflow: "hidden" }}>
            <Img src={bgSrc("alley")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
            <HeroCat size={560} cx={285} feet={740} />
          </div>
          <div style={{ position: "absolute", left: 640, top: 90, fontFamily: juaFont, fontSize: 40, color: "#3b2552" }}>오늘의 메뉴</div>
        </div>
        {MENU.map((m, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const active = i === 0 && picked;
          return (
            <div
              key={m.name}
              style={{
                position: "absolute",
                left: GRID_X + col * (CARD_W + GAP),
                top: GRID_Y + row * (CARD_H + GAP),
                width: CARD_W,
                height: CARD_H,
                borderRadius: 22,
                background: active ? "#ffe9c4" : "#ffffff",
                border: active ? "4px solid #f0a040" : "4px solid #eadfcf",
                boxSizing: "border-box",
                fontFamily: juaFont,
                color: "#3b2552",
                textAlign: "center",
              }}
            >
              <Img src={propSrc(m.name)} style={{ width: 180, height: 180, marginTop: 14 }} />
              <div style={{ fontSize: 34 }}>{m.label}</div>
              <div style={{ fontSize: 28, color: "#c0782c" }}>🐾 {m.price}</div>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: GRID_X - 10,
            top: GRID_Y + CARD_H + 12,
            padding: "12px 24px",
            borderRadius: 16,
            background: "#3b2552",
            color: "#fff6e0",
            fontFamily: juaFont,
            fontSize: 30,
            opacity: toast,
            scale: 0.6 + 0.4 * toast,
            transformOrigin: "50% 0%",
          }}
        >
          장바구니에 붕어빵 +1
        </div>
        <div
          style={{
            position: "absolute",
            left: curX - 60,
            top: curY - 60,
            width: 120,
            height: 120,
            borderRadius: 60,
            border: "5px solid #f0a040",
            opacity: frame >= CLICK_AT ? 1 - ripple : 0,
            scale: 0.3 + ripple,
          }}
        />
        <Cursor x={curX} y={curY} press={press} />
      </div>
    </AbsoluteFill>
  );
};

// 15 비트 싱크: 15프레임(120BPM)마다 소품이 하나씩 팝 하고 등장한다.
const BEAT = 15;
const BEAT_PROPS: { name: PropName; cx: number; cy: number }[] = [
  { name: "coin", cx: 330, cy: 520 },
  { name: "bungeoppang", cx: 560, cy: 820 },
  { name: "tteokbokki", cx: 1360, cy: 820 },
  { name: "gem", cx: 1590, cy: 520 },
  { name: "udon", cx: 420, cy: 270 },
  { name: "ramen", cx: 1500, cy: 270 },
  { name: "stool", cx: 960, cy: 230 },
];

export const BeatSync: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beatIndex = Math.floor(frame / BEAT);
  const sinceBeat = frame % BEAT;
  const pulse = interpolate(sinceBeat, [0, 6], [1, 0], { ...CLAMP, easing: Easing.out(Easing.quad) });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f2e", overflow: "hidden" }}>
      <Bg name="festival" style={{ filter: `brightness(${0.55 + pulse * 0.25})` }} />
      <Vignette strength={0.55} />
      <div style={{ position: "absolute", inset: 0, scale: `${1 + pulse * 0.04} ${1 - pulse * 0.04}`, transformOrigin: "960px 1010px" }}>
        <HeroCat size={600} cx={960} feet={1010} />
      </div>
      {BEAT_PROPS.map((p, i) => {
        const s = spring({ frame: frame - i * BEAT, fps, config: { damping: 9, stiffness: 260 } });
        const ring = interpolate(frame - i * BEAT, [0, 12], [0, 1], CLAMP);
        return (
          <div key={p.name}>
            <div
              style={{
                position: "absolute",
                left: p.cx - 130,
                top: p.cy - 130,
                width: 260,
                height: 260,
                borderRadius: "50%",
                border: "6px solid #ffcf7a",
                opacity: frame >= i * BEAT ? 1 - ring : 0,
                scale: 0.5 + ring,
              }}
            />
            <Prop name={p.name} size={230} cx={p.cx} cy={p.cy} style={{ scale: s }} />
          </div>
        );
      })}
      {/* 박자 표시 */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center", gap: 28 }}>
        {BEAT_PROPS.map((p, i) => (
          <div
            key={p.name}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              background: i <= beatIndex ? "#ffcf7a" : "rgba(255,246,224,0.25)",
              scale: i === beatIndex ? 1 + pulse * 0.6 : 1,
              boxShadow: i === beatIndex ? `0 0 ${30 * pulse}px #ffcf7a` : undefined,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { C, CLAMP, EASE_OUT, FONT, asset, prog } from "../gallery/theme";
import { Pt, cubic, cutPoly, polyLength, toD } from "../gallery/path";

// 등불가게 검은 고양이가 친구 메시지를 받고 달 다리로 가서 등불 축제를 연다 (25초)
export const STORY_FPS = 30;
export const STORY_FRAMES = 25 * STORY_FPS;

const W = 1080;
const H = 1920;
const IMG_W = 1536;
const IMG_H = 1024;
const SPRING = Easing.spring({ damping: 11, stiffness: 180 });

// 장면 시작·길이. 앞 장면과 8프레임씩 겹쳐서 페이드로 넘긴다
const S1 = { from: 0, dur: 113 };
const S2 = { from: 105, dur: 203 };
const S3 = { from: 300, dur: 188 };
const S4 = { from: 480, dur: STORY_FRAMES - 480 };
const S5 = { from: 630, dur: STORY_FRAMES - 630 };

// 배경 그림의 한 점(fx, fy)이 화면의 (sx, sy)에 오도록 z배로 깐다. 빈틈이 생기지 않게 가장자리는 잡아 둔다
const Bg: React.FC<{
  src: string;
  z?: number;
  fx?: number;
  fy?: number;
  sx?: number;
  sy?: number;
  darkness?: number;
  drift?: number;
  dur: number;
}> = ({ src, z = H / IMG_H, fx = IMG_W / 2, fy = IMG_H / 2, sx = W / 2, sy = H / 2, darkness = 0.4, drift = 0.06, dur }) => {
  const frame = useCurrentFrame();
  const zz = z * interpolate(frame, [0, dur], [1, 1 + drift], CLAMP);
  const left = Math.min(0, Math.max(W - IMG_W * zz, sx - fx * zz));
  const top = Math.min(0, Math.max(H - IMG_H * zz, sy - fy * zz));
  return (
    <AbsoluteFill style={{ backgroundColor: C.night, overflow: "hidden" }}>
      <Img
        src={asset(`backgrounds/${src}`)}
        style={{ position: "absolute", left, top, width: IMG_W * zz, height: IMG_H * zz }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(20,16,43,${darkness + 0.2}) 0%, rgba(20,16,43,${darkness}) 40%, rgba(20,16,43,${darkness + 0.25}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(frame, [0, 8], [0, 1], CLAMP) }}>{children}</AbsoluteFill>;
};

// 장면 하단 자막 상자
const Caption: React.FC<{ children: React.ReactNode; top: number; start?: number }> = ({ children, top, start = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top,
        padding: "30px 40px",
        borderRadius: 32,
        backgroundColor: "rgba(20,16,43,0.82)",
        border: `3px solid ${C.gold}`,
        color: C.cream,
        fontFamily: FONT,
        fontSize: 60,
        fontWeight: 800,
        lineHeight: 1.3,
        textAlign: "center",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        opacity: interpolate(frame, [start, start + 8], [0, 1], CLAMP),
        translate: `0px ${interpolate(frame, [start, start + 12], [30, 0], { ...CLAMP, easing: EASE_OUT })}px`,
      }}
    >
      {children}
    </div>
  );
};

// 타자기: 한 글자씩 찍고 커서를 깜박인다
const typed = (text: string, frame: number, start: number, perChar: number) => {
  const chars = Array.from(text);
  const count = Math.max(0, Math.min(chars.length, Math.floor((frame - start) / perChar)));
  return { text: chars.slice(0, count).join(""), done: count >= chars.length };
};

const Cursor: React.FC<{ on: boolean; height: number; color?: string }> = ({ on, height, color = C.pink }) => (
  <span
    style={{
      display: "inline-block",
      width: 8,
      height,
      marginLeft: 6,
      verticalAlign: "middle",
      backgroundColor: color,
      opacity: on ? 1 : 0,
    }}
  />
);

/* ───────── 1. 등불가게: 고양이에게 알림이 온다 ───────── */
const NOTIFY = 50;

const SceneShop: React.FC = () => {
  const frame = useCurrentFrame();
  const titleP = prog(frame, 4, 22);
  // 알림이 오면 화들짝 뛰어오른다
  const jump = interpolate(frame, [NOTIFY + 4, NOTIFY + 10, NOTIFY + 18], [0, -70, 0], {
    ...CLAMP,
    easing: Easing.inOut(Easing.quad),
  });
  const idle = Math.sin(frame / 9) * 6;
  const banner = interpolate(frame, [NOTIFY, NOTIFY + 12], [-260, 0], { ...CLAMP, easing: SPRING });
  const buzz = frame >= NOTIFY && frame < NOTIFY + 16 ? Math.sin(frame * 2.4) * 6 : 0;

  return (
    <AbsoluteFill>
      <Bg src="246-rainy-lantern-alley.png" fx={900} darkness={0.3} dur={S1.dur} />
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT,
          color: C.cream,
          opacity: titleP,
          translate: `0px ${(1 - titleP) * 40}px`,
          textShadow: "0 6px 24px rgba(0,0,0,0.7)",
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 700, color: C.gold }}>비 오는 밤, 등불 골목</div>
        <div style={{ fontSize: 110, fontWeight: 900, lineHeight: 1.2 }}>등불가게 고양이</div>
      </div>
      <Img
        src={asset("characters/003_lantern_shopkeeper.png")}
        style={{
          position: "absolute",
          left: (W - 640) / 2,
          top: 840,
          width: 640,
          translate: `0px ${idle + jump}px`,
        }}
      />
      {/* 놀람 표시 */}
      <div
        style={{
          position: "absolute",
          left: 690,
          top: 840,
          fontFamily: FONT,
          fontSize: 150,
          fontWeight: 900,
          color: C.gold,
          textShadow: "0 0 30px rgba(255,200,87,0.8)",
          scale: interpolate(frame, [NOTIFY + 4, NOTIFY + 12], [0, 1], { ...CLAMP, easing: SPRING }),
          rotate: "12deg",
        }}
      >
        !
      </div>
      {/* 메신저 알림 배너 */}
      <div
        style={{
          position: "absolute",
          top: 290 + banner,
          left: 60,
          right: 60,
          height: 170,
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: "0 32px",
          borderRadius: 40,
          backgroundColor: "rgba(255,250,240,0.96)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          fontFamily: FONT,
          color: C.night,
          opacity: frame >= NOTIFY ? 1 : 0,
          translate: `${buzz}px 0px`,
        }}
      >
        <Img
          src={asset("characters/054_lantern_firefly_companion.png")}
          style={{ width: 110, height: 110, borderRadius: 30, objectFit: "cover", backgroundColor: C.lavender }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#6B5F86" }}>반딧불 친구 · 지금</div>
          <div style={{ fontSize: 54, fontWeight: 800 }}>큰일 났어!! 달 다리가…</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────── 2. 메신저 대화 ───────── */
type Msg = { me: boolean; text?: string; sticker?: boolean; at: number };
const REPLY = "걱정 마! 등불 챙겨서 갈게";
const REPLY_START = 66;
const REPLY_PER_CHAR = 2.2;
const REPLY_SENT = REPLY_START + Math.ceil(Array.from(REPLY).length * REPLY_PER_CHAR) + 10;
const MESSAGES: Msg[] = [
  { me: false, text: "큰일 났어!!", at: 8 },
  { me: false, text: "달 다리 등불이 전부 꺼졌어", at: 24 },
  { me: false, text: "오늘 밤 축제인데 어떡해 ㅠㅠ", at: 42 },
  { me: true, text: REPLY, at: REPLY_SENT },
  { me: false, text: "달 다리에서 기다릴게!", at: REPLY_SENT + 30 },
  { me: true, sticker: true, at: REPLY_SENT + 46 },
];
const TYPING_FROM = REPLY_SENT + 10;

const Bubble: React.FC<{ m: Msg }> = ({ m }) => {
  const frame = useCurrentFrame();
  const pop = {
    transformOrigin: m.me ? "right bottom" : "left bottom",
    scale: interpolate(frame, [m.at, m.at + 10], [0.3, 1], { ...CLAMP, easing: SPRING }),
    opacity: interpolate(frame, [m.at, m.at + 4], [0, 1], CLAMP),
  } as const;
  if (m.sticker) {
    return (
      <div style={{ alignSelf: "flex-end", ...pop }}>
        <Img src={asset("characters/003_lantern_shopkeeper.png")} style={{ height: 250, display: "block" }} />
      </div>
    );
  }
  return (
    <div
      style={{
        alignSelf: m.me ? "flex-end" : "flex-start",
        maxWidth: 700,
        padding: "22px 34px",
        borderRadius: 38,
        borderBottomLeftRadius: m.me ? 38 : 8,
        borderBottomRightRadius: m.me ? 8 : 38,
        backgroundColor: m.me ? C.gold : "#FFFFFF",
        color: C.night,
        fontSize: 50,
        fontWeight: 700,
        lineHeight: 1.3,
        boxShadow: "0 6px 16px rgba(20,16,43,0.15)",
        ...pop,
      }}
    >
      {m.text}
    </div>
  );
};

const TypingDots: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        alignSelf: "flex-start",
        display: "flex",
        gap: 14,
        padding: "30px 34px",
        borderRadius: 38,
        borderBottomLeftRadius: 8,
        backgroundColor: "#FFFFFF",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: C.lavender,
            translate: `0px ${-Math.max(0, Math.sin((frame - i * 4) / 3)) * 12}px`,
          }}
        />
      ))}
    </div>
  );
};

const SceneChat: React.FC = () => {
  const frame = useCurrentFrame();
  const reply = typed(REPLY, frame, REPLY_START, REPLY_PER_CHAR);
  const inputText = frame < REPLY_SENT ? reply.text : "";
  const friendReplyAt = MESSAGES[4].at;
  const showDots = frame >= TYPING_FROM && frame < friendReplyAt;
  const sendPulse = interpolate(frame, [REPLY_SENT - 6, REPLY_SENT - 2, REPLY_SENT + 2], [1, 1.25, 1], CLAMP);

  return (
    <AbsoluteFill>
      <Bg src="246-rainy-lantern-alley.png" fx={900} darkness={0.55} drift={0.02} dur={S2.dur} />
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 280,
          bottom: 300,
          borderRadius: 52,
          overflow: "hidden",
          backgroundColor: "#EDE6F7",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          fontFamily: FONT,
          scale: interpolate(frame, [0, 12], [0.92, 1], { ...CLAMP, easing: EASE_OUT }),
        }}
      >
        <div
          style={{
            height: 160,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "0 36px",
            backgroundColor: C.night,
          }}
        >
          <Img
            src={asset("characters/054_lantern_firefly_companion.png")}
            style={{ width: 100, height: 100, borderRadius: 50, objectFit: "cover", backgroundColor: C.lavender }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: C.cream }}>반딧불 친구</div>
            <div style={{ fontSize: 34, fontWeight: 600, color: C.mint }}>● 달 다리에서 접속 중</div>
          </div>
        </div>
        {/* 새 말풍선이 아래에 붙고 위의 것은 밀려 올라간다 */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            padding: "30px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 24,
          }}
        >
          {MESSAGES.filter((m) => frame >= m.at).map((m) => (
            <Bubble key={m.at} m={m} />
          ))}
          {showDots && <TypingDots />}
        </div>
        {/* 입력창: 답장이 타자기로 찍힌 뒤 전송된다 */}
        <div
          style={{
            height: 140,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "0 28px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 92,
              display: "flex",
              alignItems: "center",
              padding: "0 30px",
              borderRadius: 46,
              backgroundColor: "#F3EEF9",
              fontSize: 44,
              fontWeight: 600,
              color: inputText ? C.night : "#A79DBB",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {inputText || "메시지 입력"}
            {frame >= REPLY_START - 10 && frame < REPLY_SENT && (
              <Cursor on={!reply.done || Math.floor(frame / 8) % 2 === 0} height={52} />
            )}
          </div>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 46,
              backgroundColor: inputText ? C.gold : "#D8D0E6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 900,
              color: C.night,
              scale: sendPulse,
            }}
          >
            ↑
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────── 3. 달 다리까지 경로 따라가기 ───────── */
const ROUTE: Pt[] = [
  ...cubic([820, 1330], [980, 1180], [880, 1040], [600, 1000]),
  ...cubic([600, 1000], [260, 950], [200, 840], [540, 730]),
];
const ROUTE_LEN = polyLength(ROUTE);
const WALK_START = 14;
const WALK_END = 140;

const SceneRoute: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [WALK_START, WALK_END], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });
  const cut = cutPoly(ROUTE, ROUTE_LEN * p);
  const [x, y] = cut.tip;
  const facingLeft = Math.abs(cut.angle) > 90;
  // 멀어질수록 작아져서 다리 쪽으로 걸어 들어가는 느낌을 준다
  const size = interpolate(p, [0, 1], [300, 170]);
  const walking = frame > WALK_START && frame < WALK_END;
  const hop = walking ? -Math.abs(Math.sin(frame * 0.5)) * 16 : 0;
  const caption = typed("등불 한 아름 챙겨서\n달 다리까지 달려가자!", frame, 6, 2);
  const arrived = frame >= WALK_END;

  return (
    <AbsoluteFill>
      <Bg src="250-alley-moon-bridge.png" fx={470} fy={300} darkness={0.35} dur={S3.dur} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={toD(ROUTE)} stroke="rgba(255,244,220,0.7)" strokeWidth={10} strokeDasharray="4 26" strokeLinecap="round" fill="none" />
        <path
          d={toD(cut.pts)}
          stroke={C.gold}
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ filter: "drop-shadow(0 0 12px rgba(255,200,87,0.9))" }}
        />
        <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r={20} fill={C.pink} />
      </svg>
      {/* 목적지 핀 */}
      <div
        style={{
          position: "absolute",
          left: 540 - 130,
          top: 330,
          width: 260,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 48,
          fontWeight: 900,
          color: C.night,
          scale: arrived ? interpolate(frame, [WALK_END, WALK_END + 6, WALK_END + 12], [1, 1.2, 1], CLAMP) : 1,
        }}
      >
        <div style={{ display: "inline-block", padding: "12px 30px", borderRadius: 30, backgroundColor: C.gold, boxShadow: "0 0 30px rgba(255,200,87,0.8)" }}>
          달 다리
        </div>
        <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderTop: `24px solid ${C.gold}` }} />
      </div>
      <Img
        src={asset("characters/003_lantern_shopkeeper.png")}
        style={{
          position: "absolute",
          left: x - size / 2,
          top: y - size * 1.4,
          width: size,
          scale: `${facingLeft ? -1 : 1} 1`,
          translate: `0px ${hop}px`,
        }}
      />
      <Caption top={1400}>
        <div style={{ whiteSpace: "pre-wrap", minHeight: 156 }}>
          {caption.text}
          <Cursor on={!caption.done || Math.floor(frame / 8) % 2 === 0} height={64} />
        </div>
      </Caption>
    </AbsoluteFill>
  );
};

/* ───────── 4. 반딧불이 줄을 그리며 등불을 밝힌다 ───────── */
const GARLANDS: Pt[][] = [
  cubic([-40, 640], [300, 860], [780, 860], [1120, 640]),
  cubic([-40, 920], [300, 1140], [780, 1140], [1120, 920]),
];
const G_LENGTHS = GARLANDS.map(polyLength);
const G_TOTAL = G_LENGTHS.reduce((a, b) => a + b, 0);
const DRAW_START = 12;
const DRAW_END = 110;
// 줄마다 등불 5개. 줄을 따라 그어진 길이가 등불 위치를 지나면 불이 켜진다
const LANTERNS = GARLANDS.flatMap((pts, gi) =>
  [0.14, 0.32, 0.5, 0.68, 0.86].map((t, li) => {
    const along = G_LENGTHS[gi] * t;
    const before = G_LENGTHS.slice(0, gi).reduce((a, b) => a + b, 0);
    return { pos: cutPoly(pts, along).tip, at: before + along, color: (gi + li) % 2 ? C.pink : C.gold };
  }),
);

const Lantern: React.FC<{ x: number; y: number; lit: number; color: string }> = ({ x, y, lit, color }) => (
  <div style={{ position: "absolute", left: x - 36, top: y, width: 72, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ width: 4, height: 30, backgroundColor: "rgba(255,244,220,0.7)" }} />
    <div
      style={{
        width: 72,
        height: 92,
        borderRadius: 30,
        border: "5px solid #5A3A2A",
        backgroundColor: lit > 0 ? color : "#3B3352",
        boxShadow: lit > 0 ? `0 0 ${50 * lit}px ${16 * lit}px ${color}` : "none",
        scale: lit > 0 ? interpolate(lit, [0, 0.5, 1], [0.7, 1.15, 1]) : 1,
      }}
    />
  </div>
);

const SceneLights: React.FC = () => {
  const frame = useCurrentFrame();
  const drawn = G_TOTAL * interpolate(frame, [DRAW_START, DRAW_END], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.quad) });
  let left = drawn;
  let tip: Pt = GARLANDS[0][0];
  const paths = GARLANDS.map((pts, i) => {
    if (left <= 0) return null;
    const cut = cutPoly(pts, Math.min(left, G_LENGTHS[i]));
    left -= G_LENGTHS[i];
    tip = cut.tip;
    return <path key={i} d={toD(cut.pts)} />;
  });
  const litCount = LANTERNS.filter((l) => drawn >= l.at).length;
  // 불이 켜질수록 화면이 밝아진다
  const darkness = interpolate(litCount, [0, LANTERNS.length], [0.6, 0.15]);
  const drawing = frame >= DRAW_START && drawn < G_TOTAL;

  return (
    <AbsoluteFill>
      <Bg src="250-alley-moon-bridge.png" z={2.4} fx={470} fy={230} sy={760} darkness={darkness} drift={0.04} dur={S4.dur} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g stroke="rgba(255,244,220,0.25)" strokeWidth={5} fill="none" strokeDasharray="6 14">
          {GARLANDS.map((pts, i) => (
            <path key={i} d={toD(pts)} />
          ))}
        </g>
        <g stroke={C.gold} strokeWidth={10} fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px rgba(255,200,87,0.9))" }}>
          {paths}
        </g>
      </svg>
      {LANTERNS.map((l, i) => {
        // 줄이 등불을 지나고 120px 더 그어지는 동안 불이 차오른다
        const over = drawn - l.at;
        const lit = over < 0 ? 0 : Math.min(1, over / 120);
        return <Lantern key={i} x={l.pos[0]} y={l.pos[1]} lit={lit} color={l.color} />;
      })}
      {/* 펜촉 역할의 반딧불 친구 */}
      {drawing && (
        <>
          <div
            style={{
              position: "absolute",
              left: tip[0] - 60,
              top: tip[1] - 60,
              width: 120,
              height: 120,
              borderRadius: 60,
              background: "radial-gradient(circle, rgba(255,232,150,0.95) 0%, rgba(255,200,87,0.4) 40%, rgba(255,200,87,0) 70%)",
            }}
          />
          <Img
            src={asset("characters/054_lantern_firefly_companion.png")}
            style={{ position: "absolute", left: tip[0] - 70, top: tip[1] - 170, width: 140 }}
          />
        </>
      )}
      <Img
        src={asset("characters/003_lantern_shopkeeper.png")}
        style={{ position: "absolute", left: 30, top: 1150, width: 230, translate: `0px ${Math.sin(frame / 8) * 5}px` }}
      />
      <Caption top={1480} start={6}>
        하나, 둘… 등불이 켜진다
      </Caption>
    </AbsoluteFill>
  );
};

/* ───────── 5. 원형 마스크로 축제 광장이 열린다 ───────── */
const OPEN_END = 30;
const SKY_LANTERNS = Array.from({ length: 12 }, (_, i) => ({
  x: 60 + ((i * 337) % 960),
  delay: (i * 7) % 40,
  speed: 5 + (i % 4),
  size: 30 + (i % 3) * 12,
}));

const Curtain: React.FC<{ text: string; size: number; color: string; start: number }> = ({ text, size, color, start }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, start + 26);
  const bar = interpolate(p, [0, 0.15, 0.85, 1], [0, 24, 24, 0], CLAMP);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          fontSize: size,
          fontWeight: 900,
          lineHeight: 1.2,
          color,
          textShadow: "0 6px 30px rgba(20,16,43,0.9)",
          clipPath: `inset(0 ${100 - p * 100}% 0 0)`,
        }}
      >
        {text}
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${p * 100}%`,
          width: `${bar}%`,
          translate: "-100% 0px",
          backgroundColor: C.gold,
          borderRadius: 8,
        }}
      />
    </div>
  );
};

const SceneFestival: React.FC = () => {
  const frame = useCurrentFrame();
  const r = interpolate(frame, [0, OPEN_END], [0, 1250], { ...CLAMP, easing: Easing.in(Easing.cubic) });
  const ringOpacity = interpolate(frame, [OPEN_END - 4, OPEN_END + 4], [1, 0], CLAMP);
  const friends = interpolate(frame, [OPEN_END, OPEN_END + 14], [0, 1], { ...CLAMP, easing: SPRING });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at 540px 1000px)` }}>
        <Bg src="256-rooftop-festival-square.png" fx={420} fy={400} darkness={0.15} drift={0.05} dur={S5.dur} />
        {/* 하늘로 떠오르는 풍등 */}
        {SKY_LANTERNS.map((l, i) => {
          const t = Math.max(0, frame - l.delay);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: l.x,
                top: 1700 - t * l.speed * 2,
                width: l.size,
                height: l.size * 1.3,
                borderRadius: l.size * 0.4,
                backgroundColor: i % 2 ? C.gold : "#FFB37A",
                boxShadow: `0 0 ${l.size}px ${l.size / 3}px rgba(255,200,87,0.7)`,
                opacity: frame > l.delay ? 0.9 : 0,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            top: 520,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            fontFamily: FONT,
          }}
        >
          <Curtain text="달빛 등불 축제" size={140} color={C.cream} start={OPEN_END - 6} />
          <Curtain text="오늘 밤, 개막!" size={100} color={C.gold} start={OPEN_END + 12} />
        </div>
        <Img
          src={asset("characters/003_lantern_shopkeeper.png")}
          style={{
            position: "absolute",
            left: 150,
            top: 1000,
            width: 440,
            transformOrigin: "center bottom",
            scale: friends,
            translate: `0px ${Math.sin(frame / 7) * 6}px`,
          }}
        />
        <Img
          src={asset("characters/054_lantern_firefly_companion.png")}
          style={{
            position: "absolute",
            left: 570,
            top: 1100,
            width: 380,
            transformOrigin: "center bottom",
            scale: friends,
            translate: `0px ${Math.sin(frame / 7 + 1.5) * 6}px`,
          }}
        />
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: ringOpacity }}>
        <circle cx={540} cy={1000} r={r} stroke={C.gold} strokeWidth={14} fill="none" style={{ filter: "drop-shadow(0 0 16px rgba(255,200,87,0.9))" }} />
      </svg>
    </AbsoluteFill>
  );
};

export const StoryShort: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.night }}>
    <Sequence from={S1.from} durationInFrames={S1.dur}>
      <SceneShop />
    </Sequence>
    <Sequence from={S2.from} durationInFrames={S2.dur}>
      <FadeIn>
        <SceneChat />
      </FadeIn>
    </Sequence>
    <Sequence from={S3.from} durationInFrames={S3.dur}>
      <FadeIn>
        <SceneRoute />
      </FadeIn>
    </Sequence>
    <Sequence from={S4.from} durationInFrames={S4.dur}>
      <FadeIn>
        <SceneLights />
      </FadeIn>
    </Sequence>
    <Sequence from={S5.from} durationInFrames={S5.dur}>
      <SceneFestival />
    </Sequence>
  </AbsoluteFill>
);

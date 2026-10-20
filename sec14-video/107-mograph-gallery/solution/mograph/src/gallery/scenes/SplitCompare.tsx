import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, EASE_OUT, asset } from "../theme";

// 위아래로 나눠 비 오는 날과 축제 날을 나란히 비교한다
const Panel: React.FC<{
  bg: string;
  cat: string;
  title: string;
  stat: string;
  accent: string;
  fromX: number;
  start: number;
  countTo: number;
}> = ({ bg, cat, title, stat, accent, fromX, start, countTo }) => {
  const frame = useCurrentFrame();
  const n = Math.round(
    countTo * interpolate(frame, [start + 15, start + 55], [0, 1], { ...CLAMP, easing: EASE_OUT }),
  );
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        borderRadius: 32,
        overflow: "hidden",
        border: `5px solid ${accent}`,
        translate: interpolate(frame, [start, start + 18], [`${fromX}px 0px`, "0px 0px"], {
          ...CLAMP,
          easing: EASE_OUT,
        }),
      }}
    >
      <Img src={asset(`backgrounds/${bg}`)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(20,16,43,0.85) 0%, rgba(20,16,43,0.2) 70%)" }} />
      <Img src={asset(`characters/${cat}`)} style={{ position: "absolute", right: 10, bottom: -20, height: 520 }} />
      <div style={{ position: "absolute", left: 44, top: 50 }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: accent }}>{title}</div>
        <div style={{ fontSize: 52, fontWeight: 700, marginTop: 30, color: C.cream }}>손님</div>
        <div style={{ fontSize: 130, fontWeight: 900, color: C.cream, fontVariantNumeric: "tabular-nums" }}>
          {n.toLocaleString("ko-KR")}
          <span style={{ fontSize: 60 }}>명</span>
        </div>
        <div style={{ fontSize: 48, fontWeight: 600, color: C.cream, marginTop: 6 }}>{stat}</div>
      </div>
    </div>
  );
};

export const SplitCompare: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.night }}>
      <ContentArea style={{ display: "flex", flexDirection: "column", gap: 70, left: 50, right: 50 }}>
        <Panel bg="246-rainy-lantern-alley.png" cat="038_raincoat_customer.png" title="비 오는 날" stat="인기: 따뜻한 우동" accent={C.lavender} fromX={-1100} start={4} countTo={320} />
        <Panel bg="256-rooftop-festival-square.png" cat="003_lantern_shopkeeper.png" title="축제 날" stat="인기: 붕어빵" accent={C.gold} fromX={1100} start={14} countTo={1240} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            translate: "-50% -50%",
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: C.pink,
            color: C.night,
            fontSize: 64,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `8px solid ${C.night}`,
            scale: interpolate(frame, [28, 40], [0, 1], { ...CLAMP, easing: EASE_OUT }),
          }}
        >
          VS
        </div>
      </ContentArea>
    </AbsoluteFill>
  );
};

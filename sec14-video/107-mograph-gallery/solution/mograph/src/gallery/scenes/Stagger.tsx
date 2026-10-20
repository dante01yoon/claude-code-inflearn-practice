import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, SceneBg, asset } from "../theme";

// 메뉴 카드가 시간 차를 두고 하나씩 들어온다
const ITEMS = [
  { name: "붕어빵", price: "2,000원", img: "061_bungeoppang.png" },
  { name: "떡볶이", price: "4,000원", img: "062_tteokbokki.png" },
  { name: "우동", price: "6,000원", img: "063_udon.png" },
  { name: "라멘", price: "7,000원", img: "064_ramen.png" },
];
const START = 8;
const GAP = 15;

export const Stagger: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SceneBg src="246-rainy-lantern-alley.png" darkness={0.62} blur={4} />
      <ContentArea
        style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 36 }}
      >
        {ITEMS.map((it, i) => {
          const s = START + i * GAP;
          const spring = Easing.spring({ damping: 14, stiffness: 160 });
          return (
            <div
              key={it.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                height: 230,
                padding: "0 44px",
                borderRadius: 40,
                backgroundColor: "rgba(255,244,220,0.95)",
                color: C.night,
                boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
                opacity: interpolate(frame, [s, s + 6], [0, 1], CLAMP),
                translate: interpolate(frame, [s, s + 18], ["700px 0px", "0px 0px"], {
                  ...CLAMP,
                  easing: spring,
                }),
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: C.gold,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </div>
              <Img src={asset(`props/${it.img}`)} style={{ width: 180 }} />
              <div style={{ flex: 1, fontSize: 76, fontWeight: 900 }}>{it.name}</div>
              <div style={{ fontSize: 56, fontWeight: 800, color: "#B5475A" }}>{it.price}</div>
            </div>
          );
        })}
      </ContentArea>
    </AbsoluteFill>
  );
};

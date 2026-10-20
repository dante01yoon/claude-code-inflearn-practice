import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, ContentArea, SceneBg, asset } from "../theme";

// 메신저 화면 목업. 말풍선이 하나씩 톡톡 뜬다
const MESSAGES = [
  { me: false, text: "오늘 야시장 갈 거야?" },
  { me: true, text: "응! 붕어빵 먹으러 갈래" },
  { me: false, text: "그럼 달 다리 앞에서 만나" },
  { me: true, text: "좋아, 8시에 봐!" },
  { me: false, text: "등불 챙겨 올게 🏮" },
];
const START = 6;
const GAP = 17;

export const ChatMockup: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SceneBg src="252-harbor-lighthouse-pier.png" darkness={0.55} blur={6} />
      <ContentArea>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 48,
            overflow: "hidden",
            backgroundColor: "#EDE6F7",
            boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: 150,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "0 36px",
              backgroundColor: C.night,
            }}
          >
            <Img
              src={asset("characters/054_lantern_firefly_companion.png")}
              style={{ width: 96, height: 96, borderRadius: 48, objectFit: "cover", backgroundColor: C.lavender }}
            />
            <div style={{ fontSize: 56, fontWeight: 800, color: C.cream }}>반딧불 친구</div>
          </div>
          <div
            style={{
              flex: 1,
              padding: "40px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 30,
            }}
          >
            {MESSAGES.map((m, i) => {
              const s = START + i * GAP;
              if (frame < s) return null;
              return (
                <div
                  key={m.text}
                  style={{
                    alignSelf: m.me ? "flex-end" : "flex-start",
                    maxWidth: 680,
                    padding: "26px 36px",
                    borderRadius: 40,
                    borderBottomLeftRadius: m.me ? 40 : 8,
                    borderBottomRightRadius: m.me ? 8 : 40,
                    backgroundColor: m.me ? C.gold : "#FFFFFF",
                    color: C.night,
                    fontSize: 56,
                    fontWeight: 700,
                    boxShadow: "0 6px 16px rgba(20,16,43,0.15)",
                    transformOrigin: m.me ? "right bottom" : "left bottom",
                    scale: interpolate(frame, [s, s + 10], [0.3, 1], {
                      ...CLAMP,
                      easing: Easing.spring({ damping: 11, stiffness: 180 }),
                    }),
                    opacity: interpolate(frame, [s, s + 4], [0, 1], CLAMP),
                  }}
                >
                  {m.text}
                </div>
              );
            })}
          </div>
        </div>
      </ContentArea>
    </AbsoluteFill>
  );
};

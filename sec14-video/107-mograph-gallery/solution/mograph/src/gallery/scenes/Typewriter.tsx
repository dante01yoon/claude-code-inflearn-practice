import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { C, ContentArea, SceneBg, asset } from "../theme";

// 한 글자씩 찍히고, 끝에 커서가 깜박인다
const TEXT = "야시장 안내 방송\n오늘 밤 8시,\n달 다리에서\n등불 축제가\n열립니다";
const START = 6;
const FRAMES_PER_CHAR = 1.9;

export const Typewriter: React.FC = () => {
  const frame = useCurrentFrame();
  const chars = Array.from(TEXT);
  const count = Math.max(
    0,
    Math.min(chars.length, Math.floor((frame - START) / FRAMES_PER_CHAR)),
  );
  const typing = count < chars.length;
  // 치는 동안은 켜두고, 다 치면 0.5초 간격으로 깜박
  const cursorOn = typing || Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill>
      <SceneBg src="250-alley-moon-bridge.png" darkness={0.6} blur={3} />
      <ContentArea>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 60,
            minHeight: 860,
            padding: "56px 56px",
            borderRadius: 36,
            backgroundColor: "rgba(255,244,220,0.95)",
            color: C.night,
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.3,
            whiteSpace: "pre-wrap",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {chars.slice(0, count).join("")}
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 100,
              marginLeft: 6,
              verticalAlign: "-12px",
              backgroundColor: C.pink,
              opacity: cursorOn ? 1 : 0,
            }}
          />
        </div>
        <Img
          src={asset("characters/054_lantern_firefly_companion.png")}
          style={{ position: "absolute", right: -20, bottom: 0, width: 280 }}
        />
      </ContentArea>
    </AbsoluteFill>
  );
};

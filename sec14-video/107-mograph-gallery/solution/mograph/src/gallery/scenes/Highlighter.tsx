import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { C, ContentArea, SceneBg, asset, prog } from "../theme";

// 단어 뒤로 형광펜이 왼쪽에서 오른쪽으로 칠해진다
const Marker: React.FC<{
  children: React.ReactNode;
  start: number;
  color: string;
}> = ({ children, start, color }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, start + 18);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 10px" }}>
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "48%",
          bottom: "2%",
          backgroundColor: color,
          borderRadius: "10px 30px 14px 24px",
          rotate: "-1.5deg",
          scale: `${p} 1`,
          transformOrigin: "left center",
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

export const Highlighter: React.FC = () => {
  return (
    <AbsoluteFill>
      <SceneBg src="256-rooftop-festival-square.png" darkness={0.6} blur={5} />
      <ContentArea style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            padding: "70px 56px",
            borderRadius: 36,
            backgroundColor: "rgba(255,244,220,0.97)",
            color: C.night,
            fontSize: 100,
            fontWeight: 800,
            lineHeight: 1.45,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          야시장의
          <br />
          <Marker start={14} color="rgba(255,200,87,0.85)">진짜 주인공</Marker>은
          <br />
          언제나
          <br />
          <Marker start={42} color="rgba(255,122,144,0.6)">따끈한 붕어빵</Marker>
        </div>
        <Img
          src={asset("props/061_bungeoppang.png")}
          style={{ width: 300, alignSelf: "flex-end", marginTop: -60, marginRight: -20 }}
        />
      </ContentArea>
    </AbsoluteFill>
  );
};

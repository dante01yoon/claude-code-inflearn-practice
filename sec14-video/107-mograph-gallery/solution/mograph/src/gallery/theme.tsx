import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

export const SCENE_FRAMES = 105;

export const C = {
  night: "#14102B",
  gold: "#FFC857",
  pink: "#FF7A90",
  lavender: "#B9A6FF",
  cream: "#FFF4DC",
  mint: "#7EE0C3",
  dim: "rgba(255,244,220,0.45)",
};

export const FONT = '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

export const asset = (path: string) => staticFile(`mooncat/${path}`);

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

// 0~1 진행도. 키네틱하게 쓰려고 기본은 ease-out
export const prog = (
  frame: number,
  start: number,
  end: number,
  easing: (t: number) => number = EASE_OUT,
) => interpolate(frame, [start, end], [0, 1], { ...CLAMP, easing });

// 배경: 야시장 그림을 세로 화면에 꽉 채우고 어둡게 깔아 글자가 잘 보이게 한다
export const SceneBg: React.FC<{
  src: string;
  darkness?: number;
  blur?: number;
}> = ({ src, darkness = 0.6, blur = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.night, overflow: "hidden" }}>
      <Img
        src={asset(`backgrounds/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: blur ? `blur(${blur}px)` : undefined,
          scale: interpolate(frame, [0, SCENE_FRAMES], [1.08, 1.16]),
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(20,16,43,${darkness + 0.15}) 0%, rgba(20,16,43,${darkness}) 45%, rgba(20,16,43,${darkness + 0.2}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// 이름표 아래부터 앱 하단 UI 위까지, 내용이 놓이는 안전 영역
export const ContentArea: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      left: 80,
      right: 80,
      top: 450,
      bottom: 290,
      fontFamily: FONT,
      color: C.cream,
      ...style,
    }}
  >
    {children}
  </div>
);

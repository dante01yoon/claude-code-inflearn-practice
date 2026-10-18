import type React from "react";
import { Interactive } from "remotion";
import { juaFont } from "../fonts";

type CaptionProps = {
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
};

const CaptionInner: React.FC<CaptionProps> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      margin: 0,
      fontFamily: juaFont,
      color: "#fff6e0",
      textShadow: "0 4px 18px rgba(40,10,60,0.85), 0 0 40px rgba(255,170,80,0.45)",
      whiteSpace: "pre",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Caption = Interactive.create({
  Component: CaptionInner,
  layout: "none",
  schema: {
    ...Interactive.textSchema,
    ...Interactive.childrenSchema,
  },
});

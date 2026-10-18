import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { lineName, monthLabel } from "./data";
import { theme } from "./theme";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const IntroSceneInner = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 96px",
        fontFamily: theme.font,
        color: theme.textPrimary,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          fontSize: 48,
          fontWeight: 700,
          color: theme.textSecondary,
          opacity: interpolate(frame, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 20], ["0px 30px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.line1,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            fontWeight: 800,
          }}
        >
          1
        </div>
        {lineName} · {monthLabel}
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 168,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: -4,
          opacity: interpolate(frame, [6, 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [6, 30], ["0px 50px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
        }}
      >
        서울역의
        <br />
        하루
      </div>
      <div
        style={{
          marginTop: 48,
          fontSize: 64,
          fontWeight: 600,
          color: theme.textSecondary,
          opacity: interpolate(frame, [22, 38], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [22, 44], ["0px 30px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
        }}
      >
        언제 가장 붐빌까?
      </div>
    </div>
  );
};

export const IntroScene = Interactive.create({
  Component: IntroSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});

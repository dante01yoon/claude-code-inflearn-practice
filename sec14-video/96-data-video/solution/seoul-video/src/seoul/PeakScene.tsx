import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import {
  fmt,
  hourLabel,
  lineName,
  monthLabel,
  peakOff,
  peakOn,
  peakTotal,
} from "./data";
import { theme } from "./theme";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const rise = (frame: number, start: number) => ({
  opacity: interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  translate: interpolate(frame, [start, start + 22], ["0px 40px", "0px 0px"], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  }),
});

const Stat = ({
  color,
  label,
  hour,
  value,
}: {
  color: string;
  label: string;
  hour: number;
  value: number;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 28, height: 28, borderRadius: 4, backgroundColor: color }} />
      <span style={{ fontSize: 44, fontWeight: 600, color: theme.textSecondary }}>
        {label}
      </span>
    </div>
    <div style={{ fontSize: 72, fontWeight: 800 }}>{hourLabel(hour)}</div>
    <div
      style={{
        fontSize: 52,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {fmt(value)}명
    </div>
  </div>
);

const PeakSceneInner = () => {
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
      <div style={{ fontSize: 56, fontWeight: 700, color: theme.textSecondary, ...rise(frame, 0) }}>
        서울역이 가장 붐비는 시간
      </div>
      <div
        style={{
          fontSize: 280,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: -8,
          marginTop: 24,
          ...rise(frame, 6),
        }}
      >
        {hourLabel(peakTotal.hour)}
      </div>
      <div
        style={{
          fontSize: 120,
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          marginTop: 8,
          ...rise(frame, 14),
        }}
      >
        {fmt(peakTotal.total)}명
      </div>
      <div style={{ fontSize: 44, color: theme.textSecondary, marginTop: 16, ...rise(frame, 20) }}>
        {String(peakTotal.hour).padStart(2, "0")}:00–{String(peakTotal.hour).padStart(2, "0")}:59 승하차 합계
      </div>

      <div
        style={{
          height: 2,
          backgroundColor: theme.grid,
          margin: "80px 0 64px",
          ...rise(frame, 30),
        }}
      />

      <div style={{ display: "flex", gap: 48, ...rise(frame, 36) }}>
        <Stat color={theme.on} label="승차 최다" hour={peakOn.hour} value={peakOn.on} />
        <Stat color={theme.off} label="하차 최다" hour={peakOff.hour} value={peakOff.off} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          bottom: 120,
          fontSize: 32,
          lineHeight: 1.5,
          color: theme.textMuted,
          ...rise(frame, 44),
        }}
      >
        서울역 {lineName} · {monthLabel} 한 달 합계
        <br />
        출처: 서울 열린데이터광장 지하철 시간대별 승하차 인원
      </div>
    </div>
  );
};

export const PeakScene = Interactive.create({
  Component: PeakSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});

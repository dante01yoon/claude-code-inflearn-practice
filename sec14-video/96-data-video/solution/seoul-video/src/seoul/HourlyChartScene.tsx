import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import {
  emptyHours,
  fmt,
  hourLabel,
  hours,
  lineName,
  maxTotal,
  monthLabel,
  peakOff,
  peakTotal,
  type HourData,
} from "./data";
import { theme } from "./theme";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// 타이밍(장면 내부 프레임)
const SWEEP_START = 16;
const ROW_STAGGER = 7;
const ROW_GROW = 14;
const HIGHLIGHT_AT = SWEEP_START + hours.length * ROW_STAGGER + 12;

// 레이아웃
const CHART_TOP = 560;
const ROW_PITCH = 52;
const BAR_HEIGHT = 36;
const LABEL_X = 96;
const BAR_X = 210;
const BAR_MAX = 600;
const GAP = 2;

const highlighted = (h: HourData) =>
  h.hour === peakTotal.hour || h.hour === peakOff.hour;

const Row = ({ data, index }: { data: HourData; index: number }) => {
  const frame = useCurrentFrame();
  const start = SWEEP_START + index * ROW_STAGGER;
  const grow = interpolate(frame, [start, start + ROW_GROW], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const isPeak = highlighted(data);
  const dim = interpolate(
    frame,
    [HIGHLIGHT_AT, HIGHLIGHT_AT + 12],
    [1, isPeak ? 1 : 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const onW = (data.on / maxTotal) * BAR_MAX * grow;
  const offW = (data.off / maxTotal) * BAR_MAX * grow;
  const y = CHART_TOP + index * ROW_PITCH;

  return (
    <div style={{ position: "absolute", left: 0, top: y, right: 0, opacity: dim }}>
      <div
        style={{
          position: "absolute",
          left: LABEL_X,
          top: 0,
          height: BAR_HEIGHT,
          display: "flex",
          alignItems: "center",
          fontSize: 34,
          fontWeight: isPeak && frame >= HIGHLIGHT_AT ? 800 : 600,
          color:
            isPeak && frame >= HIGHLIGHT_AT
              ? theme.textPrimary
              : theme.textSecondary,
          fontVariantNumeric: "tabular-nums",
          opacity: interpolate(frame, [start - 4, start + 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {hourLabel(data.hour)}
      </div>
      <div
        style={{
          position: "absolute",
          left: BAR_X,
          top: 0,
          height: BAR_HEIGHT,
          width: onW,
          backgroundColor: theme.on,
          borderRadius: offW > 0 ? 0 : "0 4px 4px 0",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: BAR_X + onW + (offW > 0 ? GAP : 0),
          top: 0,
          height: BAR_HEIGHT,
          width: offW,
          backgroundColor: theme.off,
          borderRadius: "0 4px 4px 0",
        }}
      />
      {isPeak ? (
        <div
          style={{
            position: "absolute",
            left: BAR_X + onW + offW + GAP + 16,
            top: 0,
            height: BAR_HEIGHT,
            display: "flex",
            alignItems: "center",
            fontSize: 36,
            fontWeight: 800,
            color: theme.textPrimary,
            fontVariantNumeric: "tabular-nums",
            opacity: interpolate(
              frame,
              [HIGHLIGHT_AT, HIGHLIGHT_AT + 12],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        >
          {fmt(data.total)}
        </div>
      ) : null}
    </div>
  );
};

const Swatch = ({ color }: { color: string }) => (
  <div style={{ width: 28, height: 28, borderRadius: 4, backgroundColor: color }} />
);

const HourlyChartSceneInner = () => {
  const frame = useCurrentFrame();
  const sweepIndex = Math.max(
    0,
    Math.min(
      hours.length - 1,
      Math.floor((frame - SWEEP_START) / ROW_STAGGER),
    ),
  );
  const inHighlight = frame >= HIGHLIGHT_AT;
  const current = inHighlight ? peakTotal : hours[sweepIndex];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        fontFamily: theme.font,
        color: theme.textPrimary,
        opacity: interpolate(frame, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          top: 120,
          fontSize: 40,
          fontWeight: 600,
          color: theme.textSecondary,
        }}
      >
        서울역 {lineName} · {monthLabel} 한 달 합계
      </div>

      {/* 현재 시간대 패널 */}
      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          top: 200,
          height: 290,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: inHighlight ? theme.textPrimary : theme.textMuted,
              height: 56,
            }}
          >
            {inHighlight ? "가장 붐빈 시간" : "시간대"}
          </div>
          <div
            style={{
              fontSize: 168,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {hourLabel(current.hour)}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            fontSize: 48,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Swatch color={theme.on} />
            <span style={{ color: theme.textSecondary, fontWeight: 600 }}>승차</span>
            <span style={{ minWidth: 220, textAlign: "right" }}>{fmt(current.on)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Swatch color={theme.off} />
            <span style={{ color: theme.textSecondary, fontWeight: 600 }}>하차</span>
            <span style={{ minWidth: 220, textAlign: "right" }}>{fmt(current.off)}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              borderTop: `2px solid ${theme.grid}`,
              paddingTop: 14,
            }}
          >
            <div style={{ width: 28 }} />
            <span style={{ color: theme.textSecondary, fontWeight: 600 }}>합계</span>
            <span style={{ minWidth: 220, textAlign: "right" }}>{fmt(current.total)}</span>
          </div>
        </div>
      </div>

      {/* 기준선 */}
      <div
        style={{
          position: "absolute",
          left: BAR_X - 2,
          top: CHART_TOP - 12,
          width: 2,
          height: hours.length * ROW_PITCH + 8,
          backgroundColor: theme.grid,
        }}
      />
      {hours.map((h, i) => (
        <Row key={h.hour} data={h} index={i} />
      ))}

      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          top: CHART_TOP + hours.length * ROW_PITCH + 24,
          fontSize: 32,
          color: theme.textMuted,
          lineHeight: 1.4,
        }}
      >
        단위: 명 · {emptyHours.map((h) => hourLabel(h.hour)).join(", ")} 승하차 0명
      </div>
    </div>
  );
};

export const HourlyChartScene = Interactive.create({
  Component: HourlyChartSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});

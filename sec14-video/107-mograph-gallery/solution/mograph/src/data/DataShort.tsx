import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import raw from "../../public/seoul/subway-hourly-202607.json";

export const DATA_FPS = 30;
export const DATA_FRAMES = 30 * DATA_FPS;

const FONT = '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
const C = {
  bg: "#0E1726",
  panel: "#16233A",
  text: "#F4F6FA",
  dim: "rgba(244,246,250,0.55)",
  grid: "rgba(244,246,250,0.12)",
  line1: "#3D6BE0", // 1호선 남색 계열
  accent: "#FFC23D",
  bar: "#5B7DB8",
};
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const COUNT_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ── 데이터: JSON 원본에서 그대로 꺼낸다 (가공·반올림 없음) ──
type Row = Record<string, string | number>;
const ROWS = (raw as { CardSubwayTime: { row: Row[] } }).CardSubwayTime.row;
const MONTH = String(ROWS[0].USE_MM); // "202607"
const LINE_NAME = String(ROWS[0].SBWY_ROUT_LN_NM);
const off = (r: Row, h: number) => Number(r[`HR_${h}_GET_OFF_NOPE`]);

const PEAK_HOUR = 8;
const RANK = ROWS.map((r) => ({ name: String(r.STTN), value: off(r, PEAK_HOUR) })).sort(
  (a, b) => b.value - a.value,
);
const TOP = RANK[0];
const TOP_ROW = ROWS.find((r) => r.STTN === TOP.name)!;
const HOURS = [5, 6, 7, 8, 9, 10];
const HOURLY = HOURS.map((h) => ({ h, value: off(TOP_ROW, h) }));

const YEAR = MONTH.slice(0, 4);
const MON = Number(MONTH.slice(4));

const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// 카운트업: 끝 프레임에서는 반드시 원본 값 그대로
const countUp = (frame: number, start: number, end: number, target: number) =>
  Math.round(target * interpolate(frame, [start, end], [0, 1], { ...CLAMP, easing: COUNT_EASE }));

const fadeUp = (frame: number, start: number, dist = 40) => ({
  opacity: interpolate(frame, [start, start + 10], [0, 1], CLAMP),
  translate: `0px ${interpolate(frame, [start, start + 18], [dist, 0], { ...CLAMP, easing: EASE_OUT })}px`,
});

// 씬 전환용 페이드 아웃
const SceneFade: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [dur - 10, dur], [1, 0], CLAMP) }}>
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ children: React.ReactNode; start: number }> = ({ children, start }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        fontSize: 40,
        fontWeight: 700,
        color: C.dim,
        ...fadeUp(frame, start, 20),
      }}
    >
      <span
        style={{
          backgroundColor: C.line1,
          color: C.text,
          borderRadius: 999,
          padding: "6px 22px",
          fontSize: 34,
        }}
      >
        {LINE_NAME}
      </span>
      {children}
    </div>
  );
};

// ── 1. 제목 ──
const Title: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ padding: "0 90px", justifyContent: "center" }}>
      <Kicker start={4}>
        {YEAR}년 {MON}월 · {ROWS.length}개 역
      </Kicker>
      <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1.15, marginTop: 40 }}>
        <div style={fadeUp(frame, 12, 60)}>출근길,</div>
        <div style={fadeUp(frame, 22, 60)}>어느 역이</div>
        <div style={{ ...fadeUp(frame, 32, 60), color: C.accent }}>가장 붐빌까?</div>
      </div>
      <div style={{ fontSize: 46, fontWeight: 600, color: C.dim, marginTop: 56, ...fadeUp(frame, 50, 30) }}>
        기준: 오전 {PEAK_HOUR}시대 <b style={{ color: C.text }}>내린 사람</b> 수
        <br />
        (교통카드 집계 · 한 달 합계)
      </div>
    </AbsoluteFill>
  );
};

// ── 2. 시간대별 하차 (차트 성장) ──
const CH_W = 900;
const CH_H = 640;
const HOUR_MAX = Math.max(...HOURLY.map((d) => d.value));
const Hourly: React.FC = () => {
  const frame = useCurrentFrame();
  const slot = CH_W / HOURLY.length;
  const barW = slot * 0.62;
  return (
    <AbsoluteFill style={{ padding: "230px 90px 0" }}>
      <Kicker start={2}>{TOP.name}역 · 시간대별 하차</Kicker>
      <div style={{ fontSize: 76, fontWeight: 900, marginTop: 24, lineHeight: 1.2, ...fadeUp(frame, 8) }}>
        아침 {PEAK_HOUR}시대에
        <br />
        <span style={{ color: C.accent }}>확 몰린다</span>
      </div>
      <div style={{ position: "relative", width: CH_W, height: CH_H + 90, marginTop: 70 }}>
        <svg width={CH_W} height={CH_H} style={{ position: "absolute", top: 0, overflow: "visible" }}>
          <line x1={0} x2={CH_W} y1={CH_H} y2={CH_H} stroke={C.dim} strokeWidth={3} />
          {HOURLY.map((d, i) => {
            const s = 24 + i * 9;
            const g = interpolate(frame, [s, s + 30], [0, 1], { ...CLAMP, easing: EASE_OUT });
            const h = (d.value / HOUR_MAX) * (CH_H - 90) * g;
            const peak = d.h === PEAK_HOUR;
            const x = i * slot + (slot - barW) / 2;
            return (
              <g key={d.h}>
                <rect x={x} y={CH_H - h} width={barW} height={h} rx={10} fill={peak ? C.accent : C.bar} />
                <text
                  x={x + barW / 2}
                  y={CH_H - h - 22}
                  textAnchor="middle"
                  fill={peak ? C.accent : C.text}
                  fontSize={peak ? 40 : 30}
                  fontWeight={800}
                  fontFamily={FONT}
                  opacity={interpolate(frame, [s + 6, s + 14], [0, 1], CLAMP)}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {fmt(countUp(frame, s, s + 30, d.value))}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ position: "absolute", top: CH_H + 18, left: 0, display: "flex" }}>
          {HOURLY.map((d) => (
            <div
              key={d.h}
              style={{
                width: slot,
                textAlign: "center",
                fontSize: 38,
                fontWeight: 700,
                color: d.h === PEAK_HOUR ? C.accent : C.dim,
              }}
            >
              {d.h}시
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── 3. 5개 역 순위 (순차 등장 + 막대 성장 + 카운트업) ──
const Ranking: React.FC = () => {
  const frame = useCurrentFrame();
  const max = RANK[0].value;
  // 5위부터 1위 순으로 등장
  const order = RANK.map((_, i) => RANK.length - 1 - i);
  return (
    <AbsoluteFill style={{ padding: "230px 90px 0" }}>
      <Kicker start={2}>오전 {PEAK_HOUR}시대 하차 · 한 달 합계</Kicker>
      <div style={{ fontSize: 76, fontWeight: 900, marginTop: 24, lineHeight: 1.2, ...fadeUp(frame, 8) }}>
        역별로 비교하면?
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 44, marginTop: 90 }}>
        {RANK.map((d, i) => {
          const s = 26 + order.indexOf(i) * 26;
          const g = interpolate(frame, [s + 4, s + 40], [0, 1], { ...CLAMP, easing: EASE_OUT });
          const first = i === 0;
          return (
            <div
              key={d.name}
              style={{
                opacity: interpolate(frame, [s, s + 8], [0, 1], CLAMP),
                translate: `${interpolate(frame, [s, s + 20], [-80, 0], { ...CLAMP, easing: EASE_OUT })}px 0px`,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div style={{ fontSize: 50, fontWeight: 800, color: first ? C.accent : C.text }}>
                  <span style={{ color: C.dim, marginRight: 18, fontSize: 40 }}>{i + 1}</span>
                  {d.name}
                </div>
                <div
                  style={{
                    fontSize: 50,
                    fontWeight: 800,
                    fontVariantNumeric: "tabular-nums",
                    color: first ? C.accent : C.text,
                  }}
                >
                  {fmt(countUp(frame, s + 4, s + 40, d.value))}명
                </div>
              </div>
              <div style={{ height: 34, marginTop: 12, borderRadius: 8, backgroundColor: C.grid }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(d.value / max) * 100 * g}%`,
                    borderRadius: 8,
                    backgroundColor: first ? C.accent : C.bar,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── 4. 결론: 1위 큰 숫자 카운트업 ──
const Winner: React.FC = () => {
  const frame = useCurrentFrame();
  const done = frame >= 70;
  return (
    <AbsoluteFill style={{ padding: "0 90px", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: 48, fontWeight: 700, color: C.dim, ...fadeUp(frame, 2, 20) }}>
        출근길에 가장 많이 내리는 역
      </div>
      <div style={{ fontSize: 190, fontWeight: 900, color: C.accent, marginTop: 10, ...fadeUp(frame, 8, 60) }}>
        {TOP.name}
      </div>
      <div
        style={{
          fontSize: 130,
          fontWeight: 900,
          fontVariantNumeric: "tabular-nums",
          marginTop: 10,
          scale: String(interpolate(frame, [70, 76, 84], [1, 1.08, 1], CLAMP)),
          opacity: interpolate(frame, [14, 20], [0, 1], CLAMP),
        }}
      >
        {fmt(countUp(frame, 16, 70, TOP.value))}
        <span style={{ fontSize: 70, marginLeft: 8 }}>명</span>
      </div>
      <div style={{ fontSize: 40, fontWeight: 600, color: C.dim, marginTop: 30, opacity: done ? 1 : 0 }}>
        {YEAR}년 {MON}월 오전 {PEAK_HOUR}시대 하차 · 한 달 합계
        <br />
        ({LINE_NAME} {ROWS.length}개 역 중)
      </div>
    </AbsoluteFill>
  );
};

// ── 출처 이름표 (하단 고정) ──
const SourceTag: React.FC = () => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [10, 30], [0, 100], { ...CLAMP, easing: EASE_OUT });
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        bottom: 300,
        display: "flex",
        alignItems: "stretch",
        clipPath: `inset(0 ${100 - w}% 0 0)`,
      }}
    >
      <div style={{ width: 12, borderRadius: 6, backgroundColor: C.accent }} />
      <div
        style={{
          marginLeft: 20,
          padding: "20px 28px",
          borderRadius: 16,
          backgroundColor: C.panel,
          fontSize: 30,
          lineHeight: 1.45,
          color: C.dim,
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 800, color: C.accent, letterSpacing: 2 }}>출처</div>
        <div style={{ color: C.text, fontWeight: 700 }}>서울 열린데이터광장</div>
        <div>지하철 호선별 역별 시간대별 승하차 인원</div>
        <div>CardSubwayTime · {YEAR}년 {MON}월 데이터</div>
      </div>
    </div>
  );
};

const SCENES = [
  { C: Title, dur: 120 },
  { C: Hourly, dur: 240 },
  { C: Ranking, dur: 330 },
  { C: Winner, dur: 210 },
];

export const DataShort: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT, color: C.text }}>
      {SCENES.map(({ C: Scene, dur }, i) => {
        const el = (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneFade dur={i === SCENES.length - 1 ? dur + 20 : dur}>
              <Scene />
            </SceneFade>
          </Sequence>
        );
        from += dur;
        return el;
      })}
      <SourceTag />
    </AbsoluteFill>
  );
};

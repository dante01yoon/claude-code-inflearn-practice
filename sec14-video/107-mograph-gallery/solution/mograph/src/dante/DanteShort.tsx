import React, { useCallback, useEffect, useState } from "react";
import { parseSrt } from "@remotion/captions";
import type { Caption } from "@remotion/captions";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";

export const DANTE_FPS = 30;
// final-ending.mp4 길이 38.2초
export const DANTE_FRAMES = Math.round(38.2 * DANTE_FPS);

const FONT = '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
const YELLOW = "#FFE14D";
const MARKER = "rgba(255,92,140,0.82)";
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

// 16:9 원본을 가로 1080에 맞추면 높이 607.5
const VIDEO_H = 1080 * (9 / 16);
// 원본 하단 81~95%에 자막이 구워져 있어서, 아래 20%(흙바닥 부분)를 잘라 중복 자막을 숨긴다
const VISIBLE_H = VIDEO_H * 0.8;
const VIDEO_TOP = (1920 - VISIBLE_H) / 2;
const CAPTION_TOP = VIDEO_TOP + VISIBLE_H + 56;

// 형광펜으로 강조할 단어 (어절 앞부분이 일치하면 강조)
const KEYWORDS = ["장애물", "끝까지", "벽돌", "구멍", "동전", "클로드", "코드한테", "잘라"];

type Word = { text: string; startMs: number; endMs: number; key: boolean };
type Cue = { startMs: number; endMs: number; lines: Word[][] };

// SRT는 큐 구간과 줄 배치만 쓰고, 단어 시각은 whisper로 뽑은 words.json에서 순서대로 가져온다
const toCues = (captions: Caption[], words: Caption[]): Cue[] => {
  let wi = 0;
  const cues = captions.map((c) => {
    const lines = c.text.split("\n").map((l) =>
      l
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((text) => {
          const w = words[wi++];
          if (!w || w.text !== text) {
            throw new Error(`words.json 단어 불일치: "${text}" vs "${w?.text}"`);
          }
          return {
            text,
            startMs: w.startMs,
            endMs: w.endMs,
            key: KEYWORDS.some((k) => text.startsWith(k)),
          };
        }),
    );
    const all = lines.flat();
    return {
      // 말이 큐보다 먼저 시작하거나 늦게 끝나면 큐를 넓힌다
      startMs: Math.min(c.startMs, all[0].startMs),
      endMs: Math.max(c.endMs, all[all.length - 1].endMs),
      lines,
    };
  });
  if (wi !== words.length) {
    throw new Error(`words.json 단어 수 불일치: ${words.length} vs ${wi}`);
  }
  // 넓힌 큐가 다음 큐와 겹치지 않게 자른다
  return cues.map((c, i) =>
    i + 1 < cues.length ? { ...c, endMs: Math.min(c.endMs, cues[i + 1].startMs) } : c,
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
      }}
    >
      <div
        style={{
          width: `${p * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${MARKER}, ${YELLOW})`,
          boxShadow: `0 0 18px ${YELLOW}`,
        }}
      />
    </div>
  );
};

// 첫 2초: 훅 문장이 단어마다 다른 방향에서 튀어 들어와 쌓인다
const HOOK = [
  { text: "단테,", size: 110, y: -170, from: [-600, 0], rot: -5, color: "#FFFFFF" },
  { text: "이번엔", size: 95, y: -45, from: [600, 0], rot: 3, color: "#FFFFFF" },
  { text: "끝까지", size: 150, y: 105, from: [0, 200], rot: -3, color: YELLOW, mark: true },
  { text: "간다", size: 115, y: 245, from: [0, -400], rot: 4, color: "#FFFFFF" },
];

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const spring = Easing.spring({ damping: 12, stiffness: 160 });
  const exit = interpolate(frame, [50, 60], [1, 0], CLAMP);
  if (frame >= 60) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 540,
        top: VIDEO_TOP / 2 - 20,
        opacity: exit,
        scale: interpolate(frame, [50, 60], [1, 1.15], CLAMP),
      }}
    >
      {HOOK.map((w, i) => {
        const start = i * 7;
        const t = (to: number) => [start, start + to];
        const markP = interpolate(frame, [30, 42], [0, 1], { ...CLAMP, easing: EASE_OUT });
        return (
          <div
            key={w.text}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              opacity: interpolate(frame, t(3), [0, 1], CLAMP),
              translate: interpolate(
                frame,
                t(12),
                [`${w.from[0]}px ${w.y + w.from[1]}px`, `0px ${w.y}px`],
                { ...CLAMP, easing: EASE_OUT },
              ),
              scale: interpolate(frame, t(14), [2.2, 1], { ...CLAMP, easing: spring }),
              rotate: interpolate(frame, t(14), [`${w.rot * 4}deg`, `${w.rot}deg`], {
                ...CLAMP,
                easing: spring,
              }),
            }}
          >
            <div
              style={{
                position: "absolute",
                translate: "-50% -50%",
                whiteSpace: "nowrap",
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: w.size,
                lineHeight: 1,
                color: w.color,
                padding: "0 16px",
                textShadow: "0 8px 30px rgba(0,0,0,0.7)",
              }}
            >
              {w.mark ? (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "50%",
                    bottom: "-4%",
                    backgroundColor: MARKER,
                    borderRadius: "10px 30px 14px 24px",
                    rotate: "-1.5deg",
                    scale: `${markP} 1`,
                    transformOrigin: "left center",
                  }}
                />
              ) : null}
              <span style={{ position: "relative" }}>{w.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CaptionWord: React.FC<{ word: Word; ms: number; fps: number }> = ({ word, ms, fps }) => {
  const active = ms >= word.startMs && ms < word.endMs;
  const sinceStart = ((ms - word.startMs) / 1000) * fps;
  // 형광펜은 그 단어를 말하는 순간 칠해지고, 큐가 끝날 때까지 남는다
  const markP = interpolate(sinceStart, [0, 8], [0, 1], { ...CLAMP, easing: EASE_OUT });
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        padding: "0 12px",
        color: active ? YELLOW : "#FFFFFF",
        scale: active ? interpolate(sinceStart, [0, 4], [1, 1.05], CLAMP) : 1,
      }}
    >
      {word.key ? (
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "46%",
            bottom: "4%",
            backgroundColor: MARKER,
            borderRadius: "8px 22px 10px 18px",
            rotate: "-1.5deg",
            scale: `${markP} 1`,
            transformOrigin: "left center",
          }}
        />
      ) : null}
      <span style={{ position: "relative" }}>{word.text}</span>
    </span>
  );
};

const Captions: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const cue = cues.find((c) => ms >= c.startMs && ms < c.endMs);
  if (!cue) return null;
  const sinceCue = ((ms - cue.startMs) / 1000) * fps;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: CAPTION_TOP,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 68,
        lineHeight: 1.3,
        textAlign: "center",
        WebkitTextStroke: "10px rgba(0,0,0,0.85)",
        paintOrder: "stroke fill",
        textShadow: "0 6px 20px rgba(0,0,0,0.6)",
        opacity: interpolate(sinceCue, [0, 3], [0, 1], CLAMP),
        translate: `0px ${interpolate(sinceCue, [0, 6], [24, 0], { ...CLAMP, easing: EASE_OUT })}px`,
      }}
    >
      {cue.lines.map((line, i) => (
        <div
          key={i}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", rowGap: 6 }}
        >
          {line.map((w, j) => (
            <CaptionWord key={j} word={w} ms={ms} fps={fps} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const DanteShort: React.FC = () => {
  const [cues, setCues] = useState<Cue[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());

  const fetchCaptions = useCallback(async () => {
    try {
      const [srt, words] = await Promise.all([
        fetch(staticFile("dante/captions.srt")).then((r) => r.text()),
        fetch(staticFile("dante/words.json")).then((r) => r.json() as Promise<Caption[]>),
      ]);
      const { captions } = parseSrt({ input: srt });
      setCues(toCues(captions, words));
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const src = staticFile("dante/final-ending.mp4");
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0B10" }}>
      {/* 위아래 빈 공간은 같은 영상을 크게 흐리게 깔아서 채운다. 위쪽 기준으로 키워 구워진 자막은 화면 밖으로 */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Video
          src={src}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%", filter: "blur(40px) brightness(0.45)", scale: 1.3, transformOrigin: "50% 0%" }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: VIDEO_TOP,
          width: 1080,
          height: VISIBLE_H,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <Video src={src} style={{ width: 1080, height: VIDEO_H }} />
      </div>
      <Hook />
      {cues ? <Captions cues={cues} /> : null}
      <ProgressBar />
    </AbsoluteFill>
  );
};

// rawCut.json(원본 구간 + 원본 기준 단어 시각) → 쇼츠 타임라인.
// 컴포지션(DanteRawShort)과 handoff 스크립트(scripts/dante-handoff.mts)가 같이 쓴다. React·remotion을 import하지 않는다.

export type RawCut = {
  source: string;
  fps: number;
  segments: { label: string; in: number; out: number; why: string }[];
  cues: { words: (string | number)[][] }[];
};

export type Segment = { label: string; why: string; in: number; out: number; at: number };
export type TimelineWord = { text: string; startMs: number; endMs: number; key: boolean };
export type TimelineCue = { startMs: number; endMs: number; lines: TimelineWord[][] };

const KEYWORDS = ["벽돌", "구멍", "동전", "부딪혔", "끝까지"];
// 큐는 마지막 단어 뒤로 조금 더 보여 주되, 다음 큐나 구간 끝을 넘지 않는다
const HOLD_MS = 600;

export const buildTimeline = (cut: RawCut) => {
  const segments: Segment[] = [];
  for (const s of cut.segments) {
    const prev = segments[segments.length - 1];
    segments.push({ ...s, at: prev ? prev.at + prev.out - prev.in : 0 });
  }
  const durationInFrames = segments.reduce((n, s) => n + s.out - s.in, 0);

  const segmentOf = (rawMs: number) => {
    const f = (rawMs / 1000) * cut.fps;
    const seg = segments.find((s) => f >= s.in && f <= s.out);
    if (!seg) throw new Error(`원본 ${rawMs}ms가 고른 구간 밖에 있음`);
    return { seg, f };
  };
  // 원본 시각(ms) → 쇼츠 시각(ms)
  const toOutMs = (rawMs: number) => {
    const { seg, f } = segmentOf(rawMs);
    return ((f - seg.in + seg.at) / cut.fps) * 1000;
  };
  const segmentEndMs = (rawMs: number) => {
    const { seg } = segmentOf(rawMs);
    return ((seg.at + seg.out - seg.in) / cut.fps) * 1000;
  };

  const cues: TimelineCue[] = cut.cues.map((c, i) => {
    const raw = c.words.map(([text, start, end]) => ({
      text: text as string,
      start: start as number,
      end: end as number,
    }));
    const words = raw.map((w) => ({
      text: w.text,
      startMs: toOutMs(w.start),
      endMs: toOutMs(w.end),
      key: KEYWORDS.some((k) => w.text.startsWith(k)),
    }));
    const next = cut.cues[i + 1]?.words[0][1] as number | undefined;
    const endMs = Math.min(
      words[words.length - 1].endMs + HOLD_MS,
      segmentEndMs(raw[raw.length - 1].end),
      next === undefined ? Infinity : toOutMs(next),
    );
    return { startMs: words[0].startMs, endMs, lines: [words] };
  });

  return { segments, durationInFrames, cues };
};

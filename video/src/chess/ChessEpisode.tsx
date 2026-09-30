import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { colors, fonts } from "../theme";
import { ChessVideo } from "./ChessVideo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const CARD = 45; // title / end card length in frames

export type EpisodeProps = {
  ep: number;
  total: number;
  from: number; // range of the full Chess video this episode shows
  to: number;
  en: string;
  ar: string;
  next?: { en: string; ar: string };
};

export const episodes: EpisodeProps[] = [
  { ep: 1, total: 3, from: 0, to: 330, en: "The Opening", ar: "الافتتاح", next: { en: "The Middlegame", ar: "وسط اللعب" } },
  { ep: 2, total: 3, from: 330, to: 702, en: "The Middlegame", ar: "وسط اللعب", next: { en: "The Endgame", ar: "النهاية" } },
  { ep: 3, total: 3, from: 702, to: 1260, en: "The Endgame", ar: "النهاية" },
];

export const episodeLength = (e: EpisodeProps) => CARD + (e.to - e.from) + (e.next ? CARD : 0);

const Card: React.FC<{ kicker: string; en: string; ar: string; small?: string }> = ({ kicker, en, ar, small }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, 16], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #10121a 0%, #000 70%)", justifyContent: "center", alignItems: "center", opacity: out }}>
      <div style={{ textAlign: "center", opacity: p }}>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 30, letterSpacing: 12, color: colors.accent }}>{kicker}</div>
        <div style={{ fontFamily: fonts.serif, fontStyle: "italic", fontSize: 120, color: colors.white, letterSpacing: interpolate(p, [0, 1], [20, 0]), marginTop: 20 }}>{en}</div>
        <div style={{ width: 200 * p, height: 2, background: colors.accent, margin: "30px auto" }} />
        <div dir="rtl" style={{ fontFamily: fonts.handAr, fontSize: 110, color: colors.silver }}>
          {ar}
        </div>
        {small ? <div style={{ fontFamily: fonts.en, fontWeight: 500, fontSize: 30, letterSpacing: 4, color: colors.steel, marginTop: 30 }}>{small}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// One episode of the chess series: a title card, a slice of the full Chess video (with its soundtrack), and a "to be continued" card.
export const ChessEpisode: React.FC<EpisodeProps> = ({ ep, total, from, to, en, ar, next }) => {
  useFonts();
  const len = to - from;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={0} durationInFrames={CARD}>
        <Card kicker={`EPISODE ${ep} / ${total} · الحلقة ${ep}`} en={en} ar={ar} />
      </Sequence>
      {/* starts after the title card; the inner negative offset skips ahead to `from` (audio included) */}
      <Sequence from={CARD} durationInFrames={len}>
        <Sequence from={-from}>
          <ChessVideo />
        </Sequence>
      </Sequence>
      {next ? (
        <Sequence from={CARD + len} durationInFrames={CARD}>
          <Card kicker="TO BE CONTINUED · يتبع…" en={next.en} ar={next.ar} small={`NEXT: EPISODE ${ep + 1}`} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

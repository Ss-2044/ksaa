import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { Lang, LangContext } from "../lang";
import "../theme";
import { Converge, Final, Glimpses, Horizon, Question, Reveal, Signal, TrailerFrame } from "./scenes";

// Timed to public/audio/teaser.wav (scripts/make-teaser-music.py).
const scenes = [
  { Component: Signal, frames: 60 }, // 0–2s   heartbeat
  { Component: Question, frames: 120 }, // 2–6s   one word per hit
  { Component: Glimpses, frames: 180 }, // 6–12s  glitch montage
  { Component: Horizon, frames: 120 }, // 12–16s quiet
  { Component: Converge, frames: 180 }, // 16–22s riser, then silence
  { Component: Reveal, frames: 120 }, // 22–26s braam + logo
  { Component: Final, frames: 120 }, // 26–30s tagline, coming soon
];

export const TEASER_FRAMES = scenes.reduce((sum, s) => sum + s.frames, 0);

export const NeoCaptaTeaser: React.FC<{ lang: Lang }> = ({ lang }) => (
  <LangContext.Provider value={lang}>
    <AbsoluteFill style={{ background: "#06060b" }}>
      <Audio src={staticFile("audio/teaser.wav")} />
      <Series>
        {scenes.map(({ Component, frames }, i) => (
          <Series.Sequence key={i} durationInFrames={frames}>
            <Component />
          </Series.Sequence>
        ))}
      </Series>
      <TrailerFrame />
    </AbsoluteFill>
  </LangContext.Provider>
);

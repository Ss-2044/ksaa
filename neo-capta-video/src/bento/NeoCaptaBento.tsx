import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { Lang, LangContext } from "../lang";
import "../theme";
import { Answer, bg, BentoOutro, Collapse, Grid, Search, Services } from "./scenes";

// Timed to public/audio/bento.wav (scripts/make-bento-music.py).
const scenes = [
  { Component: Grid, frames: 90 }, // 0–3s   cards snap in around the logo
  { Component: Search, frames: 150 }, // 3–8s   the question is typed
  { Component: Answer, frames: 180 }, // 8–14s  insight bento
  { Component: Services, frames: 180 }, // 14–20s five superpowers
  { Component: Collapse, frames: 150 }, // 20–25s smarter questions
  { Component: BentoOutro, frames: 150 }, // 25–30s logo + official line
];

export const BENTO_FRAMES = scenes.reduce((sum, s) => sum + s.frames, 0);

export const NeoCaptaBento: React.FC<{ lang: Lang }> = ({ lang }) => (
  <LangContext.Provider value={lang}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at 50% 40%, #16142e 0%, ${bg} 70%)` }}>
      <Audio src={staticFile("audio/bento.wav")} />
      <Series>
        {scenes.map(({ Component, frames }, i) => (
          <Series.Sequence key={i} durationInFrames={frames}>
            <Component />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  </LangContext.Provider>
);

import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { Lang, LangContext } from "../lang";
import "../theme";
import { Aurora, AuroraOutro, Blinds, Carousel, FlipTagline, Skyline, Strips } from "./scenes";

// Timed to public/audio/aurora.wav (scripts/make-aurora-music.py).
const scenes = [
  { Component: Blinds, frames: 90 }, // 0–3s   blinds open onto the logo
  { Component: FlipTagline, frames: 150 }, // 3–8s   official line flips in
  { Component: Skyline, frames: 180 }, // 8–14s  Riyadh skyline in light
  { Component: Strips, frames: 150 }, // 14–19s not louder, clearer
  { Component: Carousel, frames: 180 }, // 19–25s services carousel
  { Component: AuroraOutro, frames: 150 }, // 25–30s logo + official line
];

export const AURORA_FRAMES = scenes.reduce((sum, s) => sum + s.frames, 0);

export const NeoCaptaAurora: React.FC<{ lang: Lang }> = ({ lang }) => (
  <LangContext.Provider value={lang}>
    <AbsoluteFill>
      <Aurora />
      <Audio src={staticFile("audio/aurora.wav")} />
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

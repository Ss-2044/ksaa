import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { Lang, LangContext } from "../lang";
import "../theme";
import { DontBlink, EyeOpen, EyeOutro, Look, Noise, Orbit, paper } from "./scenes";

// Timed to public/audio/blink.wav (scripts/make-blink-music.py).
const scenes = [
  { Component: EyeOpen, frames: 90 }, // 0–3s   eye opens, dive into the logo-pupil
  { Component: Look, frames: 150 }, // 3–8s   look / look closer / closer
  { Component: Noise, frames: 180 }, // 8–14s  meaning in the noise
  { Component: Orbit, frames: 180 }, // 14–20s new eyes, services in orbit
  { Component: DontBlink, frames: 180 }, // 20–26s most brands blink
  { Component: EyeOutro, frames: 120 }, // 26–30s logo + official line
];

export const BLINK_FRAMES = scenes.reduce((sum, s) => sum + s.frames, 0);

export const NeoCaptaBlink: React.FC<{ lang: Lang }> = ({ lang }) => (
  <LangContext.Provider value={lang}>
    <AbsoluteFill style={{ background: paper }}>
      <Audio src={staticFile("audio/blink.wav")} />
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

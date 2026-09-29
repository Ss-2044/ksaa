import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { Lang, LangContext } from "../lang";
import "../theme";
import { LogoDrop, MegaOutro, paper, Stage } from "./scenes";

// Timed to public/audio/megaphone.wav (scripts/make-megaphone-music.py).
const scenes = [
  { Component: LogoDrop, frames: 90 }, // 0–3s   logo sticker drops in
  { Component: Stage, frames: 660 }, // 3–25s  the megaphone comedy
  { Component: MegaOutro, frames: 150 }, // 25–30s logo, wink, official line
];

export const MEGAPHONE_FRAMES = scenes.reduce((sum, s) => sum + s.frames, 0);

export const NeoCaptaMegaphone: React.FC<{ lang: Lang }> = ({ lang }) => (
  <LangContext.Provider value={lang}>
    <AbsoluteFill style={{ background: paper }}>
      <Audio src={staticFile("audio/megaphone.wav")} />
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

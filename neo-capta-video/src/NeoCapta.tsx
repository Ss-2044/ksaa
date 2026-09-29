import { AbsoluteFill, Series } from "remotion";
import { Backdrop } from "./Backdrop";
import { Lang, LangContext } from "./lang";
import { Desert } from "./scenes/Desert";
import { Different } from "./scenes/Different";
import { Ideas } from "./scenes/Ideas";
import { LogoIntro } from "./scenes/LogoIntro";
import { Outro } from "./scenes/Outro";
import { Tagline } from "./scenes/Tagline";
import { Soundtrack } from "./Soundtrack";
import "./theme";

// Scene lengths in frames at 30 fps — 30 seconds total.
const scenes = [
  { Component: LogoIntro, frames: 90 }, // 0–3s   logo
  { Component: Tagline, frames: 120 }, // 3–7s   official line
  { Component: Desert, frames: 180 }, // 7–13s  born in the desert
  { Component: Different, frames: 180 }, // 13–19s marketing, differently
  { Component: Ideas, frames: 180 }, // 19–25s new ideas + pillars
  { Component: Outro, frames: 150 }, // 25–30s logo + tagline
];

export const TOTAL_FRAMES = scenes.reduce((sum, s) => sum + s.frames, 0);

export const NeoCapta: React.FC<{ lang: Lang }> = ({ lang }) => (
  <LangContext.Provider value={lang}>
    <AbsoluteFill>
      <Backdrop />
      <Soundtrack />
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

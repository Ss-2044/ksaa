import { AbsoluteFill, Series } from "remotion";
import { DesignContext, Lang, LangContext } from "../lang";
import { Soundtrack } from "../Soundtrack";
import "../theme";
import { LensBackdrop } from "./LensBackdrop";
import { LensDesert, LensDifferent, LensIdeas, LensLogo, LensOutro, LensTagline } from "./scenes";

// Same timing as the first design so the score's hits line up (0s, 13s, 25s).
const scenes = [
  { Component: LensLogo, frames: 90 },
  { Component: LensTagline, frames: 120 },
  { Component: LensDesert, frames: 180 },
  { Component: LensDifferent, frames: 180 },
  { Component: LensIdeas, frames: 180 },
  { Component: LensOutro, frames: 150 },
];

export const LENS_FRAMES = scenes.reduce((sum, s) => sum + s.frames, 0);

export const NeoCaptaLens: React.FC<{ lang: Lang }> = ({ lang }) => (
  <LangContext.Provider value={lang}>
    <DesignContext.Provider value="lens">
    <AbsoluteFill>
      <LensBackdrop />
      <Soundtrack />
      <Series>
        {scenes.map(({ Component, frames }, i) => (
          <Series.Sequence key={i} durationInFrames={frames}>
            <Component />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
    </DesignContext.Provider>
  </LangContext.Provider>
);

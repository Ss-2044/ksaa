import { Composition } from "remotion";
import { NeoCaptaLens, LENS_FRAMES } from "./lens/NeoCaptaLens";
import { NeoCapta, TOTAL_FRAMES } from "./NeoCapta";
import { NeoCaptaTeaser, TEASER_FRAMES } from "./teaser/NeoCaptaTeaser";
import { BLINK_FRAMES, NeoCaptaBlink } from "./blink/NeoCaptaBlink";
import { FPS } from "./theme";

const size = { fps: FPS, width: 1920, height: 1080 };
const halftone = { component: NeoCapta, durationInFrames: TOTAL_FRAMES, ...size };
const lens = { component: NeoCaptaLens, durationInFrames: LENS_FRAMES, ...size };
const teaser = { component: NeoCaptaTeaser, durationInFrames: TEASER_FRAMES, ...size };
const blink = { component: NeoCaptaBlink, durationInFrames: BLINK_FRAMES, ...size };

export const RemotionRoot: React.FC = () => (
  <>
    {/* Design 1: halftone desert */}
    <Composition id="NeoCaptaAR" {...halftone} defaultProps={{ lang: "ar" as const }} />
    <Composition id="NeoCaptaEN" {...halftone} defaultProps={{ lang: "en" as const }} />
    {/* Design 2: lens / scanner */}
    <Composition id="NeoCaptaLensAR" {...lens} defaultProps={{ lang: "ar" as const }} />
    <Composition id="NeoCaptaLensEN" {...lens} defaultProps={{ lang: "en" as const }} />
    {/* Design 3: teaser trailer */}
    <Composition id="NeoCaptaTeaserAR" {...teaser} defaultProps={{ lang: "ar" as const }} />
    <Composition id="NeoCaptaTeaserEN" {...teaser} defaultProps={{ lang: "en" as const }} />
    {/* Design 4: blink / the eye */}
    <Composition id="NeoCaptaBlinkAR" {...blink} defaultProps={{ lang: "ar" as const }} />
    <Composition id="NeoCaptaBlinkEN" {...blink} defaultProps={{ lang: "en" as const }} />
  </>
);

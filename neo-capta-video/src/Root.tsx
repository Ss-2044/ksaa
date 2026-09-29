import { Composition } from "remotion";
import { NeoCaptaLens, LENS_FRAMES } from "./lens/NeoCaptaLens";
import { NeoCapta, TOTAL_FRAMES } from "./NeoCapta";
import { NeoCaptaTeaser, TEASER_FRAMES } from "./teaser/NeoCaptaTeaser";
import { BLINK_FRAMES, NeoCaptaBlink } from "./blink/NeoCaptaBlink";
import { BENTO_FRAMES, NeoCaptaBento } from "./bento/NeoCaptaBento";
import { MEGAPHONE_FRAMES, NeoCaptaMegaphone } from "./megaphone/NeoCaptaMegaphone";
import { AURORA_FRAMES, NeoCaptaAurora } from "./aurora/NeoCaptaAurora";
import { FPS } from "./theme";

const size = { fps: FPS, width: 1920, height: 1080 };
const halftone = { component: NeoCapta, durationInFrames: TOTAL_FRAMES, ...size };
const lens = { component: NeoCaptaLens, durationInFrames: LENS_FRAMES, ...size };
const teaser = { component: NeoCaptaTeaser, durationInFrames: TEASER_FRAMES, ...size };
const blink = { component: NeoCaptaBlink, durationInFrames: BLINK_FRAMES, ...size };
const bento = { component: NeoCaptaBento, durationInFrames: BENTO_FRAMES, ...size };
const megaphone = { component: NeoCaptaMegaphone, durationInFrames: MEGAPHONE_FRAMES, ...size };
const aurora = { component: NeoCaptaAurora, durationInFrames: AURORA_FRAMES, ...size };

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
    {/* Design 5: bento / smart interface */}
    <Composition id="NeoCaptaBentoAR" {...bento} defaultProps={{ lang: "ar" as const }} />
    <Composition id="NeoCaptaBentoEN" {...bento} defaultProps={{ lang: "en" as const }} />
    {/* Design 6: megaphone comedy */}
    <Composition id="NeoCaptaMegaphoneAR" {...megaphone} defaultProps={{ lang: "ar" as const }} />
    <Composition id="NeoCaptaMegaphoneEN" {...megaphone} defaultProps={{ lang: "en" as const }} />
    {/* Design 7: aurora, glass and the Riyadh skyline */}
    <Composition id="NeoCaptaAuroraAR" {...aurora} defaultProps={{ lang: "ar" as const }} />
    <Composition id="NeoCaptaAuroraEN" {...aurora} defaultProps={{ lang: "en" as const }} />
  </>
);

import { Composition } from "remotion";
import { NeoCapta, TOTAL_FRAMES } from "./NeoCapta";
import { FPS } from "./theme";

const shared = { component: NeoCapta, durationInFrames: TOTAL_FRAMES, fps: FPS, width: 1920, height: 1080 };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="NeoCaptaAR" {...shared} defaultProps={{ lang: "ar" as const }} />
    <Composition id="NeoCaptaEN" {...shared} defaultProps={{ lang: "en" as const }} />
  </>
);

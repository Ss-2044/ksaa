import { Composition } from "remotion";
import { NeoCapta, TOTAL_FRAMES } from "./NeoCapta";
import { FPS } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="NeoCapta"
    component={NeoCapta}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);

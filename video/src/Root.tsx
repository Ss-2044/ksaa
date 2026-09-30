import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { MagazineCover } from "./magazine/MagazineCover";
import { MagazineSpread } from "./magazine/MagazineSpread";
import { AIPromo } from "./ai/AIPromo";
import { aiDuration } from "./ai/shots";
import timeline from "./timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="Promo"
      component={Promo}
      durationInFrames={timeline.durationInFrames}
      fps={timeline.fps}
      width={timeline.width}
      height={timeline.height}
    />
    <Composition id="MagazineCover" component={MagazineCover} durationInFrames={1} fps={30} width={1200} height={1600} />
    <Composition id="MagazineSpread" component={MagazineSpread} durationInFrames={60} fps={30} width={2400} height={1600} />
    <Composition id="AIPromo" component={AIPromo} durationInFrames={aiDuration} fps={30} width={1080} height={1920} />
    </>
  );
};

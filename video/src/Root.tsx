import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import timeline from "./timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Promo"
      component={Promo}
      durationInFrames={timeline.durationInFrames}
      fps={timeline.fps}
      width={timeline.width}
      height={timeline.height}
    />
  );
};

import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { MagazineCover } from "./magazine/MagazineCover";
import { MagazineSpread } from "./magazine/MagazineSpread";
import { AIPromo } from "./ai/AIPromo";
import { Journey } from "./journey/Journey";
import { PassportVideo } from "./passport/PassportVideo";
import { ChessVideo } from "./chess/ChessVideo";
import { BlueprintVideo } from "./blueprint/BlueprintVideo";
import blueprintTimeline from "./blueprint/timeline.json";
import chessTimeline from "./chess/timeline.json";
import passportTimeline from "./passport/timeline.json";
import journeyTimeline from "./journey/timeline.json";
import { aiDuration } from "./ai/shots";
import timeline from "./timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition id="Blueprint" component={BlueprintVideo} durationInFrames={blueprintTimeline.durationInFrames} fps={30} width={1080} height={1920} />
    <Composition id="Chess" component={ChessVideo} durationInFrames={chessTimeline.durationInFrames} fps={30} width={1080} height={1920} />
    <Composition id="Passport" component={PassportVideo} durationInFrames={passportTimeline.durationInFrames} fps={30} width={1080} height={1920} />
    <Composition id="Journey" component={Journey} durationInFrames={journeyTimeline.durationInFrames} fps={30} width={1080} height={1920} />
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

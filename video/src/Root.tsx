import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { MagazineCover } from "./magazine/MagazineCover";
import { MagazineSpread } from "./magazine/MagazineSpread";
import { AIPromo } from "./ai/AIPromo";
import { Journey } from "./journey/Journey";
import { PassportVideo } from "./passport/PassportVideo";
import { ChessVideo } from "./chess/ChessVideo";
import { ChessEpisode, episodeLength, episodes } from "./chess/ChessEpisode";
import { BlueprintVideo } from "./blueprint/BlueprintVideo";
import { KabootVideo } from "./games/kaboot/KabootVideo";
import { VaultVideo } from "./games/vault/VaultVideo";
import { DominoVideo } from "./games/domino/DominoVideo";
import { FootballVideo } from "./games/football/FootballVideo";
import { RubikVideo } from "./games/rubik/RubikVideo";
import { StarsVideo } from "./games/stars/StarsVideo";
import starsTimeline from "./games/stars/timeline.json";
import { SaduVideo } from "./games/sadu/SaduVideo";
import saduTimeline from "./games/sadu/timeline.json";
import { FalconVideo } from "./games/falcon/FalconVideo";
import falconTimeline from "./games/falcon/timeline.json";
import { CalligraphyVideo } from "./games/calligraphy/CalligraphyVideo";
import calligraphyTimeline from "./games/calligraphy/timeline.json";
import { PitStopVideo } from "./games/pitstop/PitStopVideo";
import pitstopTimeline from "./games/pitstop/timeline.json";
import { GearsVideo } from "./games/gears/GearsVideo";
import gearsTimeline from "./games/gears/timeline.json";
import { DallahVideo } from "./games/dallah/DallahVideo";
import dallahTimeline from "./games/dallah/timeline.json";
import rubikTimeline from "./games/rubik/timeline.json";
import footballTimeline from "./games/football/timeline.json";
import dominoTimeline from "./games/domino/timeline.json";
import vaultTimeline from "./games/vault/timeline.json";
import kabootTimeline from "./games/kaboot/timeline.json";
import blueprintTimeline from "./blueprint/timeline.json";
import chessTimeline from "./chess/timeline.json";
import passportTimeline from "./passport/timeline.json";
import journeyTimeline from "./journey/timeline.json";
import { aiDuration } from "./ai/shots";
import timeline from "./timeline.json";

const vertical = { fps: 30, width: 1080, height: 1920 };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* heritage & story series */}
      <Composition id="Stars" component={StarsVideo} durationInFrames={starsTimeline.durationInFrames} {...vertical} />
      <Composition id="Sadu" component={SaduVideo} durationInFrames={saduTimeline.durationInFrames} {...vertical} />
      <Composition id="Falcon" component={FalconVideo} durationInFrames={falconTimeline.durationInFrames} {...vertical} />
      <Composition id="Calligraphy" component={CalligraphyVideo} durationInFrames={calligraphyTimeline.durationInFrames} {...vertical} />
      <Composition id="PitStop" component={PitStopVideo} durationInFrames={pitstopTimeline.durationInFrames} {...vertical} />
      <Composition id="Gears" component={GearsVideo} durationInFrames={gearsTimeline.durationInFrames} {...vertical} />
      <Composition id="Dallah" component={DallahVideo} durationInFrames={dallahTimeline.durationInFrames} {...vertical} />

      {/* game-themed series */}
      <Composition id="Kaboot" component={KabootVideo} durationInFrames={kabootTimeline.durationInFrames} {...vertical} />
      <Composition id="Rubik" component={RubikVideo} durationInFrames={rubikTimeline.durationInFrames} {...vertical} />
      <Composition id="Football" component={FootballVideo} durationInFrames={footballTimeline.durationInFrames} {...vertical} />
      <Composition id="Domino" component={DominoVideo} durationInFrames={dominoTimeline.durationInFrames} {...vertical} />
      <Composition id="Vault" component={VaultVideo} durationInFrames={vaultTimeline.durationInFrames} {...vertical} />
      {episodes.map((e) => (
        <Composition key={e.ep} id={`ChessEp${e.ep}`} component={ChessEpisode} durationInFrames={episodeLength(e)} defaultProps={e} {...vertical} />
      ))}

      {/* earlier concepts */}
      <Composition id="Blueprint" component={BlueprintVideo} durationInFrames={blueprintTimeline.durationInFrames} {...vertical} />
      <Composition id="Chess" component={ChessVideo} durationInFrames={chessTimeline.durationInFrames} {...vertical} />
      <Composition id="Passport" component={PassportVideo} durationInFrames={passportTimeline.durationInFrames} {...vertical} />
      <Composition id="Journey" component={Journey} durationInFrames={journeyTimeline.durationInFrames} {...vertical} />
      <Composition id="Promo" component={Promo} durationInFrames={timeline.durationInFrames} fps={timeline.fps} width={timeline.width} height={timeline.height} />
      <Composition id="MagazineCover" component={MagazineCover} durationInFrames={1} fps={30} width={1200} height={1600} />
      <Composition id="MagazineSpread" component={MagazineSpread} durationInFrames={60} fps={30} width={2400} height={1600} />
      <Composition id="AIPromo" component={AIPromo} durationInFrames={aiDuration} {...vertical} />
    </>
  );
};

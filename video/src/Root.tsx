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
import { CountdownVideo } from "./games/countdown/CountdownVideo";
import countdownTimeline from "./games/countdown/timeline.json";
import { DiamondVideo } from "./games/diamond/DiamondVideo";
import diamondTimeline from "./games/diamond/timeline.json";
import { BridgeVideo } from "./games/bridge/BridgeVideo";
import bridgeTimeline from "./games/bridge/timeline.json";
import { BalloonVideo } from "./games/balloon/BalloonVideo";
import balloonTimeline from "./games/balloon/timeline.json";
import { PaintingVideo } from "./games/painting/PaintingVideo";
import paintingTimeline from "./games/painting/timeline.json";
import { FireworksVideo } from "./games/fireworks/FireworksVideo";
import fireworksTimeline from "./games/fireworks/timeline.json";
import { ActionVideo } from "./games/action/ActionVideo";
import actionTimeline from "./games/action/timeline.json";
import { LensVideo } from "./games/lens/LensVideo";
import lensTimeline from "./games/lens/timeline.json";
import { RadioVideo } from "./games/radio/RadioVideo";
import radioTimeline from "./games/radio/timeline.json";
import { LighthouseVideo } from "./games/lighthouse/LighthouseVideo";
import lighthouseTimeline from "./games/lighthouse/timeline.json";
import { CompassVideo } from "./games/compass/CompassVideo";
import compassTimeline from "./games/compass/timeline.json";
import { PalmVideo } from "./games/palm/PalmVideo";
import palmTimeline from "./games/palm/timeline.json";
import { MaestroVideo } from "./games/maestro/MaestroVideo";
import maestroTimeline from "./games/maestro/timeline.json";
import { NotifyVideo } from "./games/notify/NotifyVideo";
import notifyTimeline from "./games/notify/timeline.json";
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
import { LaunchVideo } from "./marketing/LaunchVideo";
import launchTimeline from "./marketing/launch.json";
import { TipVideo } from "./marketing/TipVideo";
import { tips, tipLength } from "./marketing/tips";
import { GlowupVideo } from "./marketing/GlowupVideo";
import { ChatVideo } from "./marketing/ChatVideo";
import { MythsVideo } from "./marketing/MythsVideo";
import { FunnelVideo } from "./marketing/FunnelVideo";
import series2 from "./marketing/series2.json";
import { GulfCupVideo, GulfCupPoster } from "./gulf/GulfCup";
import gulfTimeline from "./gulf/timeline.json";
import { GulfTeamPoster, GulfOwaisPoster } from "./gulf/Posters2";
import { GulfTeamKeyArt, GulfOwaisKeyArt } from "./gulf/Posters3";
import { GulfTeamClean, GulfOwaisClean } from "./gulf/Posters4";
import { DotVideo } from "./dot/DotVideo";
import dotTimeline from "./dot/timeline.json";
import { PlaneVideo } from "./paper/PlaneVideo";
import { EraserVideo } from "./paper/EraserVideo";
import { StampVideo } from "./paper/StampVideo";
import { MagnetVideo } from "./paper/MagnetVideo";
import { PuzzleVideo } from "./paper/PuzzleVideo";
import { SeedVideo } from "./paper/SeedVideo";
import { ScaleVideo } from "./paper/ScaleVideo";
import { TyperVideo } from "./paper/TyperVideo";
import { ThreadVideo } from "./paper/ThreadVideo";
import paperTimelines from "./paper/timelines.json";
import timeline from "./timeline.json";

const vertical = { fps: 30, width: 1080, height: 1920 };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* we're live + marketing tips */}
      <Composition id="Launch" component={LaunchVideo} durationInFrames={launchTimeline.durationInFrames} {...vertical} />
      {tips.map((t) => (
        <Composition key={t.id} id={t.id} component={TipVideo} durationInFrames={tipLength} defaultProps={{ tip: t }} {...vertical} />
      ))}

      {/* first idea re-told: the dot */}
      <Composition id="Dot" component={DotVideo} durationInFrames={dotTimeline.durationInFrames} {...vertical} />
      <Composition id="Plane" component={PlaneVideo} durationInFrames={paperTimelines.plane.duration} {...vertical} />
      <Composition id="Eraser" component={EraserVideo} durationInFrames={paperTimelines.eraser.duration} {...vertical} />
      <Composition id="Stamp" component={StampVideo} durationInFrames={paperTimelines.stamp.duration} {...vertical} />
      <Composition id="Magnet" component={MagnetVideo} durationInFrames={paperTimelines.magnet.duration} {...vertical} />
      <Composition id="Puzzle" component={PuzzleVideo} durationInFrames={paperTimelines.puzzle.duration} {...vertical} />
      <Composition id="Seed" component={SeedVideo} durationInFrames={paperTimelines.seed.duration} {...vertical} />
      <Composition id="Scale" component={ScaleVideo} durationInFrames={paperTimelines.scale.duration} {...vertical} />
      <Composition id="Typer" component={TyperVideo} durationInFrames={paperTimelines.typer.duration} {...vertical} />
      <Composition id="Thread" component={ThreadVideo} durationInFrames={paperTimelines.thread.duration} {...vertical} />

      {/* Gulf Cup celebration */}
      <Composition id="GulfCup" component={GulfCupVideo} durationInFrames={gulfTimeline.duration} {...vertical} />
      <Composition id="GulfCupPoster" component={GulfCupPoster} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="GulfTeamClean" component={GulfTeamClean} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="GulfTeamCleanStory" component={GulfTeamClean} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GulfOwaisClean" component={GulfOwaisClean} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="GulfOwaisCleanStory" component={GulfOwaisClean} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GulfTeamArt" component={GulfTeamKeyArt} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="GulfTeamArtStory" component={GulfTeamKeyArt} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GulfOwaisArt" component={GulfOwaisKeyArt} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="GulfOwaisArtStory" component={GulfOwaisKeyArt} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GulfTeamPost" component={GulfTeamPoster} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="GulfTeamStory" component={GulfTeamPoster} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GulfOwaisPost" component={GulfOwaisPoster} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="GulfOwaisStory" component={GulfOwaisPoster} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GulfCupStory" component={GulfCupPoster} durationInFrames={1} fps={30} width={1080} height={1920} />

      {/* marketing series 2: before/after, chat, myths, funnel */}
      <Composition id="Glowup" component={GlowupVideo} durationInFrames={series2.glowup.duration} {...vertical} />
      <Composition id="Chat" component={ChatVideo} durationInFrames={series2.chat.duration} {...vertical} />
      <Composition id="Myths" component={MythsVideo} durationInFrames={series2.myths.duration} {...vertical} />
      <Composition id="Funnel" component={FunnelVideo} durationInFrames={series2.funnel.duration} {...vertical} />

      {/* launch series (studio soundtracks) */}
      <Composition id="Countdown" component={CountdownVideo} durationInFrames={countdownTimeline.durationInFrames} {...vertical} />
      <Composition id="Diamond" component={DiamondVideo} durationInFrames={diamondTimeline.durationInFrames} {...vertical} />
      <Composition id="Bridge" component={BridgeVideo} durationInFrames={bridgeTimeline.durationInFrames} {...vertical} />
      <Composition id="Balloon" component={BalloonVideo} durationInFrames={balloonTimeline.durationInFrames} {...vertical} />
      <Composition id="Painting" component={PaintingVideo} durationInFrames={paintingTimeline.durationInFrames} {...vertical} />
      <Composition id="Fireworks" component={FireworksVideo} durationInFrames={fireworksTimeline.durationInFrames} {...vertical} />
      <Composition id="Action" component={ActionVideo} durationInFrames={actionTimeline.durationInFrames} {...vertical} />

      {/* agency series: clarity, reach, guidance */}
      <Composition id="Lens" component={LensVideo} durationInFrames={lensTimeline.durationInFrames} {...vertical} />
      <Composition id="Radio" component={RadioVideo} durationInFrames={radioTimeline.durationInFrames} {...vertical} />
      <Composition id="Lighthouse" component={LighthouseVideo} durationInFrames={lighthouseTimeline.durationInFrames} {...vertical} />
      <Composition id="Compass" component={CompassVideo} durationInFrames={compassTimeline.durationInFrames} {...vertical} />
      <Composition id="Palm" component={PalmVideo} durationInFrames={palmTimeline.durationInFrames} {...vertical} />
      <Composition id="Maestro" component={MaestroVideo} durationInFrames={maestroTimeline.durationInFrames} {...vertical} />
      <Composition id="Notify" component={NotifyVideo} durationInFrames={notifyTimeline.durationInFrames} {...vertical} />

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

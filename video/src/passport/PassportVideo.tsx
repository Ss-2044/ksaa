import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { useFonts } from "../components/useFonts";
import { BlockWipe, Paper, RunningHeader } from "./Editorial";
import { OpeningScene } from "./OpeningScene";
import { PassportScene } from "./PassportScene";
import { ArrivalsScene } from "./ArrivalsScene";
import { WelcomeScene } from "./WelcomeScene";
import { PassportOutro } from "./PassportOutro";
import timeline from "./timeline.json";

// "جواز سفر الأفكار / Idea Passport" — light editorial NEO CAPTA promo, 38s, 1080x1920.
export const PassportVideo: React.FC = () => {
  useFonts();
  const { opening, passport, arrivals, welcome, outro } = timeline;
  const scenes = [
    { t: opening, el: <OpeningScene /> },
    { t: passport, el: <PassportScene /> },
    { t: arrivals, el: <ArrivalsScene /> },
    { t: welcome, el: <WelcomeScene /> },
    { t: outro, el: <PassportOutro /> },
  ];
  return (
    <AbsoluteFill>
      <Paper />
      {scenes.map(({ t, el }, i) => (
        <Sequence key={i} from={t.from} durationInFrames={t.duration}>
          {el}
          <RunningHeader index={i + 1} total={scenes.length} />
        </Sequence>
      ))}
      {scenes.slice(1).map(({ t }) => (
        <Sequence key={t.from} from={t.from - 8} durationInFrames={16}>
          <BlockWipe />
        </Sequence>
      ))}
      <Audio src={staticFile("passport-music.wav")} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile } from "remotion";
import { useFonts } from "../components/useFonts";
import { Flash } from "../components/Flash";
import { BlueprintScene } from "./BlueprintScene";
import { BlueprintOutro } from "./BlueprintOutro";
import timeline from "./timeline.json";

// "من رسمة… إلى معلم / From sketch to skyline" — blueprint-style NEO CAPTA promo, 38s, 1080x1920.
export const BlueprintVideo: React.FC = () => {
  useFonts();
  const { outro } = timeline;
  return (
    <AbsoluteFill style={{ background: "#0E3183" }}>
      <Sequence from={0} durationInFrames={outro.from}>
        <BlueprintScene />
        <Img src={staticFile("neocapta-logo-white.png")} style={{ position: "absolute", top: 70, right: 60, width: 140, opacity: 0.85 }} />
      </Sequence>
      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <BlueprintOutro />
      </Sequence>
      <Sequence from={outro.from - 2} durationInFrames={12}>
        <Flash duration={10} />
      </Sequence>
      <Audio src={staticFile("blueprint-music.wav")} />
    </AbsoluteFill>
  );
};

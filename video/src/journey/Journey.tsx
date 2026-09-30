import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../components/useFonts";
import { Background } from "../components/Background";
import { Flash } from "../components/Flash";
import { Grain } from "../components/Grain";
import { Logo } from "../components/Logo";
import { PartnershipScene } from "../scenes/PartnershipScene";
import { Outro } from "../scenes/Outro";
import { SparkScene } from "./SparkScene";
import { BoardingPassScene } from "./BoardingPassScene";
import { DeparturesScene } from "./DeparturesScene";
import { FlightMapScene } from "./FlightMapScene";
import { Plane } from "./Plane";
import timeline from "./timeline.json";

// A plane streaks across before the logo lands.
const Flyby: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const x = -300 + t * 1700;
  const y = 1300 - t * 700;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <line x1={x - 900} y1={y + 370} x2={x} y2={y} stroke="rgba(228,230,238,0.5)" strokeWidth={8} strokeLinecap="round" />
        <g transform={`translate(${x} ${y}) rotate(-22)`}>
          <Plane size={3.4} color="#FFFFFF" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// "رحلة فكرة / The journey of an idea" — NEO CAPTA promo, 40s, 1080x1920.
export const Journey: React.FC = () => {
  useFonts();
  const { spark, pass, departures, map, partnership, outro } = timeline;
  const scenes = [spark, pass, departures, map, partnership, outro];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Background />
      <Sequence from={spark.from} durationInFrames={spark.duration}>
        <SparkScene />
      </Sequence>
      <Sequence from={pass.from} durationInFrames={pass.duration}>
        <BoardingPassScene />
      </Sequence>
      <Sequence from={departures.from} durationInFrames={departures.duration}>
        <DeparturesScene />
      </Sequence>
      <Sequence from={map.from} durationInFrames={map.duration}>
        <FlightMapScene />
      </Sequence>
      <Sequence from={partnership.from} durationInFrames={partnership.duration}>
        <PartnershipScene />
      </Sequence>
      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <Outro />
      </Sequence>
      <Sequence from={outro.from - 6} durationInFrames={28}>
        <Flyby />
      </Sequence>
      <Sequence from={0} durationInFrames={outro.from}>
        <div style={{ position: "absolute", top: 70, right: 60, opacity: 0.9 }}>
          <Logo width={160} />
        </div>
      </Sequence>
      {scenes.slice(1).map((s) => (
        <Sequence key={s.from} from={s.from - 2} durationInFrames={10}>
          <Flash duration={8} />
        </Sequence>
      ))}
      <Grain />
      <Audio src={staticFile("journey-music.wav")} />
    </AbsoluteFill>
  );
};

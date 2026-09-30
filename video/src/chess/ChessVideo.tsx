import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { useFonts } from "../components/useFonts";
import { Grain } from "../components/Grain";
import { Flash } from "../components/Flash";
import { Logo } from "../components/Logo";
import { BoardScene } from "./BoardScene";
import { ChessOutro } from "./ChessOutro";
import timeline from "./timeline.json";

// "الخطوة القادمة / Your Next Move" — chess-themed NEO CAPTA promo, 38s, 1080x1920.
export const ChessVideo: React.FC = () => {
  useFonts();
  const { board, outro } = timeline;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #10121a 0%, #000 70%)" }}>
      <Sequence from={board.from} durationInFrames={board.duration}>
        <BoardScene />
      </Sequence>
      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <ChessOutro />
      </Sequence>
      <Sequence from={0} durationInFrames={outro.from}>
        <div style={{ position: "absolute", top: 70, right: 60, opacity: 0.85 }}>
          <Logo width={150} />
        </div>
      </Sequence>
      <Sequence from={outro.from - 2} durationInFrames={12}>
        <Flash duration={10} />
      </Sequence>
      <Grain />
      <Audio src={staticFile("chess-music.wav")} />
    </AbsoluteFill>
  );
};

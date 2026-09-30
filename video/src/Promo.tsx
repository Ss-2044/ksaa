import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, interpolate, useCurrentFrame } from "remotion";
import timeline from "./timeline.json";
import { fontFamilies } from "./theme";
import { Background } from "./components/Background";
import { Grain } from "./components/Grain";
import { Flash } from "./components/Flash";
import { Logo } from "./components/Logo";
import { IntroScene } from "./scenes/IntroScene";
import { Montage, montageDuration } from "./scenes/Montage";
import { Vo1Scene } from "./scenes/Vo1Scene";
import { FaceScene } from "./scenes/FaceScene";
import { Vo2Scene } from "./scenes/Vo2Scene";
import { AnswerScene } from "./scenes/AnswerScene";
import { PartnershipScene } from "./scenes/PartnershipScene";
import { Outro } from "./scenes/Outro";

const useFonts = () => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    Promise.all(fontFamilies.map((f) => document.fonts.load(`700 40px "${f}"`, "abcأبج")))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: interpolate(frame, [0, 15], [0, 0.85], { extrapolateRight: "clamp" }) }}>
      <Logo width={260} />
    </div>
  );
};

export const Promo: React.FC = () => {
  useFonts();
  const { intro, montageFrom, vo1Scene, face, vo2Scene, answer, partnership, outro } = timeline;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Background />

      <Sequence from={intro.from} durationInFrames={intro.duration}>
        <IntroScene />
      </Sequence>
      <Sequence from={montageFrom} durationInFrames={montageDuration}>
        <Montage />
      </Sequence>
      <Sequence from={0} durationInFrames={montageFrom + montageDuration - 16}>
        <Watermark />
      </Sequence>
      <Sequence from={vo1Scene.from} durationInFrames={vo1Scene.duration}>
        <Vo1Scene />
      </Sequence>
      <Sequence from={face.from} durationInFrames={face.duration}>
        <FaceScene />
      </Sequence>
      <Sequence from={vo2Scene.from} durationInFrames={vo2Scene.duration}>
        <Vo2Scene />
      </Sequence>
      <Sequence from={answer.from} durationInFrames={answer.duration}>
        <AnswerScene />
      </Sequence>
      <Sequence from={partnership.from} durationInFrames={partnership.duration}>
        <PartnershipScene />
      </Sequence>
      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <Outro />
      </Sequence>

      {[montageFrom - 3, vo1Scene.from - 2, face.from - 2, vo2Scene.from - 2, answer.from - 2, partnership.from - 2, outro.from - 2].map((f) => (
        <Sequence key={f} from={f} durationInFrames={12}>
          <Flash />
        </Sequence>
      ))}

      <Grain />
    </AbsoluteFill>
  );
};

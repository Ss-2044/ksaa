import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile } from "remotion";
import { useFonts } from "../components/useFonts";
import { Grain } from "../components/Grain";
import { Flash } from "../components/Flash";
import { Logo } from "../components/Logo";
import { LuxTitle } from "../chess/LuxTitle";
import { BrandOutro } from "./BrandOutro";

export type Caption = { from: number; to: number; kicker?: string; en: string; ar: string; enSize?: number; arSize?: number; top?: number };

// Common frame for the story videos: background, the scene, timed captions, corner logo, closing card and soundtrack.
export const Shell: React.FC<{
  bg: string;
  captions: Caption[];
  outro: { from: number; duration: number; en: string; ar: string };
  audio: string;
  flashes?: number[];
  light?: boolean;
  children: React.ReactNode;
}> = ({ bg, captions, outro, audio, flashes = [], light, children }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <Sequence from={0} durationInFrames={outro.from}>
        {children}
      </Sequence>
      {captions.map((c, i) => (
        <Sequence key={i} from={c.from} durationInFrames={c.to - c.from}>
          <AbsoluteFill style={{ paddingTop: c.top ?? 250 }}>
            <LuxTitle kicker={c.kicker} en={c.en} ar={c.ar} enSize={c.enSize ?? 80} arSize={c.arSize ?? 76} tone={light ? "light" : "dark"} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <BrandOutro en={outro.en} ar={outro.ar} light={light} />
      </Sequence>
      <Sequence from={0} durationInFrames={outro.from}>
        <div style={{ position: "absolute", top: 70, right: 60, opacity: 0.85 }}>
          {light ? <Img src={staticFile("neocapta-logo-dark.png")} style={{ width: 150 }} /> : <Logo width={150} />}
        </div>
      </Sequence>
      {[...flashes, outro.from].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={12}>
          <Flash duration={10} />
        </Sequence>
      ))}
      {light ? null : <Grain />}
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};

// Five services used across the series.
export const SERVICES = [
  { en: "Strategy", ar: "الاستراتيجية" },
  { en: "Branding", ar: "الهوية" },
  { en: "Content", ar: "المحتوى" },
  { en: "Campaigns", ar: "الحملات" },
  { en: "Growth", ar: "النمو" },
];

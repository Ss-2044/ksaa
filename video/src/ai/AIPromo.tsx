import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { Background } from "../components/Background";
import { BilingualTitle } from "../components/BilingualTitle";
import { Flash } from "../components/Flash";
import { Grain } from "../components/Grain";
import { Logo } from "../components/Logo";
import { Outro } from "../scenes/Outro";
import { colors, fonts } from "../theme";
import { AdCard } from "../cards/AdCard";
import { MapCard } from "../cards/MapCard";
import { DataCard } from "../cards/DataCard";
import { SocialCard } from "../cards/SocialCard";
import { GraphCard } from "../cards/GraphCard";
import { INSERT_FRAMES, OUTRO_FRAMES, Shot, shots } from "./shots";

const available = new Set(getStaticFiles().map((f) => f.name));

// Shown until the generated clip exists in public/shots/.
const Placeholder: React.FC<{ index: number; shot: Shot }> = ({ index, shot }) => (
  <AbsoluteFill>
    <Background />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30 }}>
    <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 120, color: colors.accent }}>SHOT {String(index + 1).padStart(2, "0")}</div>
    <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 64, color: colors.white, textAlign: "center", padding: "0 80px" }}>
      {shot.label}
    </div>
    <div style={{ fontFamily: fonts.en, fontSize: 36, color: colors.steel }}>public/shots/{shot.file}</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const Clip: React.FC<{ index: number; shot: Shot }> = ({ index, shot }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const exists = available.has(`shots/${shot.file}`);
  const zoom = interpolate(frame, [0, durationInFrames], [1.02, 1.1]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {exists ? (
        <OffthreadVideo
          src={staticFile(`shots/${shot.file}`)}
          muted
          startFrom={shot.startFrom ?? 0}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: "contrast(1.08) saturate(0.9)" }}
        />
      ) : (
        <Placeholder index={index} shot={shot} />
      )}
      {/* unified brand grade */}
      <AbsoluteFill style={{ background: "linear-gradient(170deg, rgba(52,68,153,0.28), rgba(0,0,0,0) 45%, rgba(2,3,10,0.55))", mixBlendMode: "multiply" }} />
      {shot.text ? (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(2,3,10,0.85) 100%)" }} />
          <Sequence from={12} layout="none">
            <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 260 }}>
              <BilingualTitle en={shot.text.en} ar={shot.text.ar} highlight={shot.text.highlight} wordGap={5} arDelay={20} enSize={76} arSize={58} />
            </AbsoluteFill>
          </Sequence>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// Fast cinematic cuts of the designed "magazine pages".
const Inserts: React.FC = () => {
  const cards = [<AdCard key="a" />, <MapCard key="m" />, <DataCard key="d" />, <SocialCard key="s" />, <GraphCard key="g" />];
  const each = Math.floor(INSERT_FRAMES / cards.length);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {cards.map((c, i) => (
        <Sequence key={i} from={i * each} durationInFrames={each}>
          <AbsoluteFill style={{ transform: "scale(1.68)" }}>
            <AbsoluteFill style={{ width: 808, height: 1148, left: 136, top: 386 }}>{c}</AbsoluteFill>
          </AbsoluteFill>
          <Flash duration={5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const AIPromo: React.FC = () => {
  useFonts();
  let at = 0;
  const cuts: number[] = [];
  const blocks = shots.map((shot, i) => {
    const from = at;
    at += shot.duration;
    cuts.push(from);
    const clip = (
      <Sequence key={shot.file} from={from} durationInFrames={shot.duration}>
        <Clip index={i} shot={shot} />
      </Sequence>
    );
    if (!shot.inserts) return clip;
    const insertFrom = at;
    at += INSERT_FRAMES;
    return (
      <React.Fragment key={shot.file}>
        {clip}
        <Sequence from={insertFrom} durationInFrames={INSERT_FRAMES}>
          <Inserts />
        </Sequence>
      </React.Fragment>
    );
  });
  const outroFrom = at;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {blocks}
      <Sequence from={outroFrom} durationInFrames={OUTRO_FRAMES}>
        <Outro />
      </Sequence>
      {/* corner mark like the reference ad */}
      <Sequence from={0} durationInFrames={outroFrom}>
        <div style={{ position: "absolute", top: 70, right: 60, opacity: 0.9 }}>
          <Logo width={170} />
        </div>
      </Sequence>
      {[...cuts.slice(1), outroFrom].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={10}>
          <Flash duration={8} />
        </Sequence>
      ))}
      <Grain />
    </AbsoluteFill>
  );
};

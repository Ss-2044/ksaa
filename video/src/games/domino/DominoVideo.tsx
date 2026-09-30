import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../../components/useFonts";
import { Grain } from "../../components/Grain";
import { Flash } from "../../components/Flash";
import { Logo } from "../../components/Logo";
import { LuxTitle } from "../../chess/LuxTitle";
import { colors, fonts } from "../../theme";
import { BrandOutro } from "../BrandOutro";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { chain } = timeline;
const GROUND = 1380; // screen y of the floor

export const services = [
  { en: "STRATEGY", ar: "الاستراتيجية" },
  { en: "BRANDING", ar: "الهوية" },
  { en: "CONTENT", ar: "المحتوى" },
  { en: "CAMPAIGNS", ar: "الحملات" },
  { en: "GROWTH", ar: "النمو" },
];

// Tile geometry (world px): each tile is `grow` times taller than the last and spaced so it hits the next.
export const tiles = (() => {
  const out: { x: number; h: number; w: number; start: number; dur: number }[] = [];
  let x = 0;
  let t = chain.push;
  for (let i = 0; i < chain.count; i++) {
    const h = chain.base * Math.pow(chain.grow, i);
    const w = h * 0.45;
    const dur = 12 * Math.sqrt(h / chain.base);
    out.push({ x, h, w, start: t, dur });
    x += w + h * 0.42;
    t += dur * 0.62;
  }
  return out;
})();
const last = tiles[tiles.length - 1];
export const chainEnd = last.start + last.dur;

const Pips: React.FC<{ n: number; size: number }> = ({ n, size }) => {
  const spots: Record<number, [number, number][]> = {
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
    6: [[0.28, 0.2], [0.72, 0.2], [0.28, 0.5], [0.72, 0.5], [0.28, 0.8], [0.72, 0.8]],
  };
  return (
    <>
      {spots[n].map(([x, y], i) => (
        <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, borderRadius: "50%", background: "#0A0D1F" }} />
      ))}
    </>
  );
};

const TileFace: React.FC<{ i: number; w: number; h: number }> = ({ i, w, h }) => {
  const m = chain.milestones.indexOf(i);
  if (m >= 0) {
    return (
      <div style={{ width: w, height: h, borderRadius: w * 0.12, background: `linear-gradient(160deg, ${colors.accent}, ${colors.royal})`, boxShadow: `0 0 ${w * 0.5}px rgba(94,120,255,0.6)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ transform: "rotate(-90deg)", display: "flex", flexDirection: "column", alignItems: "center", whiteSpace: "nowrap", lineHeight: 1.1 }}>
          <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: w * 0.16, color: colors.white }}>{services[m].en}</div>
          <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: w * 0.18, color: colors.white }}>
            {services[m].ar}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.12, background: "linear-gradient(160deg, #FFFFFF, #CFD4E2)", position: "relative", boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.1)" }}>
      <div style={{ position: "absolute", left: "10%", right: "10%", top: "50%", height: Math.max(1, h * 0.012), background: "#0A0D1F" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "50%" }}>
        <Pips n={1 + Math.floor(random(`pa${i}`) * 6)} size={w * 0.14} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "50%" }}>
        <Pips n={1 + Math.floor(random(`pb${i}`) * 6)} size={w * 0.14} />
      </div>
    </div>
  );
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const { scatter, align, overview } = timeline;

  // which tile is "the front" of the chain right now (fractional)
  let front = 0;
  tiles.forEach((t, i) => {
    if (frame >= t.start) front = i + Math.min(1, (frame - t.start) / t.dur);
  });
  const fi = Math.min(tiles.length - 1, Math.floor(front));
  const frac = front - fi;
  const hFront = chain.base * Math.pow(chain.grow, front);
  const xFront = tiles[fi].x + (tiles[Math.min(tiles.length - 1, fi + 1)].x - tiles[fi].x) * frac;
  const chaseScale = Math.min(2.4, 760 / (hFront * 1.7));
  const totalLen = last.x + last.w + last.h;
  const ov = interpolate(frame, [overview.from, overview.from + 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const scale = interpolate(ov, [0, 1], [chaseScale, 960 / totalLen]);
  const camX = interpolate(ov, [0, 1], [xFront + hFront * 0.35, totalLen / 2 - last.h * 0.3]);

  return (
    <div style={{ position: "absolute", left: 0, top: GROUND, width: 0, height: 0, transform: `translateX(${540 - camX * scale}px) scale(${scale})`, transformOrigin: "0 0" }}>
      {tiles.map((t, i) => {
        // scattered + aligned positions (only the first tiles are in shot before the chain)
        const sx = t.x + (random(`sx${i}`) - 0.5) * 360;
        const sAng = (random(`sa${i}`) - 0.5) * 140;
        const dropIn = interpolate(frame, [scatter.from + i * 5, scatter.from + i * 5 + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        const al = interpolate(frame, [align.from + i * 3, align.from + i * 3 + 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        let x = t.x;
        let ang = 0;
        let lift = 0;
        if (i > 0 && frame < align.from + 40) {
          x = sx + (t.x - sx) * al;
          ang = sAng * (1 - al);
          lift = (1 - dropIn) * -900;
          if (frame < scatter.from) lift = -3000;
        }
        if (i === 0) {
          const lone = interpolate(frame, [scatter.loneFall, scatter.loneFall + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
          ang = 84 * lone * (1 - al);
        }
        const fall = interpolate(frame, [t.start, t.start + t.dur], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        ang += fall * 74;
        const el = (
          <div style={{ position: "absolute", left: x, top: -t.h + lift, width: t.w, height: t.h, transformOrigin: "100% 100%", transform: `rotate(${ang}deg)` }}>
            <TileFace i={i} w={t.w} h={t.h} />
          </div>
        );
        return (
          <React.Fragment key={i}>
            {el}
            {/* floor reflection */}
            <div style={{ position: "absolute", left: 0, top: 0, transform: "scaleY(-1)", transformOrigin: "0 0", opacity: 0.18 }}>{el}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Giant: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { giant } = timeline;
  const up = spring({ frame: frame - giant.from, fps, config: { damping: 12, stiffness: 90 } });
  const fall = interpolate(frame, [giant.fall, giant.fall + 34], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  if (frame < giant.from) return null;
  return (
    <AbsoluteFill style={{ perspective: 1400 }}>
      <div
        style={{
          position: "absolute",
          left: 540 - 250,
          top: GROUND - 1000,
          width: 500,
          height: 1000,
          transformOrigin: "50% 100%",
          transform: `translateY(${(1 - up) * 1200}px) rotateX(${-fall * 88}deg)`,
          borderRadius: 60,
          background: colors.night,
          border: `10px solid ${colors.silver}`,
          boxShadow: "0 0 120px rgba(94,120,255,0.6)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "60px 0",
          boxSizing: "border-box",
        }}
      >
        <Logo width={380} />
        <div style={{ width: "80%", height: 6, background: colors.silver }} />
        <div style={{ fontFamily: fonts.serif, fontStyle: "italic", fontSize: 58, color: colors.white, textAlign: "center" }}>Your move.</div>
      </div>
    </AbsoluteFill>
  );
};

// "الدومينو / Domino" — one push sets off a growing chain of services.
export const DominoVideo: React.FC = () => {
  useFonts();
  const { intro, scatter, align, overview, giant, outro } = timeline;
  const worldOut = interpolate(useCurrentFrame(), [giant.from - 10, giant.from + 10], [1, 0.15], clamp);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #03040b 0%, #0b1030 60%, #05060e 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: GROUND, height: 3, background: "linear-gradient(90deg, transparent, rgba(228,230,238,0.5), transparent)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 30% at 50% 70%, rgba(94,120,255,0.18), rgba(0,0,0,0) 70%)" }} />
      <Sequence from={0} durationInFrames={outro.from} layout="none">
        <AbsoluteFill style={{ opacity: worldOut }}>
          <World />
        </AbsoluteFill>
        <Giant />
      </Sequence>

      <Sequence from={intro.from + 16} durationInFrames={intro.to - intro.from - 16}>
        <AbsoluteFill style={{ paddingTop: 260 }}>
          <LuxTitle kicker="DOMINO · الدومينو" en="Every idea is the first domino." ar="كل فكرة… أول قطعة." enSize={76} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={scatter.from + 4} durationInFrames={scatter.to - scatter.from - 4}>
        <AbsoluteFill style={{ paddingTop: 250 }}>
          <LuxTitle en="But not every idea sets things in motion." ar="لكن مو كل فكرة تحرّك شي." enSize={72} arSize={72} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={align.from + 4} durationInFrames={timeline.chain.push - align.from + 20}>
        <AbsoluteFill style={{ paddingTop: 260 }}>
          <LuxTitle kicker="NEO CAPTA" en="We line up every move." ar="نحن نرتّب كل خطوة." />
        </AbsoluteFill>
      </Sequence>
      {chain.milestones.map((m, k) => {
        const from = Math.round(tiles[m].start);
        const to = k < chain.milestones.length - 1 ? Math.round(tiles[chain.milestones[k + 1]].start) : overview.from;
        return (
          <Sequence key={m} from={from} durationInFrames={Math.max(20, to - from)}>
            <AbsoluteFill style={{ paddingTop: 260 }}>
              <LuxTitle kicker={`STEP ${k + 1}`} en={services[k].en.charAt(0) + services[k].en.slice(1).toLowerCase()} ar={services[k].ar} enSize={96} arSize={84} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <Sequence from={overview.from + 4} durationInFrames={giant.fall - overview.from}>
        <AbsoluteFill style={{ paddingTop: 240 }}>
          <LuxTitle en="One push… moves everything." ar="دفعة صح… تحرّك كل شي." enSize={80} arSize={80} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <BrandOutro en="Make the first move." ar="ابدأ أول قطعة معنا" />
      </Sequence>
      <Sequence from={0} durationInFrames={outro.from}>
        <div style={{ position: "absolute", top: 70, right: 60, opacity: 0.85 }}>
          <Logo width={150} />
        </div>
      </Sequence>
      <Sequence from={outro.from - 4} durationInFrames={14}>
        <Flash duration={12} />
      </Sequence>
      <Grain />
      <Audio src={staticFile("domino-music.wav")} />
    </AbsoluteFill>
  );
};

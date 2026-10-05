import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";
import clips from "./clips.json";

// «حركة» series: beat-cut kinetic typography. Black / white / electric blue / acid lime,
// huge words, hard cuts on the beat, mono labels and a hairline grid.
export const K = { black: "#0A0A0A", white: "#F5F5F0", blue: "#3D5AFE", acid: "#C6FF3D", red: "#FF3B3B" };
const BG: Record<string, [string, string]> = { black: [K.black, K.white], white: [K.white, K.black], blue: [K.blue, K.white], acid: [K.acid, K.black] };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Shot = { b: number; d: number; ar: string; bg: string; anim?: string; en?: string; label?: string; num?: string; strike?: boolean; mark?: string; exit?: string };
type Clip = { bpm: number; beats: number; endAt: number; music: string; end: { ar: string; en: string }; shots: Shot[] };
export const CLIPS = clips as Record<string, Clip>;
export const clipLength = (c: Clip) => Math.round((c.beats * 1800) / c.bpm);

// Alexandria Black runs wide (~0.8em per glyph); long phrases break onto two lines.
const lines = (text: string) => {
  const words = text.split(" ");
  if (text.length <= 9 || words.length < 2) return [text];
  let best = [text];
  let bestLen = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const m = Math.max(a.length, b.length);
    if (m < bestLen) (bestLen = m), (best = [a, b]);
  }
  return best;
};
const fit = (text: string, max: number) => Math.min(max, Math.round(940 / (Math.max(...lines(text).map((l) => l.length)) * 0.7)));

const Mark: React.FC<{ type: string; color: string; p: number }> = ({ type, color, p }) => (
  <svg width={140} height={140} viewBox="0 0 140 140" style={{ transform: `scale(${p})` }}>
    {type === "x" ? (
      <path d="M 30 30 L 110 110 M 110 30 L 30 110" stroke={K.red} strokeWidth={20} strokeLinecap="square" />
    ) : (
      <path d="M 22 74 L 56 108 L 120 36" stroke={color} strokeWidth={20} strokeLinecap="square" fill="none" />
    )}
  </svg>
);

const ShotView: React.FC<{ s: Shot; local: number; len: number; index: number; total: number }> = ({ s, local, len, index, total }) => {
  const { fps } = useVideoConfig();
  const [bg, fg] = BG[s.bg] ?? BG.black;
  const anim = s.anim ?? "cut";
  const slam = spring({ frame: local, fps, config: { damping: 14, stiffness: 320, mass: 0.6 } });
  const up = interpolate(local, [0, 7], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const scale = anim === "slam" ? interpolate(slam, [0, 1], [1.7, 1]) : 1;
  const ty = anim === "up" ? up * 100 : 0;
  const exitP = s.exit === "swipe" ? interpolate(local, [len - 8, len], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const strike = s.strike ? interpolate(local, [len * 0.35, len * 0.35 + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  const size = s.num ? 150 : fit(s.ar, 330);
  return (
    <AbsoluteFill style={{ background: bg, color: fg }}>
      {s.num ? (
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: fonts.en, fontWeight: 800, fontSize: 760, lineHeight: 1, color: s.bg === "black" ? K.acid : K.black, transform: `scale(${scale})`, letterSpacing: -30 }}>
          {s.num}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: s.num ? 1180 : 0, bottom: s.num ? undefined : 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `translateY(${-exitP * 1400}px)` }}>
        {s.mark ? (
          <div style={{ marginBottom: 20 }}>
            <Mark type={s.mark} color={fg} p={spring({ frame: local - 2, fps, config: { damping: 10, stiffness: 300 } })} />
          </div>
        ) : null}
        <div style={{ overflow: "hidden", padding: "0 40px" }}>
          <div dir="rtl" style={{ position: "relative", fontFamily: fonts.display, fontWeight: 900, fontSize: size, lineHeight: 1.18, letterSpacing: -4, whiteSpace: "nowrap", transform: `translateY(${ty}%) scale(${scale})` }}>
            {lines(s.ar).map((l, i) => (
              <div key={i}>{l}</div>
            ))}
            {strike > 0 ? <div style={{ position: "absolute", left: -20, right: -20, top: "52%", height: size * 0.09, background: K.red, transformOrigin: "right", transform: `scaleX(${strike}) rotate(-4deg)` }} /> : null}
          </div>
        </div>
        {s.en ? (
          <div style={{ marginTop: 26, fontFamily: fonts.mono, fontWeight: 700, fontSize: 34, letterSpacing: 10, opacity: interpolate(local, [3, 8], [0, 0.85], clamp) }}>{s.en}</div>
        ) : null}
      </div>
      {/* hairline grid + mono chrome */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {[360, 720].map((x) => <div key={x} style={{ position: "absolute", left: x, top: 0, bottom: 0, width: 1, background: fg, opacity: 0.12 }} />)}
        {[640, 1280].map((y) => <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0, height: 1, background: fg, opacity: 0.12 }} />)}
        <div style={{ position: "absolute", top: 58, right: 50, fontFamily: fonts.mono, fontWeight: 500, fontSize: 24, letterSpacing: 4, opacity: 0.7 }}>{s.label ?? "NEO CAPTA"}</div>
        <div style={{ position: "absolute", bottom: 60, left: 50, fontFamily: fonts.mono, fontWeight: 500, fontSize: 24, letterSpacing: 4, opacity: 0.7 }}>{`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}</div>
        <div style={{ position: "absolute", bottom: 60, right: 50, fontFamily: fonts.mono, fontWeight: 500, fontSize: 24, letterSpacing: 4, opacity: 0.7 }}>AR / EN</div>
      </AbsoluteFill>
      <Img src={staticFile(s.bg === "black" || s.bg === "blue" ? "neocapta-logo-white.png" : "neocapta-logo-dark.png")} style={{ position: "absolute", top: 30, left: 40, width: 150, height: 150 * LOGO_RATIO }} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ local: number; len: number; ar: string; en: string }> = ({ local, len, ar, en }) => {
  const { fps } = useVideoConfig();
  const logo = spring({ frame: local, fps, config: { damping: 13, stiffness: 160 } });
  const bar = interpolate(local, [10, 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const txt = interpolate(local, [16, 26], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(local, [len - 10, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: K.black, color: K.white, opacity: out }}>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${0.6 + 0.4 * logo})`, opacity: logo }}>
        <Img src={staticFile("neocapta-logo-white.png")} style={{ width: 600, height: 600 * LOGO_RATIO }} />
      </div>
      <div style={{ position: "absolute", top: 1010, left: 140, right: 140, height: 10, background: K.acid, transformOrigin: "right", transform: `scaleX(${bar})` }} />
      <div style={{ position: "absolute", top: 1070, left: 80, right: 80, textAlign: "center" }}>
        <div style={{ overflow: "hidden" }}>
          <div dir="rtl" style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 84, lineHeight: 1.3, transform: `translateY(${txt * 110}%)` }}>{ar}</div>
        </div>
        <div style={{ marginTop: 24, fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, letterSpacing: 8, opacity: 1 - txt }}>{en.toUpperCase()}</div>
      </div>
      <div style={{ position: "absolute", bottom: 120, left: 0, right: 0, textAlign: "center", fontFamily: fonts.mono, fontWeight: 500, fontSize: 24, letterSpacing: 6, opacity: 0.6 * (1 - txt) }}>STRATEGY · BRAND · CONTENT · ADS</div>
    </AbsoluteFill>
  );
};

export const KineticVideo: React.FC<{ clip: string }> = ({ clip }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const c = CLIPS[clip];
  const bf = 1800 / c.bpm; // frames per beat
  const endF = Math.round(c.endAt * bf);
  const idx = c.shots.findIndex((s) => frame >= Math.round(s.b * bf) && frame < Math.round((s.b + s.d) * bf));
  return (
    <AbsoluteFill style={{ background: K.black }}>
      {frame >= endF ? (
        <EndCard local={frame - endF} len={durationInFrames - endF} ar={c.end.ar} en={c.end.en} />
      ) : idx >= 0 ? (
        <ShotView s={c.shots[idx]} local={frame - Math.round(c.shots[idx].b * bf)} len={Math.round(c.shots[idx].d * bf)} index={idx} total={c.shots.length} />
      ) : null}
      <Audio src={staticFile(c.music)} />
    </AbsoluteFill>
  );
};

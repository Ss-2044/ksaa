import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { blur, lost, answer, rings, shutter, reveal, outro } = timeline;
const C = { x: 540, y: 1180 };
const VIEW = 300; // viewfinder radius

// What the lens is looking at: a poster for the idea.
const Subject: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 35%, #7E93FF 0%, ${colors.royal} 45%, #0A1033 100%)` }}>
    <div style={{ position: "absolute", left: "50%", top: 120, width: 180, height: 180, marginLeft: -90, borderRadius: "50%", background: "radial-gradient(circle, #FFF6D8, #FFD27A)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 180, background: "linear-gradient(0deg, #05081f, #1a2366)" }} />
    <div style={{ position: "absolute", left: "50%", top: 270, width: 400, marginLeft: -200 }}>
      <Img src={staticFile("neocapta-logo-white.png")} style={{ width: "100%" }} />
    </div>
  </div>
);

const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stepDone = (k: number) => frame >= rings.from + k * rings.each + rings.turn;
  const done = SERVICES.filter((_, k) => stepDone(k)).length;
  // blur falls with each ring; hunts back and forth while lost
  let b = 38 - done * 7.4;
  if (frame >= lost.from && frame < answer.from) b = 30 + Math.sin(frame / 6) * 14;
  for (let k = 0; k < 5; k++) {
    const s = rings.from + k * rings.each;
    if (frame >= s && frame < s + rings.turn) b = interpolate(frame, [s, s + rings.turn], [38 - k * 7.4, 38 - (k + 1) * 7.4], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  }
  b = Math.max(0, b);
  const shut = interpolate(frame, [shutter.at, shutter.at + 5, shutter.at + 12], [0, 1, 0], clamp);
  const photo = spring({ frame: frame - (shutter.at + 12), fps, config: { damping: 14 } });
  const grow = interpolate(frame, [reveal.from, reveal.to], [1, 1.12], clamp);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #151a2a 0%, #05060a 70%)" }} />
      {/* focus rings (outermost first) */}
      {SERVICES.map((s, k) => {
        const r = VIEW + 60 + (4 - k) * 34;
        const st = rings.from + k * rings.each;
        const rot = interpolate(frame, [st, st + rings.turn], [0, 70 + k * 10], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        const active = frame >= st && frame < st + rings.each;
        const on = stepDone(k);
        return (
          <div key={s.en} style={{ position: "absolute", left: C.x - r, top: C.y - r, width: r * 2, height: r * 2, borderRadius: "50%", transform: `rotate(${rot}deg)`, background: `repeating-conic-gradient(${on ? "#9aa3b5" : "#3a3f4c"} 0deg 2deg, #1b1e27 2deg 6deg)`, boxShadow: active ? `0 0 40px ${colors.accent}` : "inset 0 0 20px rgba(0,0,0,0.8)", border: `3px solid ${active || on ? colors.accent : "#2a2e3a"}` }}>
            <div style={{ position: "absolute", inset: 30, borderRadius: "50%", background: "#0b0d12" }} />
          </div>
        );
      })}
      {/* viewfinder with the subject */}
      <div style={{ position: "absolute", left: C.x - VIEW, top: C.y - VIEW, width: VIEW * 2, height: VIEW * 2, borderRadius: "50%", overflow: "hidden", boxShadow: "inset 0 0 60px rgba(0,0,0,0.9)" }}>
        <div style={{ position: "absolute", inset: -40, filter: `blur(${b}px) saturate(${1 - b / 80})`, transform: `scale(${1 + b / 200})` }}>
          <Subject />
        </div>
        {/* chromatic fringe while out of focus */}
        <div style={{ position: "absolute", inset: 0, boxShadow: `inset ${b / 3}px 0 ${b}px rgba(255,60,60,0.25), inset ${-b / 3}px 0 ${b}px rgba(60,120,255,0.25)` }} />
        {/* glass reflection */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%)" }} />
        {/* iris blades on the shutter */}
        {shut > 0 ? <div style={{ position: "absolute", inset: 0, background: "#000", clipPath: `circle(${100 - shut * 100}% at 50% 50%)`, opacity: shut }} /> : null}
      </div>
      {/* focus UI: brackets + readout */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
          <path key={i} d={`M ${C.x + sx * 190} ${C.y + sy * 130} l ${-sx * 50} 0 M ${C.x + sx * 190} ${C.y + sy * 130} l 0 ${-sy * 50}`} stroke={done === 5 ? colors.accent : "#E4E6EE"} strokeWidth={5} />
        ))}
      </svg>
      <div style={{ position: "absolute", top: C.y + VIEW + 250, left: 0, right: 0, textAlign: "center", fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: done === 5 ? colors.accent : colors.steel }}>
        {done === 5 ? "● IN FOCUS · واضح" : `FOCUS ${Math.max(0, Math.round(100 - (b / 38) * 100))}%`}
      </div>
      {/* the photo that comes out after the shutter */}
      {frame >= shutter.at + 12 ? (
        <div style={{ position: "absolute", left: C.x - 330, top: C.y - 380, width: 660, height: 760, background: "#F4F5FA", padding: 26, boxSizing: "border-box", transform: `translateY(${(1 - photo) * 900}px) rotate(${(1 - photo) * 8 - 3}deg) scale(${grow})`, boxShadow: "0 40px 90px rgba(0,0,0,0.7)" }}>
          <div style={{ position: "relative", width: "100%", height: 560, overflow: "hidden" }}>
            <Subject />
          </div>
          <div style={{ textAlign: "center", marginTop: 26, fontFamily: fonts.handAr, fontSize: 52, color: "#0A1033" }}>فكرتك… بوضوح</div>
        </div>
      ) : null}
      {/* flash */}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(frame, [shutter.at + 4, shutter.at + 6, shutter.at + 16], [0, 0.9, 0], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// "العدسة / The Lens" — a blurry idea brought into focus ring by ring, then captured.
export const LensVideo: React.FC = () => (
  <Shell
    bg="#05060a"
    audio="lens-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Crystal clear.", ar: "نوضّح فكرتك للكل" }}
    captions={[
      { from: blur.from + 16, to: blur.to, kicker: "THE LENS · العدسة", en: "Every idea is a picture.", ar: "كل فكرة… صورة." },
      { from: lost.from + 4, to: lost.to, en: "But not every idea is clear.", ar: "بس مو كل فكرة واضحة.", enSize: 76 },
      { from: answer.from + 4, to: rings.from, kicker: "NEO CAPTA", en: "We bring it into focus.", ar: "نحن نضبط التركيز." },
      ...SERVICES.map((s, k) => ({ from: rings.from + k * rings.each + 4, to: k < 4 ? rings.from + (k + 1) * rings.each + 4 : shutter.at, kicker: `RING ${k + 1}`, en: s.en, ar: s.ar, enSize: 92, arSize: 80 })),
      { from: shutter.at + 20, to: outro.from, en: "Your idea, crystal clear.", ar: "فكرتك… واضحة للكل.", enSize: 80, top: 200 },
    ]}
  >
    <Camera />
  </Shell>
);

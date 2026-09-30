import React from "react";
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { colors, fonts } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { blank, lost, brush, strokes, reveal, outro } = timeline;
const CANVAS = { x: 150, y: 640, w: 780, h: 980 };
// each service's stroke: colour + path across the canvas (canvas-local coordinates)
const STROKES = [
  { c: colors.royal, w: 170, d: "M -40 820 C 200 700 420 900 820 760" },
  { c: colors.accent, w: 120, d: "M -40 180 C 260 320 520 80 820 240" },
  { c: "#E4E6EE", w: 90, d: "M 120 1020 C 200 700 560 620 640 -40" },
  { c: "#0A1033", w: 140, d: "M -40 520 C 240 440 560 600 820 470" },
  { c: "#e3a83a", w: 70, d: "M 60 60 C 300 380 480 380 740 960" },
];

const Studio: React.FC = () => {
  const frame = useCurrentFrame();
  const t = (k: number) => interpolate(frame, [strokes.from + k * strokes.each, strokes.from + k * strokes.each + strokes.draw], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const logoPaint = interpolate(frame, [reveal.paint, reveal.paint + 50], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  // brush tip follows whatever is being painted
  let tip = { x: CANVAS.x + 700, y: CANVAS.y + 100 + Math.sin(frame / 12) * 30 };
  const k = Math.floor((frame - strokes.from) / strokes.each);
  const hovering = frame >= lost.from && frame < brush.to;
  if (hovering) tip = { x: CANVAS.x + 400 + Math.sin(frame / 9) * 220, y: CANVAS.y + 400 + Math.cos(frame / 13) * 200 };
  const painting = k >= 0 && k < 5 && frame < strokes.from + k * strokes.each + strokes.draw;
  const drips = frame >= lost.from && frame < brush.from;

  return (
    <AbsoluteFill>
      {/* warm studio wall + floor */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #2a2230 0%, #3a2e36 60%, #1c1418 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.2, backgroundImage: "radial-gradient(circle, rgba(255,220,180,0.3) 1px, transparent 1.5px)", backgroundSize: "8px 8px" }} />
      <div style={{ position: "absolute", left: 540 - 500, top: 300, width: 1000, height: 1000, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,220,170,0.25), rgba(0,0,0,0) 65%)" }} />
      {/* easel */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M 300 1640 L 420 560 M 780 1640 L 660 560 M 540 540 L 540 1760`} stroke="#6b4a2a" strokeWidth={22} strokeLinecap="round" />
        <rect x={CANVAS.x - 20} y={CANVAS.y + CANVAS.h} width={CANVAS.w + 40} height={30} fill="#6b4a2a" />
      </svg>
      {/* canvas */}
      <div style={{ position: "absolute", left: CANVAS.x, top: CANVAS.y, width: CANVAS.w, height: CANVAS.h, background: "#F7F3EA", boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <svg width={CANVAS.w} height={CANVAS.h} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <filter id="paint">
              <feTurbulence type="fractalNoise" baseFrequency="0.03 0.2" numOctaves="3" seed="7" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="22" />
            </filter>
            <mask id="logoMask">
              <path d="M 40 380 C 260 300 520 460 760 360 M 40 560 C 260 480 520 640 760 540" stroke="#fff" strokeWidth={260} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - logoPaint} strokeLinecap="round" />
            </mask>
          </defs>
          {STROKES.map((s, i) => (
            <path key={i} d={s.d} stroke={s.c} strokeWidth={s.w} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t(i)} filter="url(#paint)" opacity={0.92} />
          ))}
          {/* paint drips while hesitating */}
          {drips ? <rect x={430} y={0} width={10} height={interpolate(frame, [lost.from, brush.from], [0, 160], clamp)} fill={colors.royal} rx={5} /> : null}
          {/* the brand painted last */}
          <g mask="url(#logoMask)">
            <rect x={60} y={260} width={660} height={430} rx={20} fill="rgba(10,16,51,0.9)" />
            <image href={staticFile("neocapta-logo-white.png")} x={140} y={290} width={500} height={368} />
          </g>
        </svg>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, rgba(0,0,0,0.025) 0 2px, transparent 2px 5px)", pointerEvents: "none" }} />
      </div>
      {/* frame appears at the end */}
      <div style={{ position: "absolute", left: CANVAS.x - 30, top: CANVAS.y - 30, width: CANVAS.w + 60, height: CANVAS.h + 60, border: `30px solid #c9a24a`, boxSizing: "border-box", opacity: interpolate(frame, [reveal.paint + 50, reveal.paint + 70], [0, 1], clamp), boxShadow: "0 0 0 4px #6b4f1d inset" }} />
      {/* the brush */}
      {frame < reveal.paint + 50 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${painting ? CANVAS.x + 60 + ((frame - strokes.from) % strokes.each) / strokes.draw * 660 : tip.x} ${painting ? CANVAS.y + 200 + (k % 3) * 250 + Math.sin(frame / 5) * 30 : tip.y}) rotate(35)`}>
            <rect x={-10} y={-360} width={20} height={300} rx={8} fill="#b8874f" />
            <rect x={-14} y={-70} width={28} height={40} fill="#c9ceda" />
            <path d="M -14 -30 L 14 -30 L 6 20 L -6 20 Z" fill={painting && k >= 0 ? STROKES[k].c : colors.royal} />
          </g>
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: CANVAS.y + CANVAS.h + 60, textAlign: "center", fontFamily: fonts.serif, fontStyle: "italic", fontSize: 30, color: "#d8c8b0", opacity: interpolate(frame, [reveal.paint + 60, reveal.paint + 80], [0, 1], clamp) }}>
        “Your Idea” — NEO CAPTA, 2026
      </div>
      {/* dust in the light */}
      {new Array(20).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: (random(`dx${i}`) * 1080 + frame * 0.3) % 1080, top: (random(`dy${i}`) * 1920 - frame * 0.5 + 1920) % 1920, width: 3, height: 3, borderRadius: 2, background: "rgba(255,230,190,0.5)" }} />
      ))}
    </AbsoluteFill>
  );
};

// "اللوحة / The Painting" — a blank canvas, five strokes of colour, and the brand painted last.
export const PaintingVideo: React.FC = () => (
  <Shell
    bg="#2a2230"
    audio="painting-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "In its true colors.", ar: "نرسم فكرتك بألوانها" }}
    captions={[
      { from: blank.from + 16, to: blank.to, kicker: "THE PAINTING · اللوحة", en: "Every idea is a blank canvas.", ar: "كل فكرة… لوحة بيضاء.", top: 190 },
      { from: lost.from + 4, to: lost.to, en: "But where do you start?", ar: "بس من وين تبدأ؟", top: 190 },
      { from: brush.from + 4, to: strokes.from, kicker: "NEO CAPTA", en: "We pick up the brush.", ar: "نحن نمسك الفرشاة.", top: 190 },
      ...SERVICES.map((s, k) => ({ from: strokes.from + k * strokes.each + 4, to: k < 4 ? strokes.from + (k + 1) * strokes.each + 4 : reveal.from, kicker: `STROKE ${k + 1}`, en: s.en, ar: s.ar, enSize: 88, arSize: 76, top: 170 })),
      { from: reveal.paint + 30, to: outro.from, en: "Your idea, in its true colors.", ar: "فكرتك… بألوانها الحقيقية.", enSize: 74, top: 180 },
    ]}
  >
    <Studio />
  </Shell>
);

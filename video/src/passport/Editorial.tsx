import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { fonts, light } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Paper texture + fine grain, used as the base of every scene.
export const Paper: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: light.paper }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.35, mixBlendMode: "multiply" }}>
        <filter id="paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 8} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.44  0 0 0 0 0.4  0 0 0 0.35 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

type Line = { text: string; color?: string };

// Left-aligned magazine headline: each line rises out of a mask, Arabic line follows.
export const EditorialTitle: React.FC<{
  label?: string;
  lines: Line[];
  ar: string;
  size?: number;
  arSize?: number;
  stagger?: number;
  color?: string;
}> = ({ label, lines, ar, size = 128, arSize = 60, stagger = 5, color = light.ink }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
  const rule = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: ease });
  const arIn = interpolate(frame, [lines.length * stagger + 6, lines.length * stagger + 20], [0, 1], { ...clamp, easing: ease });
  return (
    <div style={{ padding: "0 70px" }}>
      {label ? (
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ height: 4, width: 90 * rule, background: light.royal }} />
          <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 28, letterSpacing: 5, color: light.royal, opacity: rule }}>{label}</span>
        </div>
      ) : null}
      {lines.map((l, i) => {
        const p = interpolate(frame, [i * stagger, i * stagger + 16], [0, 1], { ...clamp, easing: ease });
        return (
          <div key={i} style={{ overflow: "hidden", lineHeight: 1.02 }}>
            <div
              style={{
                fontFamily: fonts.en,
                fontWeight: 800,
                fontSize: size,
                letterSpacing: -size * 0.04,
                color: l.color ?? color,
                transform: `translateY(${(1 - p) * 105}%)`,
              }}
            >
              {l.text}
            </div>
          </div>
        );
      })}
      <div
        dir="rtl"
        style={{
          fontFamily: fonts.ar,
          fontWeight: 900,
          fontSize: arSize,
          color: light.royal,
          marginTop: 22,
          textAlign: "right",
          opacity: arIn,
          transform: `translateY(${(1 - arIn) * 30}px)`,
        }}
      >
        {ar}
      </div>
    </div>
  );
};

// Full-screen brand-blue panel sweeping across a cut.
export const BlockWipe: React.FC<{ duration?: number }> = ({ duration = 16 }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.7, 0, 0.3, 1);
  const inP = interpolate(frame, [0, duration / 2], [0, 1], { ...clamp, easing: ease });
  const outP = interpolate(frame, [duration / 2, duration], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: light.royal, transform: `translateY(${(1 - inP) * 100 - outP * 100}%)` }} />
      <div style={{ position: "absolute", inset: 0, background: light.accent, transform: `translateY(${(1 - inP) * 115 - outP * 88}%)`, opacity: 0.9, height: "12%" }} />
    </AbsoluteFill>
  );
};

// Magazine running header: brand on the left, scene counter on the right.
export const RunningHeader: React.FC<{ index: number; total: number; dark?: boolean }> = ({ index, total, dark }) => {
  const c = dark ? light.paper : light.ink;
  return (
    <div style={{ position: "absolute", top: 60, left: 70, right: 70, display: "flex", justifyContent: "space-between", fontFamily: fonts.en, fontWeight: 800, fontSize: 26, letterSpacing: 5, color: c }}>
      <span>NEO CAPTA</span>
      <span>
        {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>
  );
};

// Ink splatter dots around a stamp impact.
export const InkSplat: React.FC<{ seed: string; color: string; t: number }> = ({ seed, color, t }) => (
  <>
    {new Array(10).fill(0).map((_, i) => {
      const a = random(`${seed}a${i}`) * Math.PI * 2;
      const d = 120 + random(`${seed}d${i}`) * 80;
      const r = 3 + random(`${seed}r${i}`) * 7;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: r * 2,
            height: r * 2,
            marginLeft: -r,
            marginTop: -r,
            borderRadius: "50%",
            background: color,
            opacity: t > 0 ? 0.7 : 0,
            transform: `translate(${Math.cos(a) * d * Math.min(1, t * 1.4)}px, ${Math.sin(a) * d * Math.min(1, t * 1.4)}px)`,
          }}
        />
      );
    })}
  </>
);

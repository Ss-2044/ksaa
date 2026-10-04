import React from "react";
import { Img, random, staticFile } from "remotion";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";

export const green = { deep: "#021a10", dark: "#04301d", mid: "#0b6e3b", light: "#1fae5b" };
export const gold = { light: "#fff1b8", mid: "#e9c25a", deep: "#b07d1c" };
export const goldGradient = `linear-gradient(180deg, ${gold.light} 0%, ${gold.mid} 45%, ${gold.deep} 100%)`;

// NEO CAPTA mark, pinned top-left as requested.
export const CornerLogo: React.FC<{ width?: number; opacity?: number }> = ({ width = 210, opacity = 1 }) => (
  <Img
    src={staticFile("neocapta-logo.png")}
    style={{ position: "absolute", top: 60, left: 56, width, height: width * LOGO_RATIO, opacity, filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.75))" }}
  />
);

// Metallic gold text (gradient-clipped).
export const GoldText: React.FC<{ children: React.ReactNode; size: number; family?: string; weight?: number; style?: React.CSSProperties }> = ({ children, size, family = fonts.ar, weight = 900, style }) => (
  <span
    style={{
      fontFamily: family,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.25,
      backgroundImage: goldGradient,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.6))",
      ...style,
    }}
  >
    {children}
  </span>
);

// Generic golden cup (not any official trophy).
export const Trophy: React.FC<{ size: number; shine?: number }> = ({ size, shine = 0 }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 200 250">
    <defs>
      <linearGradient id="tg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={gold.deep} />
        <stop offset="0.35" stopColor={gold.light} />
        <stop offset="0.6" stopColor={gold.mid} />
        <stop offset="1" stopColor={gold.deep} />
      </linearGradient>
      <linearGradient id="ts" x1="0" y1="0" x2="1" y2="0">
        <stop offset={Math.max(0, shine - 0.12)} stopColor="#fff" stopOpacity={0} />
        <stop offset={shine} stopColor="#fff" stopOpacity={0.85} />
        <stop offset={Math.min(1, shine + 0.12)} stopColor="#fff" stopOpacity={0} />
      </linearGradient>
    </defs>
    <g>
      <path d="M 44 30 Q 4 30 10 70 Q 16 108 62 118" fill="none" stroke="url(#tg)" strokeWidth={12} />
      <path d="M 156 30 Q 196 30 190 70 Q 184 108 138 118" fill="none" stroke="url(#tg)" strokeWidth={12} />
      <path d="M 40 18 L 160 18 Q 160 120 112 146 L 112 176 L 88 176 L 88 146 Q 40 120 40 18 Z" fill="url(#tg)" />
      <rect x={70} y={176} width={60} height={14} rx={3} fill="url(#tg)" />
      <path d="M 52 190 L 148 190 L 160 232 L 40 232 Z" fill="url(#tg)" />
      <rect x={34} y={232} width={132} height={14} rx={4} fill={gold.deep} />
      <path d="M 100 48 L 108 66 L 128 68 L 113 81 L 118 100 L 100 90 L 82 100 L 87 81 L 72 68 L 92 66 Z" fill={gold.deep} opacity={0.55} />
      <path d="M 40 18 L 160 18 Q 160 120 112 146 L 112 176 L 88 176 L 88 146 Q 40 120 40 18 Z M 52 190 L 148 190 L 160 232 L 40 232 Z" fill="url(#ts)" />
    </g>
  </svg>
);

export const GoldConfetti: React.FC<{ t: number; count?: number; seed?: string; w?: number; h?: number; avoid?: { x0: number; x1: number; y0: number; y1: number } }> = ({ t, count = 90, seed = "g", w = 1080, h = 1920, avoid }) => {
  if (t < 0) return null;
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const x0 = random(`${seed}x${i}`) * w;
        const delay = random(`${seed}d${i}`) * 40;
        const tt = t - delay;
        if (tt < 0) return null;
        const y = -60 + tt * (5 + random(`${seed}v${i}`) * 6);
        if (y > h + 40) return null;
        const x = x0 + Math.sin(tt / 9 + i) * 40;
        if (avoid && x > avoid.x0 && x < avoid.x1 && y > avoid.y0 && y < avoid.y1) return null; // keep faces clear on stills
        const c = [gold.mid, gold.light, "#ffffff", green.light, gold.deep][i % 5];
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 16, height: 26, background: c, borderRadius: 3, transform: `rotate(${tt * (6 + (i % 7))}deg) scaleX(${Math.cos(tt / 5 + i)})` }} />;
      })}
    </>
  );
};

// Subtle Sadu-like diamond band in gold.
export const SaduBand: React.FC<{ width: number; opacity?: number }> = ({ width, opacity = 0.6 }) => (
  <svg width={width} height={44} viewBox={`0 0 ${width} 44`} style={{ opacity }}>
    <defs>
      <pattern id="sadu" width={44} height={44} patternUnits="userSpaceOnUse">
        <path d="M 22 2 L 42 22 L 22 42 L 2 22 Z" fill="none" stroke={gold.mid} strokeWidth={3} />
        <path d="M 22 12 L 32 22 L 22 32 L 12 22 Z" fill={gold.mid} />
      </pattern>
    </defs>
    <rect width={width} height={44} fill="url(#sadu)" />
  </svg>
);

import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { sky, lost, link, north, outro } = timeline;

// The guiding stars (the last one is the north star, where the brand appears).
const KEY = [
  { x: 200, y: 1400 },
  { x: 360, y: 1230 },
  { x: 540, y: 1310 },
  { x: 700, y: 1130 },
  { x: 620, y: 970 },
  { x: 780, y: 820 },
];
const field = new Array(260).fill(0).map((_, i) => ({ x: random(`x${i}`) * 1080, y: random(`y${i}`) * 1500, r: 0.8 + random(`r${i}`) * 2.2, ph: random(`p${i}`) * 6 }));

const Sky: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.05;
  const lineT = (k: number) => interpolate(frame, [link.from + k * link.each, link.from + k * link.each + 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const all = interpolate(frame, [north.from, north.from + 20], [0, 1], clamp);
  const logo = interpolate(frame, [north.logo, north.logo + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shoot = interpolate(frame, [north.shoot, north.shoot + 24], [0, 1], clamp);
  const lostFlicker = frame >= lost.from && frame < link.from;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #010208 0%, #050b2a 45%, #111f5c 75%, #2a3a86 88%, #0b1030 100%)" }} />
      {/* milky way haze */}
      <AbsoluteFill style={{ background: "linear-gradient(125deg, transparent 35%, rgba(170,185,255,0.08) 48%, rgba(170,185,255,0.12) 52%, transparent 65%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {field.map((s, i) => {
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame / 18 + s.ph));
          const appear = interpolate(frame, [i * 0.3, i * 0.3 + 20], [0, 1], clamp);
          return <circle key={i} cx={s.x + drift * (s.r / 3)} cy={s.y} r={s.r} fill="#fff" opacity={tw * appear * 0.9} />;
        })}
        {/* constellation lines */}
        {KEY.slice(0, -1).map((a, k) => {
          const b = KEY[k + 1];
          const t = lineT(k);
          return <line key={k} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * t} y2={a.y + (b.y - a.y) * t} stroke="#BFD0FF" strokeWidth={3 + all * 2} opacity={0.8} style={{ filter: "drop-shadow(0 0 10px #7E93FF)" }} />;
        })}
        {KEY.map((p, k) => {
          const lit = k === 0 ? frame >= link.from : lineT(k - 1) >= 1;
          const flick = lostFlicker ? 0.5 + 0.5 * Math.sin(frame / 3 + k * 2) : 1;
          const r = k === KEY.length - 1 ? 9 + logo * 4 : 7;
          return (
            <g key={k} opacity={interpolate(frame, [10 + k * 6, 30 + k * 6], [0, 1], clamp) * flick}>
              <circle cx={p.x} cy={p.y} r={r * (lit ? 3.2 : 2)} fill="rgba(160,180,255,0.25)" />
              <circle cx={p.x} cy={p.y} r={r} fill="#fff" style={{ filter: `drop-shadow(0 0 ${lit ? 18 : 8}px #fff)` }} />
              <path d={`M ${p.x - r * 3} ${p.y} L ${p.x + r * 3} ${p.y} M ${p.x} ${p.y - r * 3} L ${p.x} ${p.y + r * 3}`} stroke="#fff" strokeWidth={1.5} opacity={lit ? 0.8 : 0.3} />
            </g>
          );
        })}
        {/* service names beside each star once it's linked */}
        {KEY.slice(1).map((p, k) => {
          const o = interpolate(lineT(k), [0.8, 1], [0, 1], clamp);
          const left = p.x > 600;
          return (
            <g key={`t${k}`} opacity={o * (1 - logo * 0.6)}>
              <text x={p.x + (left ? -34 : 34)} y={p.y - 6} textAnchor={left ? "end" : "start"} fill="#DCE4FF" fontFamily="Playfair Display" fontStyle="italic" fontSize={34}>
                {SERVICES[k].en}
              </text>
              <text x={p.x + (left ? -34 : 34)} y={p.y + 34} textAnchor={left ? "end" : "start"} fill="#8FA2F0" fontFamily="Aref Ruqaa" fontSize={34}>
                {SERVICES[k].ar}
              </text>
            </g>
          );
        })}
        {/* shooting star */}
        {shoot > 0 && shoot < 1 ? <line x1={1100 - shoot * 900} y1={200 + shoot * 300} x2={1100 - shoot * 900 + 160} y2={200 + shoot * 300 - 55} stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={1 - shoot} /> : null}
      </svg>
      {/* the north star becomes the brand */}
      <div style={{ position: "absolute", left: KEY[5].x - 200, top: KEY[5].y - 170, width: 400, opacity: logo, transform: `scale(${0.6 + logo * 0.4})`, filter: `drop-shadow(0 0 ${30 * logo}px rgba(160,180,255,0.9))` }}>
        <Img src={staticFile("neocapta-logo-white.png")} style={{ width: "100%" }} />
      </div>
      {/* dunes + a lone watcher */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M 0 1560 C 240 1470 420 1500 620 1560 S 960 1500 1080 1520 L 1080 1920 L 0 1920 Z" fill="#070a1c" />
        <path d="M 0 1680 C 300 1600 520 1640 760 1700 S 1000 1660 1080 1690 L 1080 1920 L 0 1920 Z" fill="#03040c" />
        <g transform="translate(300 1560)" fill="#03040c">
          <circle cx={0} cy={-128} r={14} />
          <path d="M -16 -112 L 16 -112 L 26 -10 L 12 -10 L 6 -60 L -6 -60 L -12 -10 L -26 -10 Z" />
          <path d="M -16 -110 L -34 -150 L -26 -154 L -8 -118 Z" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// "نهتدي بالنجوم / Guided by the Stars" — the brand connects scattered stars into a constellation that points the way.
export const StarsVideo: React.FC = () => (
  <Shell
    bg="#010208"
    audio="stars-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Every idea, a direction.", ar: "لكل فكرة وجهة" }}
    flashes={[north.logo]}
    captions={[
      { from: sky.from + 20, to: sky.to, kicker: "GUIDED BY THE STARS · نهتدي بالنجوم", en: "Every idea is a star.", ar: "كل فكرة… نجمة." },
      { from: lost.from + 4, to: lost.to, en: "But a star alone doesn't show the way.", ar: "بس النجمة لحالها… ما تدلّك الطريق.", enSize: 72, arSize: 70 },
      { from: link.from + 4, to: link.from + 150, kicker: "NEO CAPTA", en: "Our ancestors followed the stars.", ar: "أجدادنا اهتدوا بالنجوم…", enSize: 74 },
      { from: link.from + 156, to: north.from, en: "We connect them for you.", ar: "ونحن نوصلها لك.", enSize: 80 },
      { from: north.from + 30, to: outro.from, en: "Until they point to your direction.", ar: "لين تدلّك على وجهتك.", enSize: 72, arSize: 74 },
    ]}
  >
    <Sky />
  </Shell>
);


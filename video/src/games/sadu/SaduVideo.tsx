import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { tangle, lost, warp, weave, finish, outro } = timeline;

// Sadu palette with the brand blues woven in.
const C = { red: "#9E2B25", black: "#14110f", white: "#EFE7D6", beige: "#C9A879", royal: "#344499", navy: "#0A1033", accent: "#5E78FF" };
const COLS = 45;
const CELL = 20;
const LEFT = 90;
const BOTTOM = 1720;
const BANDS = 5;
const ROWS = BANDS * weave.rowsPerBand;

// Cell colour for each band's motif (x = column, y = row inside the band).
const motif = (band: number, x: number, y: number): string => {
  const h = weave.rowsPerBand;
  switch (band) {
    case 0: // stripes
      return y % 3 === 0 ? C.black : y % 3 === 1 ? C.red : C.white;
    case 1: {
      // triangles (teeth)
      const t = x % 10;
      return Math.abs(t - 5) <= y * 0.6 ? C.royal : C.white;
    }
    case 2: {
      // diamonds
      const cx = (x % 12) - 6;
      const cy = y - (h - 1) / 2;
      const d = Math.abs(cx) + Math.abs(cy);
      return d <= 2 ? C.red : d <= 4 ? C.black : C.beige;
    }
    case 3: {
      // chevrons
      const v = (x + Math.abs((y % 6) - 3)) % 6;
      return v < 2 ? C.navy : v < 4 ? C.white : C.accent;
    }
    default: {
      // "eyes" (dots) on red
      return (x % 5 === 2 && y % 4 === 2) ? C.white : y === 0 || y === h - 1 ? C.black : C.red;
    }
  }
};

const threads = new Array(18).fill(0).map((_, i) => ({ color: Object.values(C)[i % 7], seed: i }));

const Loom: React.FC = () => {
  const frame = useCurrentFrame();
  const straighten = interpolate(frame, [warp.from, warp.to], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const rowsDone = interpolate(frame, [weave.from, weave.from + ROWS * weave.rowFrames], [0, ROWS], clamp);
  const logo = interpolate(frame, [finish.logo, finish.logo + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shake = frame >= lost.from && frame < warp.from ? Math.sin(frame / 2) * 6 : 0;
  const curRow = Math.min(ROWS - 1, Math.floor(rowsDone));
  const shuttleX = LEFT + ((Math.floor(rowsDone) % 2 === 0 ? rowsDone % 1 : 1 - (rowsDone % 1)) * COLS * CELL);
  const shuttleY = BOTTOM - (curRow + 0.5) * CELL;
  const topY = BOTTOM - ROWS * CELL;

  return (
    <AbsoluteFill>
      {/* loom beams */}
      <div style={{ position: "absolute", left: 50, right: 50, top: topY - 70, height: 34, borderRadius: 17, background: "linear-gradient(180deg, #7a5433, #3f2a18)", opacity: straighten }} />
      <div style={{ position: "absolute", left: 50, right: 50, top: BOTTOM + 10, height: 34, borderRadius: 17, background: "linear-gradient(180deg, #7a5433, #3f2a18)", opacity: straighten }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* loose threads -> warp */}
        {threads.map((t, i) => {
          const x0 = 150 + random(`a${i}`) * 780;
          const y0 = 700 + random(`b${i}`) * 900;
          const wob = (k: number) => Math.sin(frame / (14 + i) + k + i) * 60;
          const loose = `M ${x0} ${y0} C ${x0 + 300 + wob(1)} ${y0 - 250}, ${x0 - 280 + wob(2)} ${y0 + 260}, ${x0 + 120 + wob(3) + shake} ${y0 + 420}`;
          const wx = LEFT + (i + 0.5) * ((COLS * CELL) / threads.length);
          const straight = `M ${wx} ${topY - 60} C ${wx} ${topY + 200}, ${wx} ${BOTTOM - 200}, ${wx} ${BOTTOM + 20}`;
          const p = straighten;
          const draw = interpolate(frame, [tangle.from + i * 3, tangle.from + i * 3 + 30], [1, 0], clamp);
          return (
            <g key={i}>
              {p < 1 ? <path d={loose} stroke={t.color} strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={draw} opacity={1 - p} /> : null}
              {p > 0 ? <path d={straight} stroke={t.color} strokeWidth={4} fill="none" opacity={p * 0.7} /> : null}
            </g>
          );
        })}
        {/* woven rows */}
        {new Array(Math.ceil(rowsDone)).fill(0).map((_, r) => {
          const band = Math.floor(r / weave.rowsPerBand);
          const y = r % weave.rowsPerBand;
          const partial = r === Math.floor(rowsDone) ? rowsDone % 1 : 1;
          const cols = Math.ceil(COLS * partial);
          const fromRight = r % 2 === 1;
          return new Array(cols).fill(0).map((__, k) => {
            const x = fromRight ? COLS - 1 - k : k;
            return <rect key={`${r}-${x}`} x={LEFT + x * CELL} y={BOTTOM - (r + 1) * CELL} width={CELL - 1} height={CELL - 1} rx={3} fill={motif(band, x, y)} />;
          });
        })}
        {/* shuttle */}
        {rowsDone > 0 && rowsDone < ROWS ? (
          <g transform={`translate(${shuttleX} ${shuttleY})`}>
            <path d="M -60 0 Q -30 -16 0 -16 Q 30 -16 60 0 Q 30 16 0 16 Q -30 16 -60 0 Z" fill="#b8874f" stroke="#3f2a18" strokeWidth={3} />
          </g>
        ) : null}
        {/* band labels */}
        {SERVICES.map((s, b) => {
          const done = rowsDone >= (b + 1) * weave.rowsPerBand;
          const y = BOTTOM - (b + 0.5) * weave.rowsPerBand * CELL;
          return (
            <g key={s.en} opacity={done ? interpolate(frame, [finish.from, finish.from + 20], [1, 0], clamp) : 0}>
              <rect x={1000} y={y - 26} width={6} height={52} fill="#EFE7D6" />
              <text x={992} y={y + 10} textAnchor="end" fill="#EFE7D6" fontFamily="Aref Ruqaa" fontSize={30} style={{ paintOrder: "stroke" }} stroke="#14110f" strokeWidth={6}>
                {s.ar}
              </text>
            </g>
          );
        })}
      </svg>
      {/* the brand woven into the middle */}
      <div
        style={{
          position: "absolute",
          left: 540 - 260,
          top: BOTTOM - ROWS * CELL / 2 - 200,
          width: 520,
          height: 400,
          borderRadius: 18,
          background: C.navy,
          border: `8px dashed ${C.white}`,
          boxShadow: "0 0 0 10px #9E2B25",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: logo,
          transform: `scale(${0.8 + logo * 0.2})`,
        }}
      >
        <Img src={staticFile("neocapta-logo-white.png")} style={{ width: 380 }} />
      </div>
    </AbsoluteFill>
  );
};

// "السدو / Al Sadu" — scattered threads are woven, band by band, into a pattern that carries the brand.
export const SaduVideo: React.FC = () => {
  const band = (b: number) => weave.from + b * weave.rowsPerBand * weave.rowFrames;
  return (
    <Shell
      bg="radial-gradient(ellipse at 50% 55%, #2a1c14 0%, #120c08 60%, #070403 100%)"
      audio="sadu-music.wav"
      outro={{ from: outro.from, duration: outro.duration, en: "Woven with care.", ar: "ننسج فكرتك خيط خيط" }}
      flashes={[finish.logo]}
      captions={[
        { from: tangle.from + 20, to: tangle.to, kicker: "AL SADU · السدو", en: "Every idea is a thread.", ar: "كل فكرة… خيط." },
        { from: lost.from + 4, to: lost.to, en: "But threads alone don't make a pattern.", ar: "بس الخيوط لحالها… ما تصنع نقش.", enSize: 72, arSize: 70 },
        { from: warp.from + 4, to: weave.from + 10, kicker: "NEO CAPTA", en: "We set the loom.", ar: "نحن نجهّز النول." },
        ...SERVICES.map((s, b) => ({ from: band(b) + 4, to: b < 4 ? band(b + 1) + 4 : finish.from, kicker: `ROW ${b + 1}`, en: s.en, ar: s.ar, enSize: 96, arSize: 84 })),
        { from: finish.from + 10, to: outro.from, en: "Your idea, woven into a brand.", ar: "فكرتك… صارت نقش يعرفه الكل.", enSize: 72, arSize: 70 },
      ]}
    >
      <Loom />
    </Shell>
  );
};

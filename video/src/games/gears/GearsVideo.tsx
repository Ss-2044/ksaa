import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { alone, lost, mesh, machine, outro } = timeline;
const TOOTH = 26; // tooth pitch (px of pitch circumference per tooth)

// Gear outline with trapezoid teeth around a pitch radius r.
const gearPath = (r: number) => {
  const n = Math.max(8, Math.round((2 * Math.PI * r) / TOOTH));
  const h = 14;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const step = (Math.PI * 2) / n;
    const pts = [
      [a0, r - h / 2],
      [a0 + step * 0.15, r + h / 2],
      [a0 + step * 0.45, r + h / 2],
      [a0 + step * 0.6, r - h / 2],
    ];
    pts.forEach(([a, rr], k) => (d += `${i === 0 && k === 0 ? "M" : "L"} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)} `));
  }
  return { d: d + "Z", n };
};

// The chain: the idea's gear first, then one per service, then the brand gear. Each sits tangent to the previous one.
type G = { r: number; x: number; y: number; label?: number; brand?: boolean };
const chain: G[] = (() => {
  const spec: { r: number; ang: number; label?: number; brand?: boolean }[] = [
    { r: 110, ang: 0 },
    { r: 80, ang: -12, label: 0 },
    { r: 120, ang: -8, label: 1 },
    { r: 75, ang: -110, label: 2 },
    { r: 105, ang: 178, label: 3 },
    { r: 85, ang: -125, label: 4 },
    { r: 200, ang: -40, brand: true },
  ];
  const out: G[] = [{ r: spec[0].r, x: 330, y: 1560 }];
  for (let i = 1; i < spec.length; i++) {
    const p = out[i - 1];
    const d = p.r + spec[i].r + 2;
    const a = (spec[i].ang * Math.PI) / 180;
    out.push({ r: spec[i].r, x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, label: spec[i].label, brand: spec[i].brand });
  }
  return out;
})();

// Scale + offset that fits the chain (including teeth) inside the frame below the captions.
const FIT = (() => {
  const minX = Math.min(...chain.map((g) => g.x - g.r - 14));
  const maxX = Math.max(...chain.map((g) => g.x + g.r + 14));
  const minY = Math.min(...chain.map((g) => g.y - g.r - 14));
  const maxY = Math.max(...chain.map((g) => g.y + g.r + 14));
  const k = Math.min(900 / (maxX - minX), 1120 / (maxY - minY));
  return { k, tx: 540 - ((minX + maxX) / 2) * k, ty: 1250 - ((minY + maxY) / 2) * k };
})();
const fx = (x: number) => FIT.tx + x * FIT.k;
const fy = (y: number) => FIT.ty + y * FIT.k;

const Gear: React.FC<{ g: G; angle: number; lit: boolean }> = ({ g, angle, lit }) => {
  const { d } = gearPath(g.r);
  return (
    <g transform={`translate(${g.x} ${g.y})`}>
      <g transform={`rotate(${angle})`}>
        <path d={d} fill={g.brand ? "#1b2250" : lit ? "#9aa3b5" : "#4a5064"} stroke={lit ? colors.accent : "#6d7488"} strokeWidth={3} />
        <circle r={g.r * 0.62} fill={g.brand ? "#0A1033" : lit ? "#7a8296" : "#393e4d"} />
        {!g.brand
          ? [0, 1, 2, 3].map((k) => <circle key={k} cx={Math.cos((k * Math.PI) / 2) * g.r * 0.4} cy={Math.sin((k * Math.PI) / 2) * g.r * 0.4} r={g.r * 0.11} fill="#1b1e27" />)
          : null}
        <circle r={g.r * 0.14} fill="#1b1e27" stroke="#c9ceda" strokeWidth={3} />
      </g>
    </g>
  );
};

const Machine: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // speed of the first gear: steady, then frantic (spinning uselessly), then steady once linked
  const spinBase = frame < lost.from ? frame * 1.2 : frame < mesh.from ? lost.from * 1.2 + (frame - lost.from) * 4 : lost.from * 1.2 + (mesh.from - lost.from) * 4 + (frame - mesh.from) * 1.2;
  const inAt = (i: number) => (i === 0 ? 0 : i <= 5 ? mesh.from + (i - 1) * mesh.each : machine.engage);
  const engaged = (i: number) => frame >= inAt(i) + 18;
  const shake = frame >= lost.from && frame < mesh.from ? Math.sin(frame * 2.3) * 5 : 0;
  const glow = interpolate(frame, [machine.engage + 18, machine.engage + 40], [0, 1], clamp);

  // each linked gear turns the opposite way, scaled by radius ratio; unlinked ones sit still
  const angles: number[] = [];
  chain.forEach((g, i) => {
    if (i === 0) angles.push(spinBase);
    else {
      const ratio = chain[0].r / g.r;
      const dir = i % 2 === 0 ? 1 : -1;
      const base = engaged(i) ? (spinBase - (lost.from * 1.2 + (mesh.from - lost.from) * 4)) * ratio * dir : 0;
      angles.push(base + (180 / gearPath(g.r).n) * (i % 2)); // half-tooth offset so the teeth interlock
    }
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #1c2130 0%, #0a0c12 70%)" }} />
      <AbsoluteFill style={{ opacity: 0.15, backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      {glow > 0 ? <div style={{ position: "absolute", left: fx(chain[6].x) - 420, top: fy(chain[6].y) - 420, width: 840, height: 840, borderRadius: "50%", background: "radial-gradient(circle, rgba(94,120,255,0.5), rgba(0,0,0,0) 65%)", opacity: glow }} /> : null}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${FIT.tx} ${FIT.ty}) scale(${FIT.k})`}>
        {chain.map((g, i) => {
          const t0 = inAt(i);
          if (frame < t0 && i > 0) return null;
          const slide = i === 0 ? 1 : spring({ frame: frame - t0, fps, config: { damping: 14, stiffness: 90 } });
          const dx = (1 - slide) * (g.x > 540 ? 700 : -700);
          return (
            <g key={i} transform={`translate(${dx + (i === 0 ? shake : 0)} 0)`}>
              <Gear g={g} angle={angles[i]} lit={engaged(i) || (i === 0 && frame >= mesh.from + 18)} />
              {engaged(i) && i > 0 && !g.brand ? (
                <circle cx={(g.x + chain[i - 1].x) / 2 + (chain[i - 1].x - g.x) * ((g.r - chain[i - 1].r) / (2 * (g.r + chain[i - 1].r)))} cy={(g.y + chain[i - 1].y) / 2} r={interpolate(frame - (t0 + 18), [0, 12], [40, 0], clamp)} fill="none" stroke="#FFE7A3" strokeWidth={4} />
              ) : null}
            </g>
          );
        })}
        {/* labels */}
        {chain.map((g, i) =>
          g.label !== undefined && frame >= inAt(i) + 18 ? (
            <g key={`l${i}`} opacity={interpolate(frame, [inAt(i) + 18, inAt(i) + 30], [0, 1], clamp) * (1 - glow * 0.5)}>
              <circle cx={g.x} cy={g.y} r={g.r * 0.6} fill="rgba(10,12,18,0.82)" />
              <text x={g.x} y={g.y - g.r * 0.04} textAnchor="middle" fill="#E4E6EE" fontFamily="Playfair Display" fontStyle="italic" fontSize={g.r * 0.3}>
                {SERVICES[g.label].en}
              </text>
              <text x={g.x} y={g.y + g.r * 0.3} textAnchor="middle" fill={colors.accent} fontFamily="Aref Ruqaa" fontSize={g.r * 0.3}>
                {SERVICES[g.label].ar}
              </text>
            </g>
          ) : null,
        )}
        </g>
      </svg>
      {/* brand in the big gear's hub (turns with it slowly) */}
      {frame >= machine.engage ? (
        <div style={{ position: "absolute", left: fx(chain[6].x) - 150 * FIT.k, top: fy(chain[6].y) - 110 * FIT.k, width: 300 * FIT.k, opacity: interpolate(frame, [machine.engage + 10, machine.engage + 30], [0, 1], clamp) }}>
          <Img src={staticFile("neocapta-logo.png")} style={{ width: "100%" }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// "التروس / Gears" — an idea alone spins in place; linked with the right gears, the whole machine works.
export const GearsVideo: React.FC = () => (
  <Shell
    bg="#0a0c12"
    audio="gears-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "We make ideas work.", ar: "نخلّي فكرتك تشتغل" }}
    flashes={[machine.engage + 18]}
    captions={[
      { from: alone.from + 16, to: alone.to, kicker: "GEARS · التروس", en: "An idea alone…", ar: "فكرة لحالها…" },
      { from: lost.from + 4, to: lost.to, en: "…spins, but moves nothing.", ar: "…تلف، بس ما تحرّك شي.", enSize: 76 },
      ...SERVICES.map((s, k) => ({ from: mesh.from + k * mesh.each + 14, to: mesh.from + (k + 1) * mesh.each + 14, kicker: k === 0 ? "NEO CAPTA · LINK 1" : `LINK ${k + 1}`, en: s.en, ar: s.ar, enSize: 92, arSize: 80 })),
      { from: machine.engage + 20, to: outro.from, en: "Now everything turns.", ar: "الحين… كل شي يشتغل.", enSize: 80 },
    ]}
  >
    <Machine />
  </Shell>
);

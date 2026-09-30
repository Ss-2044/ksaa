import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { blueprint, fonts } from "../theme";
import { BlueprintTitle } from "./BlueprintTitle";
import { Box, P, centered, edges, faces, poly, proj } from "./iso";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const layers: { box: Box; en: string; ar: string; part: string }[] = [
  { box: centered(5.2, 5.2, 0, 0.6), en: "STRATEGY", ar: "الاستراتيجية", part: "FOUNDATION" },
  { box: centered(4, 4, 0.6, 2.6), en: "BRANDING", ar: "الهوية البصرية", part: "STRUCTURE" },
  { box: centered(3.6, 3.6, 3.2, 2.4), en: "CONTENT", ar: "صناعة المحتوى", part: "FLOORS" },
  { box: centered(3.2, 3.2, 5.6, 1.8), en: "CAMPAIGNS", ar: "الحملات الإعلانية", part: "FACADE" },
  { box: centered(2.4, 2.4, 7.4, 1.6), en: "GROWTH", ar: "النمو", part: "SUMMIT" },
];
const SPIRE = centered(0.3, 0.3, 9, 1.4);
const TOWER_H = 10.4;

// Neighbouring buildings for the skyline (x, y offsets in units).
const city = new Array(14).fill(0).map((_, i) => {
  const side = i % 2 === 0 ? -1 : 1;
  const w = 1.4 + random(`cw${i}`) * 1.6;
  return {
    box: centered(w, w, 0, 1.5 + random(`ch${i}`) * 5, side * (3.6 + random(`cx${i}`) * 5), -side * (1 + random(`cy${i}`) * 4) + (random(`cz${i}`) - 0.5) * 6),
    delay: random(`cd${i}`) * 30,
  };
});

// Hand-drawn wobble: split a segment and jitter its points.
const wobbly = (a: P, b: P, seed: string, amp: number) => {
  const n = 6;
  let d = `M ${a.x} ${a.y}`;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const jx = i === n ? 0 : (random(`${seed}x${i}`) - 0.5) * amp;
    const jy = i === n ? 0 : (random(`${seed}y${i}`) - 0.5) * amp;
    d += ` L ${(a.x + (b.x - a.x) * t + jx).toFixed(1)} ${(a.y + (b.y - a.y) * t + jy).toFixed(1)}`;
  }
  return d;
};

const allEdges = [...layers.map((l) => l.box), SPIRE].flatMap((b) => edges(b));

const Windows: React.FC<{ box: Box; lit: number; seed: string }> = ({ box, lit, seed }) => {
  const cols = Math.max(2, Math.floor(box.w / 0.55));
  const rows = Math.max(1, Math.floor(box.h / 0.6));
  const out: React.ReactNode[] = [];
  for (const face of ["left", "right"] as const) {
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const u0 = (c + 0.25) / cols;
        const u1 = (c + 0.75) / cols;
        const z0 = box.z + ((r + 0.25) / rows) * box.h;
        const z1 = box.z + ((r + 0.7) / rows) * box.h;
        const at = (u: number, z: number) =>
          face === "left" ? proj(box.x + u * box.w, box.y + box.d, z) : proj(box.x + box.w, box.y + u * box.d, z);
        const on = lit > random(`${seed}${face}${c}${r}`);
        out.push(<polygon key={`${face}${c}${r}`} points={poly([at(u0, z0), at(u1, z0), at(u1, z1), at(u0, z1)])} fill={on ? blueprint.lit : blueprint.window} opacity={on ? 1 : 0.8} style={on ? { filter: "drop-shadow(0 0 6px #FFE7A3)" } : undefined} />);
      }
    }
  }
  return <>{out}</>;
};

const SolidBox: React.FC<{ box: Box; dark?: boolean }> = ({ box, dark }) => {
  const f = faces(box);
  return (
    <g stroke={dark ? "rgba(234,241,255,0.25)" : blueprint.line} strokeWidth={dark ? 1.5 : 2.5} strokeLinejoin="round">
      <polygon points={poly(f.left)} fill={dark ? "#0d1640" : blueprint.left} />
      <polygon points={poly(f.right)} fill={dark ? "#091030" : blueprint.right} />
      <polygon points={poly(f.top)} fill={dark ? "#16215a" : blueprint.top} />
    </g>
  );
};

// Scene — "From sketch to skyline": a rough idea becomes a precise plan, then a tower, then a landmark.
export const BlueprintScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { sketch, question, plan, build, skyline } = timeline;

  const night = interpolate(frame, [skyline.from, skyline.from + 40], [0, 1], clamp);
  const zoom = interpolate(frame, [skyline.from, skyline.from + 60], [1, 0.72], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const lights = interpolate(frame, [skyline.lightsOn, skyline.lightsOn + 50], [0, 1], clamp);
  const sign = spring({ frame: frame - skyline.signAt, fps, config: { damping: 12 } });

  // sketch: drawn, then boiling with growing uncertainty, then erased
  const sketchDraw = interpolate(frame, [sketch.drawFrom, sketch.drawTo], [0, 1], clamp);
  const boil = frame >= question.from ? Math.floor(frame / 4) : 0;
  const amp = 14 + interpolate(frame, [question.from, question.to - 30], [0, 26], clamp);
  const sketchOut = interpolate(frame, [question.to - 22, question.to], [1, 0], clamp);
  const planDraw = interpolate(frame, [plan.from, plan.drawTo], [0, 1], clamp);
  const wireOpacity = interpolate(frame, [build.from, build.from + 5 * build.each], [1, 0.35], clamp) * (1 - night);

  const landAt = (k: number) => build.from + k * build.each + build.drop;
  const topY = proj(0, 0, TOWER_H).y;

  return (
    <AbsoluteFill>
      {/* blueprint paper -> night sky */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #1541A6 0%, ${blueprint.paper} 55%, ${blueprint.paperDeep} 100%)` }} />
      <AbsoluteFill
        style={{
          opacity: 1 - night,
          backgroundImage:
            "linear-gradient(rgba(234,241,255,0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(234,241,255,0.16) 2px, transparent 2px), linear-gradient(rgba(234,241,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(234,241,255,0.07) 1px, transparent 1px)",
          backgroundSize: "180px 180px, 180px 180px, 36px 36px, 36px 36px",
        }}
      />
      <AbsoluteFill style={{ opacity: night, background: `linear-gradient(180deg, ${blueprint.night} 0%, #0b1540 70%, #1d2c70 100%)` }}>
        {new Array(60).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: random(`sx${i}`) * 1080, top: random(`sy${i}`) * 900, width: 3, height: 3, borderRadius: 2, background: "#fff", opacity: 0.3 + 0.5 * Math.abs(Math.sin(frame / 10 + i)) }} />
        ))}
      </AbsoluteFill>

      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 82%" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* skyline neighbours */}
          {night > 0
            ? city.map((c, i) => {
                const rise = interpolate(frame, [skyline.from + c.delay, skyline.from + c.delay + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
                return rise > 0 ? (
                  <g key={i}>
                    <SolidBox box={{ ...c.box, h: c.box.h * rise }} dark />
                    <Windows box={{ ...c.box, h: c.box.h * rise }} lit={lights * 0.6} seed={`c${i}`} />
                  </g>
                ) : null;
              })
            : null}

          {/* 1-2. rough sketch */}
          {frame < question.to ? (
            <g opacity={sketchOut} stroke="rgba(234,241,255,0.9)" strokeWidth={4} fill="none" strokeLinecap="round">
              {allEdges
                .filter((e) => !e.hidden)
                .map((e, i, arr) => {
                  const t = interpolate(sketchDraw * arr.length - i, [0, 1], [0, 1], clamp);
                  return t > 0 ? <path key={i} d={wobbly(e.a, e.b, `s${i}-${boil}`, amp)} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} /> : null;
                })}
            </g>
          ) : null}
          {frame >= question.from && frame < question.to
            ? new Array(9).fill(0).map((_, i) => {
                const at = question.from + 8 + i * 6;
                const o = interpolate(frame, [at, at + 6], [0, 1], clamp) * sketchOut;
                return (
                  <text key={i} x={200 + random(`qx${i}`) * 680} y={900 + random(`qy${i}`) * 700} fill={blueprint.lit} fontFamily="Caveat" fontWeight={700} fontSize={70 + random(`qs${i}`) * 50} opacity={o} transform={`rotate(${(random(`qr${i}`) - 0.5) * 40} ${540} ${1200})`}>
                    ?
                  </text>
                );
              })
            : null}

          {/* 3. precise plan (wireframe + dimensions) */}
          {frame >= plan.from ? (
            <g opacity={wireOpacity} stroke={blueprint.line} strokeWidth={2.5} fill="none">
              {allEdges.map((e, i) => {
                const t = interpolate(planDraw * allEdges.length - i * 0.9, [0, 3], [0, 1], clamp);
                return <line key={i} x1={e.a.x} y1={e.a.y} x2={e.a.x + (e.b.x - e.a.x) * t} y2={e.a.y + (e.b.y - e.a.y) * t} strokeDasharray={e.hidden ? "10 10" : undefined} opacity={e.hidden ? 0.6 : 1} />;
              })}
              {/* height dimension */}
              <g opacity={interpolate(frame, [plan.drawTo - 20, plan.drawTo], [0, 1], clamp)}>
                <line x1={150} y1={proj(-2.6, 2.6, 0).y} x2={150} y2={topY} />
                <line x1={130} y1={proj(-2.6, 2.6, 0).y} x2={170} y2={proj(-2.6, 2.6, 0).y} />
                <line x1={130} y1={topY} x2={170} y2={topY} />
                <text x={120} y={(topY + proj(-2.6, 2.6, 0).y) / 2} fill={blueprint.line} stroke="none" fontFamily="IBM Plex Mono" fontWeight={700} fontSize={26} transform={`rotate(-90 120 ${(topY + proj(-2.6, 2.6, 0).y) / 2})`} textAnchor="middle">
                  H = 10.4 · IDEA HEIGHT
                </text>
              </g>
            </g>
          ) : null}

          {/* 4. build, layer by layer */}
          {layers.map((l, k) => {
            const start = build.from + k * build.each;
            if (frame < start) return null;
            const drop = spring({ frame: frame - start, fps, config: { damping: 12, stiffness: 120 } });
            const dy = (1 - drop) * -700;
            return (
              <g key={l.en} transform={`translate(0 ${dy})`}>
                <SolidBox box={l.box} />
                {k > 0 ? <Windows box={l.box} lit={lights} seed={`t${k}`} /> : null}
              </g>
            );
          })}
          {frame >= build.from + 4 * build.each + 10 ? (
            <g transform={`translate(0 ${(1 - spring({ frame: frame - (build.from + 4 * build.each + 10), fps, config: { damping: 12 } })) * -400})`}>
              <SolidBox box={SPIRE} />
            </g>
          ) : null}
          {/* campaign billboard on the facade */}
          {frame >= landAt(3) ? (
            <polygon
              points={poly([proj(1.6, -1.2, 5.9), proj(1.6, 1.2, 5.9), proj(1.6, 1.2, 7.1), proj(1.6, -1.2, 7.1)])}
              fill={lights > 0 ? "#5E78FF" : "#2B3A9A"}
              stroke={blueprint.line}
              strokeWidth={2}
              style={{ filter: lights > 0 ? "drop-shadow(0 0 20px #5E78FF)" : undefined }}
            />
          ) : null}
          {/* dust on landing */}
          {layers.map((l, k) => {
            const t = frame - landAt(k);
            if (t < 0 || t > 20) return null;
            const base = proj(l.box.x + l.box.w, l.box.y + l.box.d, l.box.z);
            return (
              <g key={k} opacity={1 - t / 20}>
                {new Array(12).fill(0).map((_, i) => (
                  <circle key={i} cx={540 + (random(`dx${k}${i}`) - 0.5) * (l.box.w * 140) * (0.4 + t / 20)} cy={base.y - l.box.h * 20 - random(`dy${k}${i}`) * 40 * (t / 20)} r={4 + random(`dr${k}${i}`) * 6} fill={blueprint.line} opacity={0.5} />
                ))}
              </g>
            );
          })}
        </svg>

        {/* callouts */}
        {layers.map((l, k) => {
          const t0 = landAt(k);
          if (frame < t0) return null;
          const p = interpolate(frame, [t0, t0 + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          const anchor = proj(l.box.x + l.box.w, l.box.y + l.box.d / 2, l.box.z + l.box.h / 2);
          const current = k === Math.min(4, Math.floor((frame - build.from) / build.each));
          const dim = frame >= skyline.from ? 0 : current ? 1 : 0.45;
          const labelY = 1420 - k * 152; // foundation label lowest, summit highest
          return (
            <div key={l.en} style={{ position: "absolute", inset: 0, opacity: p * dim, pointerEvents: "none" }}>
              <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
                <polyline points={`${anchor.x},${anchor.y} ${anchor.x + 60},${labelY + 40} 1030,${labelY + 40}`} stroke={blueprint.lit} strokeWidth={2.5} fill="none" strokeDasharray={`${p * 700} 700`} />
                <circle cx={anchor.x} cy={anchor.y} r={7} fill={blueprint.lit} />
              </svg>
              <div style={{ position: "absolute", right: 50, top: labelY - 42, textAlign: "right" }}>
                <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: blueprint.lit }}>
                  {String(k + 1).padStart(2, "0")} · {l.part}
                </div>
                <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 36, color: blueprint.line }}>{l.en}</div>
              </div>
              <div dir="rtl" style={{ position: "absolute", right: 50, top: labelY + 48, fontFamily: fonts.ar, fontWeight: 700, fontSize: 30, color: blueprint.line }}>
                {l.ar}
              </div>
            </div>
          );
        })}

        {/* sign on the summit */}
        {frame >= skyline.signAt ? (
          <div style={{ position: "absolute", left: 540 - 170, top: topY - 250, width: 340, transform: `scale(${sign})`, transformOrigin: "50% 100%" }}>
            <div style={{ padding: "18px 22px", borderRadius: 14, background: "rgba(4,8,23,0.85)", border: `3px solid ${blueprint.line}`, boxShadow: `0 0 ${60 * sign}px rgba(94,120,255,0.9)` }}>
              <Img src={staticFile("neocapta-logo-white.png")} style={{ width: "100%" }} />
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      {/* title block (drawing sheet) */}
      <div style={{ position: "absolute", left: 50, bottom: 50, width: 400, border: `2px solid ${blueprint.line}`, fontFamily: fonts.mono, fontSize: 18, color: blueprint.line, opacity: interpolate(frame, [plan.from, plan.from + 20, skyline.from, skyline.from + 20], [0, 0.9, 0.9, 0], clamp) }}>
        {[
          ["PROJECT", "YOUR IDEA · فكرتك"],
          ["ARCHITECT", "NEO CAPTA"],
          ["DWG", "01 / 01 · SCALE 1:1"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", borderBottom: `1px solid ${blueprint.faint}` }}>
            <div style={{ width: 130, padding: "6px 10px", borderRight: `1px solid ${blueprint.faint}`, color: blueprint.lit }}>{k}</div>
            <div style={{ padding: "6px 10px" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* captions */}
      <Sequence from={sketch.drawFrom + 20} durationInFrames={question.from - sketch.drawFrom - 20}>
        <AbsoluteFill style={{ paddingTop: 260 }}>
          <BlueprintTitle kicker="// SKETCH 01" en="Every idea starts as a sketch." ar="كل فكرة تبدأ برسمة." />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={question.from + 4} durationInFrames={question.to - question.from - 4}>
        <AbsoluteFill style={{ paddingTop: 260 }}>
          <BlueprintTitle kicker="// ERROR: NO DIRECTION" en="But not every sketch becomes a building." ar="لكن ليست كل رسمة تصبح بناءً." size={72} arSize={58} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={plan.from + 4} durationInFrames={build.from - plan.from - 4}>
        <AbsoluteFill style={{ paddingTop: 260 }}>
          <BlueprintTitle kicker="// NEO CAPTA" en="We turn ideas into structures." ar="نحن نحوّل الأفكار إلى بناء." size={76} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={build.from + 6} durationInFrames={skyline.from - build.from - 6}>
        <AbsoluteFill style={{ paddingTop: 260 }}>
          <BlueprintTitle kicker="// BUILDING…" en="Floor by floor." ar="طابقًا بعد طابق." size={92} arSize={70} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={skyline.signAt} durationInFrames={skyline.to - skyline.signAt}>
        <AbsoluteFill style={{ paddingTop: 200 }}>
          <BlueprintTitle kicker="// COMPLETE ✓" en="From an idea… to a landmark." ar="من فكرة… إلى معلم." size={80} arSize={70} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

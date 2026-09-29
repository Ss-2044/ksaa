import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, reveal, sceneOpacity } from "../anim";
import { colors, fonts } from "../theme";
import { displayAr, displayEn } from "../ui";

const W = 1920;
const H = 1080;

/** Closed SVG path for a dune ridge made of two layered sine waves. */
const dunePath = (base: number, amp: number, len: number, shift: number) => {
  let d = `M -100 ${H}`;
  for (let x = -100; x <= W + 100; x += 16) {
    const y = base + amp * Math.sin((x + shift) / len) + amp * 0.45 * Math.sin((x + shift * 1.7) / (len * 0.43) + 1.3);
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return `${d} L ${W + 100} ${H} Z`;
};

const dunes = [
  { base: 690, amp: 55, len: 260, speed: 0.6, color: colors.indigo, r: 2.4, opacity: 0.7 },
  { base: 790, amp: 70, len: 330, speed: 1.2, color: colors.lavender, r: 3.2, opacity: 0.85 },
  { base: 920, amp: 60, len: 420, speed: 2.2, color: colors.white, r: 4.2, opacity: 0.9 },
];

export const Desert: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sunY = interpolate(progress(frame, 0, 120), [0, 1], [800, 560]);
  const push = interpolate(frame, [0, durationInFrames], [1, 1.07]);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames, 14) }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            {dunes.map((d, i) => (
              <pattern key={i} id={`dots${i}`} width={16} height={16} patternUnits="userSpaceOnUse">
                <circle cx={8} cy={8} r={d.r} fill={d.color} />
              </pattern>
            ))}
            <pattern id="sunDots" width={14} height={14} patternUnits="userSpaceOnUse">
              <circle cx={7} cy={7} r={4} fill={colors.lavender} />
            </pattern>
            <radialGradient id="sunGlow">
              <stop offset="0%" stopColor={colors.lavender} stopOpacity={0.45} />
              <stop offset="100%" stopColor={colors.lavender} stopOpacity={0} />
            </radialGradient>
            <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity={0.15} />
              <stop offset="100%" stopColor="white" stopOpacity={1} />
            </linearGradient>
            <mask id="duneFade">
              <rect width={W} height={H} fill="url(#fade)" />
            </mask>
          </defs>

          <circle cx={960} cy={sunY} r={330} fill="url(#sunGlow)" />
          <circle cx={960} cy={sunY} r={150} fill="url(#sunDots)" opacity={0.9} />

          <g mask="url(#duneFade)">
            {dunes.map((d, i) => (
              <g key={i}>
                <path d={dunePath(d.base, d.amp, d.len, frame * d.speed)} fill={colors.bg} />
                <path d={dunePath(d.base, d.amp, d.len, frame * d.speed)} fill={`url(#dots${i})`} opacity={d.opacity} />
              </g>
            ))}
          </g>

          {/* drifting sand */}
          {new Array(60).fill(0).map((_, i) => {
            const x = (random(`x${i}`) * W + frame * (3 + random(`s${i}`) * 5)) % W;
            const y = 520 + random(`y${i}`) * 520 + Math.sin(frame / 20 + i) * 6;
            return <circle key={i} cx={x} cy={y} r={1.5 + random(`r${i}`) * 2} fill={colors.white} opacity={0.35} />;
          })}
        </svg>
      </AbsoluteFill>

      <div style={{ position: "absolute", top: 130, left: 140 }}>
        <div style={{ ...reveal(frame, 14), fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.2em", color: colors.muted }}>
          RIYADH · 24.71° N  46.67° E
        </div>
        <div style={{ ...displayEn, fontSize: 120, marginTop: 24 }}>
          <div style={reveal(frame, 24)}>Born in</div>
          <div style={reveal(frame, 36)}>
            the <span style={{ color: colors.lavender }}>desert.</span>
          </div>
        </div>
      </div>

      <div dir="rtl" style={{ position: "absolute", top: 130, right: 140, textAlign: "right" }}>
        <div style={{ ...reveal(frame, 50), fontFamily: fonts.ar, fontSize: 32, color: colors.muted }}>
          من الرمل تعلّمنا الصبر والرؤية
        </div>
        <div style={{ ...displayAr, fontSize: 124, marginTop: 6 }}>
          <div style={reveal(frame, 60)}>
            جينا من <span style={{ color: colors.lavender }}>الصحراء</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

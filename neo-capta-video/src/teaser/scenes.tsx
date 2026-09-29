import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, reveal } from "../anim";
import { useLang } from "../lang";
import { colors, fonts } from "../theme";
import { teaserCopy } from "./copy";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const useCopy = () => {
  const l = useLang();
  return { ...l, c: teaserCopy[l.lang] };
};

/** Film grain + cinematic letterbox, drawn over every scene. */
export const TrailerFrame: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.09, mixBlendMode: "screen" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 12} />
        </filter>
        <rect width={1920} height={1080} filter="url(#grain)" />
      </svg>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, background: "black" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "black" }} />
    </AbsoluteFill>
  );
};

// 0–2s: a pulsing point of light and a typed status line.
export const Signal: React.FC = () => {
  const frame = useCurrentFrame();
  const { c, dir, lang } = useCopy();
  const beat = [2, 26, 48].reduce((acc, b) => acc + Math.max(0, 1 - Math.abs(frame - b) / 6), 0);
  const typed = Math.floor(interpolate(frame, [12, 44], [0, c.signal.length], clamp));
  const cursor = Math.floor(frame / 6) % 2 === 0;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: 14 + beat * 10,
          height: 14 + beat * 10,
          borderRadius: "50%",
          background: colors.lavender,
          boxShadow: `0 0 ${40 + beat * 120}px ${10 + beat * 40}px ${colors.lavender}88`,
        }}
      />
      <div
        dir={dir}
        style={{
          position: "absolute",
          top: 620,
          fontFamily: lang === "ar" ? fonts.ar : fonts.mono,
          fontSize: lang === "ar" ? 34 : 26,
          letterSpacing: lang === "ar" ? 0 : "0.4em",
          color: colors.muted,
        }}
      >
        {c.signal.slice(0, typed)}
        <span style={{ opacity: cursor ? 1 : 0, color: colors.lavender }}>_</span>
      </div>
    </AbsoluteFill>
  );
};

// 2–6s: one word per hit, punched in full screen.
export const Question: React.FC = () => {
  const frame = useCurrentFrame();
  const { c, dir, display, scale } = useCopy();
  const EACH = 21;
  const i = Math.min(Math.floor(frame / EACH), c.question.length - 1);
  const local = frame - i * EACH;
  const last = i === c.question.length - 1;
  const punch = interpolate(local, [0, 6], [1.35, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const flash = interpolate(local, [0, 3], [0.55, 0], clamp);

  return (
    <AbsoluteFill dir={dir} style={{ justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
      <div
        style={{
          ...display,
          fontSize: (last ? 230 : 280) * scale,
          color: last ? colors.lavender : colors.white,
          transform: `scale(${punch + (last ? local * 0.002 : 0)})`,
          textShadow: last ? `0 0 80px ${colors.lavender}88` : "none",
        }}
      >
        {c.question[i]}
      </div>
    </AbsoluteFill>
  );
};

// 6–12s: glitch cuts over scrolling data.
export const Glimpses: React.FC = () => {
  const frame = useCurrentFrame();
  const { c, dir, display, scale, small } = useCopy();
  const EACH = 45;
  const i = Math.min(Math.floor(frame / EACH), c.glimpses.length - 1);
  const local = frame - i * EACH;
  const glitch = local < 9;
  const jitter = glitch ? (random(`j${frame}`) - 0.5) * 70 : 0;
  const split = glitch ? 18 + random(`s${frame}`) * 20 : interpolate(local, [9, 40], [6, 2], clamp);
  const flash = interpolate(local, [0, 2], [0.35, 0], clamp);
  const word = c.glimpses[i];
  const size = 260 * scale;

  const layer = (color: string, dx: number, opacity = 1) => (
    <div style={{ ...display, position: "absolute", fontSize: size, color, opacity, transform: `translateX(${dx}px)`, whiteSpace: "nowrap", mixBlendMode: "screen" }}>
      {word}
    </div>
  );

  return (
    <AbsoluteFill dir={dir}>
      {/* data rain */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "0 40px", opacity: 0.13 }} dir="ltr">
        {new Array(26).fill(0).map((_, col) => {
          const speed = 4 + random(`v${col}`) * 10;
          const digits = new Array(40).fill(0).map((__, r) => Math.floor(random(`d${col}-${r}`) * 10)).join("\n");
          return (
            <div
              key={col}
              style={{
                fontFamily: fonts.mono,
                fontSize: 22,
                lineHeight: "30px",
                whiteSpace: "pre",
                color: col % 4 === 0 ? colors.lavender : colors.white,
                transform: `translateY(${((frame * speed + random(`o${col}`) * 1200) % 1200) - 1200}px)`,
              }}
            >
              {digits + "\n" + digits}
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(6,6,11,0.9) 30%, transparent 100%)" }} />
      <AbsoluteFill style={{ background: "white", opacity: flash }} />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `translateX(${jitter}px)` }}>
        {layer(colors.indigo, -split, 0.9)}
        {layer(colors.lavender, split, 0.9)}
        {layer(colors.white, 0)}
      </AbsoluteFill>

      <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", ...small, color: colors.lavender }}>
        {c.glimpseKicker}
      </div>
      <div dir="ltr" style={{ position: "absolute", bottom: 170, left: 0, right: 0, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: "0.3em", color: colors.muted }}>
        0{i + 1} / 0{c.glimpses.length} · {String(Math.floor(random(`n${Math.floor(frame / 3)}`) * 99999)).padStart(5, "0")}
      </div>
    </AbsoluteFill>
  );
};

// 12–16s: a breath. A horizon line and a dune rising under it.
export const Horizon: React.FC = () => {
  const frame = useCurrentFrame();
  const { c, dir, display, scale } = useCopy();
  const line = progress(frame, 4, 50);
  const rise = progress(frame, 30, 70);
  let dune = "M 0 1080";
  for (let x = 0; x <= 1920; x += 20) {
    dune += ` L ${x} ${(640 - rise * 90 + 70 * Math.sin(x / 260 + 0.6) + 30 * Math.sin(x / 90)).toFixed(1)}`;
  }
  dune += " L 1920 1080 Z";

  return (
    <AbsoluteFill dir={dir}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={colors.lavender} stopOpacity={0.45} />
            <stop offset="0.05" stopColor={colors.indigo} stopOpacity={0.18} />
            <stop offset="0.3" stopColor="#06060b" stopOpacity={0.9} />
            <stop offset="1" stopColor="#06060b" stopOpacity={1} />
          </linearGradient>
        </defs>
        <path d={dune} fill="url(#rim)" opacity={rise} />
        <rect x={960 - line * 960} y={539} width={line * 1920} height={2} fill={colors.lavender} />
        <rect x={960 - line * 700} y={520} width={line * 1400} height={40} fill={colors.lavender} opacity={0.12} style={{ filter: "blur(18px)" }} />
      </svg>
      <div style={{ ...reveal(frame, 40, 30), position: "absolute", top: 300, width: "100%", textAlign: "center", ...display, fontWeight: dir === "rtl" ? 500 : 800, fontSize: 64 * scale, color: colors.white }}>
        {c.horizon}
      </div>
    </AbsoluteFill>
  );
};

// 16–22s: sand particles spiral in and collapse to a point, then blackout.
export const Converge: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { c, dir, display, scale } = useCopy();
  const END = durationInFrames - 10; // last 10 frames are silent black
  const p = interpolate(frame, [0, END], [0, 1], clamp);
  const pull = p ** 2.2;
  const glow = interpolate(frame, [END - 30, END], [0, 1], clamp);
  const shake = frame > END - 40 && frame < END ? (random(`k${frame}`) - 0.5) * 10 * glow : 0;

  return (
    <AbsoluteFill dir={dir} style={{ opacity: frame >= END ? 0 : 1, transform: `translate(${shake}px, ${-shake}px)` }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {new Array(520).fill(0).map((_, i) => {
          const r0 = 150 + random(`r${i}`) * 1000;
          const a = random(`a${i}`) * Math.PI * 2 + p * (4 + random(`w${i}`) * 4) + frame * 0.004;
          const r = r0 * (1 - pull) + 4;
          return (
            <circle
              key={i}
              cx={960 + Math.cos(a) * r * 1.4}
              cy={540 + Math.sin(a) * r * 0.8}
              r={1.2 + random(`z${i}`) * 2.6}
              fill={i % 5 === 0 ? colors.lavender : colors.white}
              opacity={0.25 + random(`o${i}`) * 0.6}
            />
          );
        })}
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${glow}) 0%, ${colors.lavender}${Math.round(glow * 200).toString(16).padStart(2, "0")} ${4 + glow * 10}%, transparent ${10 + glow * 40}%)` }} />
      <div style={{ ...reveal(frame, 20, 30), opacity: reveal(frame, 20, 30).opacity * (1 - glow), position: "absolute", bottom: 200, width: "100%", textAlign: "center", ...display, fontWeight: dir === "rtl" ? 500 : 800, fontSize: 60 * scale }}>
        {c.coming}
      </div>
    </AbsoluteFill>
  );
};

// 22–26s: white flash, shockwave, logo reveal with light rays.
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const flash = interpolate(frame, [0, 14], [1, 0], clamp);
  const shake = frame < 16 ? (random(`q${frame}`) - 0.5) * 30 * (1 - frame / 16) : 0;
  const split = interpolate(frame, [0, 24], [30, 0], clamp);
  const logo = (dx: number, opacity: number, filter?: string) => (
    <Img
      src={staticFile("logo.jpg")}
      style={{
        position: "absolute",
        width: 820,
        height: 820,
        left: 550 + dx,
        top: 130,
        mixBlendMode: "lighten",
        opacity,
        filter,
        maskImage: "radial-gradient(circle, black 38%, transparent 66%)",
        WebkitMaskImage: "radial-gradient(circle, black 38%, transparent 66%)",
      }}
    />
  );

  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 0.8}deg at 50% 50%, ${colors.lavender}30 0deg 3deg, transparent 3deg 15deg)`,
          maskImage: "radial-gradient(circle at 50% 50%, black 10%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 10%, transparent 60%)",
          opacity: s,
        }}
      />
      {[0, 8].map((d) => {
        const p = interpolate(frame - d, [0, 40], [0, 1], clamp);
        return (
          <div
            key={d}
            style={{
              position: "absolute",
              left: 960 - p * 1100,
              top: 540 - p * 1100,
              width: p * 2200,
              height: p * 2200,
              borderRadius: "50%",
              border: `${6 - d / 2}px solid ${colors.lavender}`,
              opacity: (1 - p) * 0.8,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          transform: `scale(${interpolate(s, [0, 1], [1.4, 1]) + frame * 0.001})`,
        }}
      >
        {logo(-split, (split / 30) * 0.6, "hue-rotate(40deg) saturate(2)")}
        {logo(split, (split / 30) * 0.6, "hue-rotate(-40deg) saturate(2)")}
        {logo(0, 1)}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
    </AbsoluteFill>
  );
};

// 26–30s: official line and "coming soon".
export const Final: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, c, dir, display, scale, small, lang } = useCopy();
  const toBlack = interpolate(frame, [durationInFrames - 20, durationInFrames], [0, 1], clamp);

  return (
    <AbsoluteFill dir={dir} style={{ justifyContent: "center", alignItems: "center" }}>
      <Img
        src={staticFile("logo.jpg")}
        style={{
          width: 380,
          height: 380,
          mixBlendMode: "lighten",
          maskImage: "radial-gradient(circle, black 40%, transparent 68%)",
          WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 68%)",
          marginTop: -40,
        }}
      />
      <div style={{ ...reveal(frame, 4, 20), ...display, fontSize: 104 * scale, marginTop: -10, whiteSpace: "nowrap" }}>
        {t.tagline[0]} {t.tagline[1]}
        <span style={{ color: colors.lavender }}>{t.tagline[2]}</span>
      </div>
      <div
        style={{
          ...reveal(frame, 22, 20),
          marginTop: 36,
          padding: "12px 34px",
          border: `1.5px solid ${colors.lavender}`,
          borderRadius: 999,
          color: colors.lavender,
          fontFamily: lang === "ar" ? fonts.ar : fonts.mono,
          fontSize: lang === "ar" ? 34 : 24,
          letterSpacing: lang === "ar" ? 0 : "0.4em",
          boxShadow: `0 0 40px ${colors.lavender}44`,
        }}
      >
        {c.soon}
      </div>
      <div style={{ ...reveal(frame, 34, 20), ...small, position: "absolute", bottom: 150, letterSpacing: lang === "ar" ? 0 : "0.3em" }}>{t.footer}</div>
      <AbsoluteFill style={{ background: "black", opacity: toBlack }} />
    </AbsoluteFill>
  );
};

import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, reveal, sceneOpacity } from "../anim";
import { useLang } from "../lang";
import { colors, fonts } from "../theme";
import { auroraCopy } from "./copy";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (x: number) => 1 - (1 - x) ** 3;
const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1.5px solid rgba(255,255,255,0.16)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
};

const useCopy = () => {
  const l = useLang();
  return { ...l, c: auroraCopy[l.lang] };
};

/** Slow, soft aurora made of large blurred colour fields. */
export const Aurora: React.FC = () => {
  const frame = useCurrentFrame();
  const blobs = [
    { c: colors.indigo, x: 30, y: 30, r: 900, sx: 0.011, sy: 0.008 },
    { c: colors.lavender, x: 70, y: 60, r: 800, sx: 0.009, sy: 0.012 },
    { c: "#5b2bd1", x: 55, y: 20, r: 700, sx: 0.013, sy: 0.007 },
    { c: "#1d2a7a", x: 20, y: 80, r: 900, sx: 0.007, sy: 0.01 },
  ];
  return (
    <AbsoluteFill style={{ background: "#07060d", overflow: "hidden" }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `calc(${b.x + Math.sin(frame * b.sx + i) * 18}% - ${b.r / 2}px)`,
            top: `calc(${b.y + Math.cos(frame * b.sy + i * 2) * 14}% - ${b.r / 2}px)`,
            width: b.r,
            height: b.r,
            borderRadius: "50%",
            background: b.c,
            opacity: 0.45,
            filter: "blur(140px)",
          }}
        />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(4,3,10,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

// 0–3s: vertical blinds open onto the logo on a glass card.
export const Blinds: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const N = 14;
  const card = spring({ frame: frame - 12, fps: 30, config: { damping: 18 } });
  const sweep = interpolate(frame, [30, 75], [-40, 140], clamp);
  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames, 12) }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ ...glass, width: 620, height: 620, borderRadius: 48, overflow: "hidden", transform: `scale(${0.9 + card * 0.1})`, position: "relative" }}>
          <Img src={staticFile("logo.jpg")} style={{ width: 620, height: 620, mixBlendMode: "lighten", opacity: 0.95 }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(110deg, transparent ${sweep - 15}%, rgba(255,255,255,0.22) ${sweep}%, transparent ${sweep + 15}%)` }} />
        </div>
      </AbsoluteFill>
      {/* blinds */}
      {new Array(N).fill(0).map((_, i) => {
        const open = interpolate(frame, [4 + i * 2, 26 + i * 2], [1, 0], { ...clamp, easing: ease });
        const w = 1920 / N;
        if (open <= 0) return null;
        return <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: i * w, width: w * open + 1, background: "#07060d" }} />;
      })}
    </AbsoluteFill>
  );
};

/** A word that flips up into place in 3D. */
const Flip: React.FC<{ children: React.ReactNode; at: number; frame: number; style?: React.CSSProperties }> = ({ children, at, frame, style }) => {
  const p = spring({ frame: frame - at, fps: 30, config: { damping: 14, mass: 0.8 } });
  return (
    <span style={{ display: "inline-block", perspective: 900 }}>
      <span
        style={{
          display: "inline-block",
          transform: `rotateX(${(1 - p) * -95}deg)`,
          transformOrigin: "50% 100%",
          opacity: Math.min(1, p * 1.6),
          ...style,
        }}
      >
        {children}
      </span>
    </span>
  );
};

// 3–8s: the official line flips in word by word inside a glass panel.
export const FlipTagline: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, dir, display, scale } = useCopy();
  const [a, b, c] = t.tagline;
  const panel = progress(frame, 0, 20);
  const words = `${a} ${b}`.trim().split(" ");
  return (
    <AbsoluteFill dir={dir} style={{ opacity: sceneOpacity(frame, durationInFrames), justifyContent: "center", alignItems: "center" }}>
      <div style={{ ...glass, borderRadius: 40, padding: "70px 110px", opacity: panel, transform: `translateY(${(1 - panel) * 40}px)` }}>
        <div style={{ ...display, fontSize: 180 * scale, lineHeight: 1.05, whiteSpace: "nowrap", textAlign: "center" }}>
          {words.map((w, i) => (
            <Flip key={i} at={10 + i * 14} frame={frame}>
              {w}&nbsp;
            </Flip>
          ))}
          <br />
          <Flip at={10 + words.length * 14 + 6} frame={frame} style={{ color: colors.lavender, textShadow: `0 0 60px ${colors.lavender}88` }}>
            {c}
          </Flip>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 8–14s: Riyadh's skyline drawn in light.
export const Skyline: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { c, dir, display, scale, small } = useCopy();
  const G = 860;
  const draw = (start: number, len = 50) => progress(frame, start, len);

  // generic towers: [x, width, height]
  const towers: [number, number, number][] = [
    [120, 70, 190], [210, 50, 260], [280, 90, 150], [400, 60, 330], [480, 80, 220], [590, 50, 280], [660, 100, 170],
    [1100, 60, 240], [1180, 45, 300], [1420, 80, 210], [1520, 55, 350], [1600, 90, 190], [1710, 60, 260], [1790, 80, 160],
  ];
  const kingdom = `M 880 ${G} L 902 440 C 908 350 926 290 942 250 L 948 250 C 952 300 956 330 960 342 C 964 330 968 300 972 250 L 978 250 C 994 290 1012 350 1018 440 L 1040 ${G}`;
  const faisaliah = `M 1250 ${G} L 1292 360 L 1308 360 L 1350 ${G}`;
  const stroke = (p: number, len: number) => ({ strokeDasharray: len, strokeDashoffset: len * (1 - p) });

  return (
    <AbsoluteFill dir={dir} style={{ opacity: sceneOpacity(frame, durationInFrames) }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* stars */}
        {new Array(70).fill(0).map((_, i) => (
          <circle key={i} cx={random(`sx${i}`) * 1920} cy={random(`sy${i}`) * 560} r={1 + random(`sr${i}`) * 1.6} fill="white" opacity={(0.2 + 0.5 * Math.abs(Math.sin(frame / 15 + i))) * draw(0, 30)} />
        ))}
        <g filter="url(#glow)" fill="none" strokeLinejoin="round">
          {towers.map(([x, w, h], i) => (
            <path key={i} d={`M ${x} ${G} V ${G - h} H ${x + w} V ${G}`} stroke={colors.indigo} strokeWidth={3} {...stroke(draw(8 + i * 3, 40), h * 2 + w)} />
          ))}
          <path d={kingdom} stroke={colors.lavender} strokeWidth={5} {...stroke(draw(20, 60), 1900)} />
          <line x1={950} y1={300} x2={970} y2={300} stroke={colors.lavender} strokeWidth={4} opacity={draw(70, 10)} />
          <path d={faisaliah} stroke={colors.lavender} strokeWidth={4} {...stroke(draw(30, 50), 1100)} />
          <circle cx={1300} cy={395} r={24} stroke={colors.lavender} strokeWidth={4} {...stroke(draw(60, 20), 160)} />
          <line x1={1300} y1={360} x2={1300} y2={250} stroke={colors.lavender} strokeWidth={3} {...stroke(draw(70, 15), 110)} />
          <line x1={0} y1={G} x2={1920} y2={G} stroke={colors.lavender} strokeWidth={3} {...stroke(draw(0, 40), 1920)} />
        </g>
        {/* lit windows */}
        {towers.map(([x, w, h], i) =>
          new Array(Math.floor(h / 40)).fill(0).map((_, k) => (
            <rect key={`${i}-${k}`} x={x + w / 2 - 4} y={G - h + 20 + k * 40} width={8} height={8} fill={colors.lavender} opacity={random(`w${i}${k}`) > 0.4 ? draw(60 + k * 2, 20) * (0.4 + 0.6 * Math.abs(Math.sin(frame / 20 + i + k))) : 0} />
          )),
        )}
        {/* reflection */}
        <rect x={0} y={G + 4} width={1920} height={220} fill="url(#fade)" />
      </svg>
      <div style={{ position: "absolute", bottom: 50, left: 140, right: 140 }}>
        <div style={{ ...reveal(frame, 70), ...small }}>{c.kicker}</div>
        <div style={{ ...display, fontSize: 84 * scale, marginTop: 8, whiteSpace: "nowrap" }}>
          <span style={reveal(frame, 80)}>{c.rooted[0]} </span>
          <span style={{ ...reveal(frame, 96), color: colors.lavender }}>{c.rooted[1]}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 14–19s: a sentence assembled from sliding vertical strips.
export const Strips: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { c, dir, display, scale } = useCopy();
  const N = 12;
  const line2 = spring({ frame: frame - 70, fps: 30, config: { damping: 16 } });

  const text = (
    <AbsoluteFill dir={dir} style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ ...display, fontSize: 200 * scale, whiteSpace: "nowrap", transform: `translateY(${-110 * scale - (scale > 1 ? 40 : 0)}px)` }}>{c.different[0]}</div>
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames) }}>
      {new Array(N).fill(0).map((_, i) => {
        const w = 100 / N;
        const p = interpolate(frame, [4 + i * 3, 34 + i * 3], [0, 1], { ...clamp, easing: ease });
        const dy = (i % 2 ? 1 : -1) * (1 - p) * (500 + i * 30);
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(0 ${100 - (i + 1) * w}% 0 ${i * w}%)`, transform: `translateY(${dy}px)`, opacity: p }}>
            {text}
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill dir={dir} style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            ...glass,
            borderRadius: 36,
            padding: "20px 70px",
            transform: `translateY(${130 + (1 - line2) * 60}px) scale(${0.9 + line2 * 0.1})`,
            opacity: line2,
            ...display,
            fontSize: 170 * scale,
            color: colors.lavender,
            whiteSpace: "nowrap",
          }}
        >
          {c.different[1]}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 19–25s: the five services on a rotating 3D carousel of glass panels.
export const Carousel: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, c, dir, lang, small } = useCopy();
  const stops = [0, 45, 75, 105, 135];
  let angle = 0;
  stops.forEach((s, i) => {
    if (i > 0) angle -= interpolate(frame, [s - 18, s], [0, 72], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  });
  const spin = rtl(dir) ? -angle : angle;
  const intro = spring({ frame, fps: 30, config: { damping: 18 } });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames) }}>
      <div style={{ ...reveal(frame, 4), ...small, position: "absolute", top: 150, width: "100%", textAlign: "center", color: colors.lavender }}>{c.pillarsHead}</div>
      <AbsoluteFill style={{ perspective: 1800, justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", width: 460, height: 320, transformStyle: "preserve-3d", transform: `translateZ(-560px) rotateX(-6deg) rotateY(${spin}deg) scale(${0.8 + intro * 0.2})` }}>
          {t.pillars.map((name, i) => {
            const a = i * 72 * (rtl(dir) ? -1 : 1);
            const facing = Math.cos(((a + spin) * Math.PI) / 180);
            return (
              <div
                key={name}
                dir={dir}
                style={{
                  ...glass,
                  position: "absolute",
                  inset: 0,
                  borderRadius: 32,
                  transform: `rotateY(${a}deg) translateZ(560px)`,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  background: facing > 0.95 ? "rgba(139,127,255,0.28)" : "rgba(255,255,255,0.06)",
                  borderColor: facing > 0.95 ? colors.lavender : "rgba(255,255,255,0.16)",
                  opacity: 0.35 + Math.max(0, facing) * 0.65,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: 40,
                  boxSizing: "border-box",
                }}
              >
                <div style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.25em", color: colors.lavender }}>0{i + 1}</div>
                <div
                  style={{
                    fontFamily: lang === "ar" ? fonts.ar : fonts.display,
                    fontWeight: lang === "ar" ? 700 : 900,
                    fontSize: lang === "ar" ? 70 : 58,
                    letterSpacing: lang === "ar" ? 0 : "-0.03em",
                    color: colors.white,
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const rtl = (dir: string) => dir === "rtl";

// 25–30s: logo on glass, official line, light sweep.
export const AuroraOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, dir, display, scale, small, lang } = useCopy();
  const s = spring({ frame, fps: 30, config: { damping: 16 } });
  const sweep = interpolate(frame, [20, 70], [-40, 140], clamp);
  const toBlack = interpolate(frame, [durationInFrames - 20, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill dir={dir} style={{ alignItems: "center" }}>
      <div style={{ ...glass, marginTop: 110, width: 440, height: 440, borderRadius: 40, overflow: "hidden", position: "relative", transform: `scale(${0.85 + s * 0.15}) rotateX(${(1 - s) * 30}deg)`, opacity: s }}>
        <Img src={staticFile("logo.jpg")} style={{ width: 440, height: 440, mixBlendMode: "lighten" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(110deg, transparent ${sweep - 15}%, rgba(255,255,255,0.25) ${sweep}%, transparent ${sweep + 15}%)` }} />
      </div>
      <div style={{ ...display, fontSize: 104 * scale, marginTop: 60, whiteSpace: "nowrap" }}>
        {`${t.tagline[0]} ${t.tagline[1]}`
          .trim()
          .split(" ")
          .map((w, i) => (
            <Flip key={i} at={12 + i * 6} frame={frame}>
              {w}&nbsp;
            </Flip>
          ))}
        <Flip at={36} frame={frame} style={{ color: colors.lavender }}>
          {t.tagline[2]}
        </Flip>
      </div>
      <div style={{ ...reveal(frame, 50), ...small, position: "absolute", bottom: 80, letterSpacing: lang === "ar" ? 0 : "0.3em" }}>{t.footer}</div>
      <AbsoluteFill style={{ background: "black", opacity: toBlack }} />
    </AbsoluteFill>
  );
};

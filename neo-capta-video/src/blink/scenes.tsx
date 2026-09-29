import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, reveal } from "../anim";
import { useLang } from "../lang";
import { colors, fonts } from "../theme";
import { blinkCopy } from "./copy";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const paper = "#f3f1fb";
const ink = "#0b0b14";
const muted = "#6b6880";

const useCopy = () => {
  const l = useLang();
  return { ...l, c: blinkCopy[l.lang] };
};

/** Two black eyelids; open = 0 is shut, 1 is fully open. */
export const Eyelids: React.FC<{ open: number }> = ({ open }) => {
  if (open >= 1) return null;
  const edge = 540 - open * 700;
  const bulge = 60 + open * 160;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <path d={`M -10 -10 H 1930 V ${edge} Q 960 ${edge + bulge * 2} -10 ${edge} Z`} fill={ink} />
      <path d={`M -10 1090 H 1930 V ${1080 - edge} Q 960 ${1080 - edge - bulge * 2} -10 ${1080 - edge} Z`} fill={ink} />
    </svg>
  );
};

/** Quick blink over the first frames of a scene: shut at 0, open by `len`. */
const openAt = (frame: number, len = 10) => interpolate(frame, [0, len], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 2 });

/** An iris with radial fibres; the pupil is the Neo Capta logo. */
const Eye: React.FC<{ r: number; pupil: number; spin: number; cx?: number; cy?: number }> = ({ r, pupil, spin, cx = 960, cy = 540 }) => (
  <>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="irisFill">
          <stop offset="0.3" stopColor={colors.indigo} />
          <stop offset="0.75" stopColor={colors.lavender} />
          <stop offset="1" stopColor={colors.indigo} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#irisFill)" />
      <g transform={`rotate(${spin} ${cx} ${cy})`}>
        {new Array(90).fill(0).map((_, i) => {
          const a = (i / 90) * Math.PI * 2;
          const inner = pupil + 6;
          const outer = r * (0.82 + 0.16 * random(`f${i}`));
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * inner}
              y1={cy + Math.sin(a) * inner}
              x2={cx + Math.cos(a) * outer}
              y2={cy + Math.sin(a) * outer}
              stroke={i % 3 === 0 ? "white" : colors.indigo}
              strokeOpacity={i % 3 === 0 ? 0.35 : 0.5}
              strokeWidth={Math.max(1, r / 120)}
            />
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ink} strokeWidth={Math.max(3, r / 30)} />
    </svg>
    <div
      style={{
        position: "absolute",
        left: cx - pupil,
        top: cy - pupil,
        width: pupil * 2,
        height: pupil * 2,
        borderRadius: "50%",
        overflow: "hidden",
        background: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Img src={staticFile("logo.jpg")} style={{ width: pupil * 2.3, height: pupil * 2.3, flexShrink: 0 }} />
    </div>
    {/* catch-light */}
    <div
      style={{
        position: "absolute",
        left: cx + pupil * 0.35,
        top: cy - pupil * 0.75,
        width: pupil * 0.28,
        height: pupil * 0.28,
        borderRadius: "50%",
        background: "white",
        opacity: 0.85,
      }}
    />
  </>
);

// 0–3s: the eye opens and we dive into the pupil, which is the logo.
export const EyeOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const zoom = interpolate(frame, [30, 70], [1, 4.2], { ...clamp, easing: (x) => x * x * (3 - 2 * x) }) + Math.max(0, frame - 70) * 0.006;
  return (
    <AbsoluteFill style={{ background: paper }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "960px 540px" }}>
        <Eye r={300} pupil={120} spin={frame * 0.3} />
      </AbsoluteFill>
      <Eyelids open={open} />
    </AbsoluteFill>
  );
};

// 3–8s: "Look. / Look closer. / Closer." then dive through the dot.
export const Look: React.FC = () => {
  const frame = useCurrentFrame();
  const { c, dir, display, scale } = useCopy();
  const step = frame < 45 ? 0 : frame < 80 ? 1 : 2;
  const starts = [10, 45, 80];
  const sizes = [150, 210, 340];
  const local = frame - starts[step];
  const dive = interpolate(frame, [118, 150], [0, 1], { ...clamp, easing: (x) => x ** 3 });
  const word = c.look[step];
  const body = word.slice(0, -1);

  return (
    <AbsoluteFill dir={dir} style={{ background: paper, justifyContent: "center", alignItems: "center" }}>
      {frame >= 10 && (
        <div style={{ ...display, color: ink, fontSize: sizes[step] * scale, whiteSpace: "nowrap", opacity: dive > 0.2 ? 0 : 1, ...(local < 12 ? reveal(local, 0, 10) : {}) }}>
          {body}
          <span style={{ color: colors.lavender }}>.</span>
        </div>
      )}
      {/* the full stop grows until it swallows the frame */}
      <div
        style={{
          position: "absolute",
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: colors.lavender,
          transform: `scale(${dive * 70})`,
          opacity: dive > 0 ? 1 : 0,
        }}
      />
      <Eyelids open={openAt(frame)} />
    </AbsoluteFill>
  );
};

// 8–14s: blurred marketing noise; one word comes into focus.
export const Noise: React.FC = () => {
  const frame = useCurrentFrame();
  const { c, dir, display, scale, lang } = useCopy();
  const focus = progress(frame, 70, 30);

  return (
    <AbsoluteFill dir={dir} style={{ background: colors.lavender }}>
      {c.noiseWords.map((w, i) => {
        const x = 80 + random(`x${i}`) * 1650;
        const y = 150 + random(`y${i}`) * 760;
        const size = 34 + random(`s${i}`) * 70;
        const drift = Math.sin(frame / 25 + i) * 14;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + drift,
              top: y,
              fontFamily: lang === "ar" ? fonts.ar : fonts.display,
              fontWeight: 700,
              fontSize: size,
              color: ink,
              opacity: (0.18 + random(`o${i}`) * 0.22) * (1 - focus * 0.7),
              filter: `blur(${2 + random(`b${i}`) * 5 + focus * 8}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {w}
          </div>
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ ...reveal(frame, 6, 20), ...display, color: ink, fontSize: 96 * scale, opacity: reveal(frame, 6, 20).opacity * (1 - focus * 0.35) }}>
          {c.noiseLead}
        </div>
        <div
          style={{
            ...display,
            color: ink,
            fontSize: 190 * scale,
            marginTop: 10,
            whiteSpace: "nowrap",
            opacity: focus,
            filter: `blur(${(1 - focus) * 24}px)`,
            transform: `scale(${1.15 - focus * 0.15})`,
          }}
        >
          {c.noiseFind[0]}
          <span style={{ color: "white" }}>{c.noiseFind[1]}</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 14–20s: a small eye at the centre; the five services orbit it.
export const Orbit: React.FC = () => {
  const frame = useCurrentFrame();
  const { t, c, dir, display, scale, lang } = useCopy();
  const grow = spring({ frame: frame - 6, fps: 30, config: { damping: 16 } });
  const rings = [260, 330, 400, 470, 540];

  return (
    <AbsoluteFill dir={dir} style={{ background: paper }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {rings.map((r, i) => (
          <ellipse key={r} cx={960} cy={600} rx={r * 1.35 * grow} ry={r * 0.58 * grow} fill="none" stroke={ink} strokeOpacity={0.12} strokeDasharray={i % 2 ? "6 10" : undefined} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${grow})`, transformOrigin: "960px 600px" }}>
        <Eye r={120} pupil={52} spin={frame * 0.5} cy={600} />
      </div>
      {t.pillars.map((name, i) => {
        const r = rings[i];
        const a = (i / 5) * Math.PI * 2 + frame * (0.012 - i * 0.0015) + 0.6;
        const x = 960 + Math.cos(a) * r * 1.35 * grow;
        const y = 600 + Math.sin(a) * r * 0.58 * grow;
        const front = Math.sin(a) > 0;
        return (
          <div
            key={name}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${front ? 1 : 0.85})`,
              padding: "10px 24px",
              borderRadius: 999,
              background: front ? ink : "white",
              color: front ? "white" : ink,
              border: `1.5px solid ${ink}`,
              fontFamily: lang === "ar" ? fonts.ar : fonts.display,
              fontWeight: lang === "ar" ? 700 : 800,
              fontSize: lang === "ar" ? 34 : 30,
              whiteSpace: "nowrap",
              opacity: progress(frame, 20 + i * 6, 14),
            }}
          >
            <span style={{ color: colors.lavender, fontFamily: fonts.mono, fontSize: 18, marginInlineEnd: 10 }}>0{i + 1}</span>
            {name}
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 150, left: 140, right: 140, ...display, color: ink, fontSize: 96 * scale }}>
        <span style={reveal(frame, 4)}>{c.orbit[0]} </span>
        <span style={{ ...reveal(frame, 14), color: colors.indigo }}>{c.orbit[1]}</span>
      </div>
      <Eyelids open={openAt(frame)} />
    </AbsoluteFill>
  );
};

// 20–26s: "Most brands blink. We don't." while the lids slowly close; then "Don't blink." in the dark.
export const DontBlink: React.FC = () => {
  const frame = useCurrentFrame();
  const { c, dir, display, scale } = useCopy();
  const close = interpolate(frame, [70, 150], [1, 0], { ...clamp, easing: (x) => x ** 2 });

  return (
    <AbsoluteFill dir={dir} style={{ background: paper, justifyContent: "center", alignItems: "center" }}>
      <div style={{ ...display, color: ink, fontSize: 130 * scale, textAlign: "center" }}>
        <div style={reveal(frame, 4)}>{c.blink[0]}</div>
        <div style={{ ...reveal(frame, 30), color: colors.indigo }}>{c.blink[1]}</div>
      </div>
      <Eyelids open={close} />
      {frame >= 150 && (
        <div style={{ ...reveal(frame, 152, 10), position: "absolute", ...display, fontSize: 90 * scale, color: colors.lavender }}>{c.dontBlink}</div>
      )}
    </AbsoluteFill>
  );
};

// 26–30s: eyes open on the logo-pupil and the official line; a last blink.
export const EyeOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, dir, display, scale, small, lang } = useCopy();
  const open = Math.min(openAt(frame, 12), interpolate(frame, [durationInFrames - 10, durationInFrames - 2], [1, 0], clamp));

  return (
    <AbsoluteFill dir={dir} style={{ background: paper }}>
      <Eye r={230} pupil={100} spin={frame * 0.4} cy={430} />
      <div style={{ ...reveal(frame, 10), position: "absolute", top: 710, width: "100%", textAlign: "center", ...display, color: ink, fontSize: 100 * scale, whiteSpace: "nowrap" }}>
        {t.tagline[0]} {t.tagline[1]}
        <span style={{ color: colors.indigo }}>{t.tagline[2]}</span>
      </div>
      <div style={{ ...reveal(frame, 26), ...small, color: muted, position: "absolute", bottom: 70, width: "100%", textAlign: "center", letterSpacing: lang === "ar" ? 0 : "0.3em" }}>
        {t.footer}
      </div>
      <Eyelids open={open} />
    </AbsoluteFill>
  );
};

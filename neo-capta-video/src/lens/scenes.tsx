import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, reveal, sceneOpacity } from "../anim";
import { useLang } from "../lang";
import { colors, fonts } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Thin lens ring with crosshair ticks, centered on (x, y). */
const LensRing: React.FC<{ x: number; y: number; r: number; opacity?: number }> = ({ x, y, r, opacity = 1 }) => (
  <svg style={{ position: "absolute", inset: 0, opacity }} width={1920} height={1080}>
    <circle cx={x} cy={y} r={r} fill="none" stroke={colors.lavender} strokeWidth={2} />
    <circle cx={x} cy={y} r={r + 14} fill="none" stroke={colors.lavender} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="4 10" />
    {[0, 90, 180, 270].map((a) => {
      const rad = (a * Math.PI) / 180;
      return (
        <line
          key={a}
          x1={x + Math.cos(rad) * (r - 16)}
          y1={y + Math.sin(rad) * (r - 16)}
          x2={x + Math.cos(rad) * (r + 28)}
          y2={y + Math.sin(rad) * (r + 28)}
          stroke={colors.lavender}
          strokeWidth={2}
        />
      );
    })}
  </svg>
);

// 0–3s: radar ping, logo revealed through a growing lens.
export const LensLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const open = spring({ frame: frame - 4, fps, config: { damping: 22 } });
  const r = open * 330;
  const sweep = frame * 6;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames, 8) }}>
      {[0, 14, 28].map((d) => {
        const p = interpolate(frame - d, [0, 50], [0, 1], clamp);
        return (
          <div
            key={d}
            style={{
              position: "absolute",
              left: 960 - p * 900,
              top: 540 - p * 900,
              width: p * 1800,
              height: p * 1800,
              borderRadius: "50%",
              border: `2px solid ${colors.lavender}`,
              opacity: (1 - p) * 0.6,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ clipPath: `circle(${r}px at 960px 540px)` }}>
        <AbsoluteFill style={{ background: `conic-gradient(from ${sweep}deg at 50% 50%, ${colors.lavender}40 0deg, transparent 70deg)` }} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Img src={staticFile("logo.jpg")} style={{ width: 760, height: 760, mixBlendMode: "lighten" }} />
        </AbsoluteFill>
      </AbsoluteFill>
      <LensRing x={960} y={540} r={Math.max(r, 1)} opacity={open} />
    </AbsoluteFill>
  );
};

// 3–7s: the line sits dim until the lens passes over it.
export const LensTagline: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, dir, display, scale } = useLang();
  const travel = interpolate(frame, [0, 80], [0, 1], clamp);
  const x = dir === "rtl" ? 1560 - travel * 1200 : 360 + travel * 1200;
  const y = 540 + Math.sin(travel * Math.PI * 2) * 90;
  const r = interpolate(frame, [0, 10, 80, 100], [0, 230, 230, 1300], clamp);
  const [line1, lead, accent] = t.tagline;

  const text = (dim: boolean) => (
    <AbsoluteFill dir={dir} style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ ...display, fontSize: 220 * scale, textAlign: "center", whiteSpace: "nowrap", color: dim ? "#15151f" : colors.white }}>
        <div>{line1}</div>
        <div>
          {lead}
          <span style={{ color: dim ? undefined : colors.lavender }}>{accent}</span>
        </div>
      </div>
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames) }}>
      {text(true)}
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${x}px ${y}px)` }}>
        <AbsoluteFill style={{ background: "rgba(139,127,255,0.08)" }} />
        {text(false)}
      </AbsoluteFill>
      <LensRing x={x} y={y} r={Math.max(r, 1)} opacity={interpolate(frame, [80, 100], [1, 0], clamp)} />
    </AbsoluteFill>
  );
};

// 7–13s: the desert as a topographic survey, with a scan line.
export const LensDesert: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, dir, display, scale, small } = useLang();
  const [line1, lead, accent] = t.desert;
  const rtl = dir === "rtl";
  // the scan sweeps in reading direction
  const scanX = interpolate(frame, [10, 170], rtl ? [1960, -40] : [-40, 1960], clamp);

  const contours = new Array(26).fill(0).map((_, k) => {
    let d = "";
    for (let x = -40; x <= 1960; x += 20) {
      const y =
        470 + k * 24 +
        60 * Math.sin(x / 300 + k * 0.28 + frame * 0.012) +
        25 * Math.sin(x / 110 - k * 0.5) * Math.sin(k * 0.4);
      d += `${x === -40 ? "M" : "L"} ${x} ${y.toFixed(1)} `;
    }
    return d;
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames) }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {contours.map((d, k) => {
          const draw = progress(frame, k * 2, 50);
          return (
            <path
              key={k}
              d={d}
              fill="none"
              stroke={k % 5 === 0 ? colors.lavender : colors.indigo}
              strokeOpacity={0.25 + (k / 26) * 0.6}
              strokeWidth={k % 5 === 0 ? 2 : 1.2}
              strokeDasharray={2400}
              strokeDashoffset={2400 * (1 - draw)}
            />
          );
        })}
        <line x1={scanX} y1={0} x2={scanX} y2={1080} stroke={colors.lavender} strokeWidth={2} />
        <rect x={rtl ? scanX : scanX - 160} y={0} width={160} height={1080} fill="url(#scanGlow)" />
        <defs>
          <linearGradient id="scanGlow" x1={rtl ? 1 : 0} x2={rtl ? 0 : 1}>
            <stop offset="0" stopColor={colors.lavender} stopOpacity={0} />
            <stop offset="1" stopColor={colors.lavender} stopOpacity={0.18} />
          </linearGradient>
        </defs>
      </svg>
      <div dir={dir} style={{ position: "absolute", top: 110, left: 140, right: 140 }}>
        <div style={{ ...reveal(frame, 10), ...small }}>{t.desertKicker}</div>
        <div style={{ ...display, fontSize: 140 * scale, marginTop: 16 }}>
          <div style={reveal(frame, 20)}>{line1}</div>
          <div style={reveal(frame, 32)}>
            {lead}
            <span style={{ color: colors.lavender }}>{accent}</span>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 140,
          right: 140,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: fonts.mono,
          fontSize: 20,
          letterSpacing: "0.2em",
          color: colors.muted,
        }}
      >
        <span>ELEV {Math.round(612 + Math.sin(frame / 9) * 40)} M</span>
        <span>SCAN {Math.round(interpolate(frame, [10, 170], [0, 100], clamp))}%</span>
      </div>
    </AbsoluteFill>
  );
};

// 13–19s: the old line is sliced apart, then the frame flips to lavender.
export const LensDifferent: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, dir, display, scale } = useLang();
  const BANDS = 8;
  const FLIP = 70;
  const flip = progress(frame, FLIP, 24);

  return (
    <AbsoluteFill dir={dir} style={{ opacity: sceneOpacity(frame, durationInFrames) }}>
      {new Array(BANDS).fill(0).map((_, i) => {
        const out = progress(frame, 40 + i * 3, 22);
        const top = (i / BANDS) * 100;
        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(${top}% 0 ${100 - top - 100 / BANDS}% 0)`,
              transform: `translateX(${(i % 2 ? 1 : -1) * out * 1400}px)`,
              justifyContent: "center",
              alignItems: "center",
              opacity: reveal(frame, 0).opacity,
            }}
          >
            <div style={{ ...display, fontSize: 150 * scale, color: colors.muted, whiteSpace: "nowrap" }}>{t.old}</div>
          </AbsoluteFill>
        );
      })}

      <AbsoluteFill style={{ background: colors.lavender, clipPath: `circle(${flip * 1200}px at 960px 540px)` }}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ ...display, color: colors.bg, fontSize: 210 * scale, textAlign: "center", whiteSpace: "nowrap" }}>
            <div style={reveal(frame, FLIP + 10)}>{t.fresh[0]}</div>
            <div style={reveal(frame, FLIP + 22)}>{t.fresh[1]}</div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 19–25s: heading, then the five pillars one at a time, full screen.
export const LensIdeas: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, dir, display, scale } = useLang();
  const START = 40;
  const EACH = 28;
  const idx = Math.floor((frame - START) / EACH);
  const local = frame - START - idx * EACH;
  const headOut = progress(frame, START - 8, 10);

  return (
    <AbsoluteFill dir={dir} style={{ opacity: sceneOpacity(frame, durationInFrames) }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - headOut }}>
        <div style={{ ...display, fontSize: 150 * scale, textAlign: "center" }}>
          <div style={reveal(frame, 0, 14)}>{t.ideas[0]}</div>
          <div style={{ ...reveal(frame, 8, 14), color: colors.lavender }}>{t.ideas[1]}</div>
        </div>
      </AbsoluteFill>

      {idx >= 0 && idx < 5 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ ...reveal(local, 0, 10), fontFamily: fonts.mono, fontSize: 30, letterSpacing: "0.3em", color: colors.lavender }} dir="ltr">
            0{idx + 1} / 05
          </div>
          <div style={{ ...reveal(local, 2, 12), ...display, fontSize: 220 * scale, marginTop: 20, whiteSpace: "nowrap" }}>
            {t.pillars[idx]}
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", bottom: 90, left: 140, right: 140, display: "flex", gap: 12 }}>
        {t.pillars.map((_, i) => {
          const fill = interpolate(frame, [START + i * EACH, START + (i + 1) * EACH], [0, 1], clamp);
          return (
            <div key={i} style={{ flex: 1, height: 4, background: colors.line, borderRadius: 2 }}>
              <div style={{ width: `${fill * 100}%`, height: "100%", background: colors.lavender, borderRadius: 2 }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 25–30s: logo inside a rotating lens, official line below.
export const LensOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { t, dir, display, scale, small, lang } = useLang();
  const open = spring({ frame, fps, config: { damping: 20 } });
  const toBlack = interpolate(frame, [durationInFrames - 20, durationInFrames], [0, 1], clamp);
  const cy = 420;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames, 12) }}>
      <AbsoluteFill style={{ clipPath: `circle(${open * 250}px at 960px ${cy}px)` }}>
        <Img
          src={staticFile("logo.jpg")}
          style={{ position: "absolute", left: 960 - 290, top: cy - 290, width: 580, height: 580, mixBlendMode: "lighten" }}
        />
      </AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${frame * 0.6}deg)`, transformOrigin: `960px ${cy}px` }}>
        <LensRing x={960} y={cy} r={Math.max(open * 250, 1)} opacity={open} />
      </div>
      <div
        dir={dir}
        style={{ ...reveal(frame, 16), ...display, position: "absolute", top: 740, width: "100%", textAlign: "center", fontSize: 100 * scale, whiteSpace: "nowrap" }}
      >
        {t.tagline[0]} {t.tagline[1]}
        <span style={{ color: colors.lavender }}>{t.tagline[2]}</span>
      </div>
      <div
        dir={dir}
        style={{ ...reveal(frame, 34), ...small, position: "absolute", bottom: 80, width: "100%", textAlign: "center", letterSpacing: lang === "ar" ? 0 : "0.3em" }}
      >
        {t.footer}
      </div>
      <AbsoluteFill style={{ background: "black", opacity: toBlack }} />
    </AbsoluteFill>
  );
};

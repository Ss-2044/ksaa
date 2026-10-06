import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";
import { INK, SCENES } from "./scenes";
import data from "./comic.json";

// «كوميكس» series: comic-book pages — thick ink panels, halftone, speech bubbles and SFX.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Panel = { x: number; y: number; w: number; h: number; at: number; bg: string; scene: string; caption?: string; answer?: string; bubble?: { text: string; x: number; y: number; tail: string }; sfx?: { text: string; x: number; y: number; rot: number } };
type Page = { from: number; to: number; panels: Panel[] };
type Clip = { duration: number; bpm: number; music: string; end: number; endLine: string; endEn: string; pages: Page[] };
export const COMICS = data as Record<string, Clip>;

const PAPER = "#FFF8E7";
const halftone = (c: string) => `radial-gradient(circle, ${c} 0 2.6px, transparent 3.2px)`;

const Sfx: React.FC<{ text: string; t: number; rot: number }> = ({ text, t, rot }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: t, fps, config: { damping: 7, stiffness: 260 } });
  if (t < 0) return null;
  return (
    <div style={{ position: "relative", padding: "30px 50px", transform: `scale(${p}) rotate(${rot}deg)` }}>
      <div style={{ position: "absolute", inset: -10 }}>
        <svg width="100%" height="100%" viewBox="-100 -100 200 200" preserveAspectRatio="none">
          <polygon points={new Array(22).fill(0).map((_, i) => { const r = i % 2 ? 70 : 100; const a = (i / 22) * Math.PI * 2; return `${Math.cos(a) * r},${Math.sin(a) * r}`; }).join(" ")} fill="#EF233C" stroke={INK} strokeWidth={3} />
        </svg>
      </div>
      <span dir="rtl" style={{ position: "relative", fontFamily: fonts.punch, fontSize: 110, lineHeight: 1, color: "#FFD60A", WebkitTextStroke: `6px ${INK}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>{text}</span>
    </div>
  );
};

const Bubble: React.FC<{ text: string; t: number; tail: string; size?: number }> = ({ text, t, tail, size = 54 }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: t, fps, config: { damping: 10, stiffness: 220 } });
  const words = text.split(" ");
  const shown = Math.ceil(interpolate(t, [4, 4 + words.length * 3], [0, words.length], clamp));
  if (t < 0) return null;
  return (
    <div style={{ position: "relative", display: "inline-block", transform: `scale(${p})`, transformOrigin: tail === "left" ? "left bottom" : "bottom center" }}>
      <div dir="rtl" style={{ background: "#FFFFFF", border: `6px solid ${INK}`, borderRadius: "50%", padding: "34px 54px", fontFamily: fonts.punch, fontSize: size, lineHeight: 1.25, color: INK, whiteSpace: "nowrap", boxShadow: `8px 8px 0 ${INK}` }}>
        {words.map((w, i) => (
          <span key={i} style={{ opacity: i < shown ? 1 : 0 }}>{w}{i < words.length - 1 ? " " : ""}</span>
        ))}
      </div>
      <svg width={80} height={70} style={{ position: "absolute", ...(tail === "left" ? { left: 30, bottom: -50 } : { left: "45%", bottom: -56 }) }}>
        <path d={tail === "left" ? "M 10 0 L 0 62 L 52 0" : "M 10 0 L 30 62 L 56 0"} fill="#FFFFFF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 14 2 L 50 2" stroke="#FFFFFF" strokeWidth={8} />
      </svg>
    </div>
  );
};

const PanelView: React.FC<{ p: Panel }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - p.at;
  if (t < 0) return null;
  const inP = spring({ frame: t, fps, config: { damping: 12, stiffness: 200 } });
  const Scene = SCENES[p.scene];
  const dark = p.bg === "#3D5AFE" || p.bg === "#EF233C";
  return (
    <div style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, transform: `scale(${0.6 + 0.4 * inP}) rotate(${(1 - inP) * (p.x > 300 ? 6 : -6)}deg)`, opacity: Math.min(1, inP * 2) }}>
      <div style={{ position: "absolute", inset: 0, background: p.bg, border: `8px solid ${INK}`, overflow: "hidden", boxShadow: `10px 10px 0 ${INK}` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: halftone(dark ? "rgba(255,255,255,0.18)" : "rgba(17,17,17,0.12)"), backgroundSize: "16px 16px" }} />
        {Scene ? (
          <svg width={p.w - 16} height={p.h - 16} viewBox="0 0 600 600" preserveAspectRatio="xMidYMax meet" style={{ position: "absolute", left: 0, top: 0 }}>
            <Scene t={t} />
          </svg>
        ) : null}
        {p.answer ? (
          <div dir="rtl" style={{ position: "absolute", inset: "60px 60px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: fonts.punch, fontSize: 92, lineHeight: 1.3, color: "#FFFFFF", WebkitTextStroke: `5px ${INK}`, paintOrder: "stroke fill", transform: `scale(${spring({ frame: t - 6, fps, config: { damping: 10 } })})` }}>
            {p.answer}
          </div>
        ) : null}
      </div>
      {p.caption ? (
        <div dir="rtl" style={{ position: "absolute", top: -6, right: -6, background: "#FFD60A", border: `6px solid ${INK}`, padding: "6px 24px", fontFamily: fonts.punch, fontSize: 40, color: INK }}>{p.caption}</div>
      ) : null}
      {p.bubble ? (
        <div style={{ position: "absolute", left: p.bubble.x * p.w, top: p.bubble.y * p.h }}>
          <Bubble text={p.bubble.text} t={t - 8} tail={p.bubble.tail} />
        </div>
      ) : null}
      {p.sfx ? (
        <div style={{ position: "absolute", left: p.sfx.x * p.w, top: p.sfx.y * p.h }}>
          <Sfx text={p.sfx.text} t={t - 14} rot={p.sfx.rot} />
        </div>
      ) : null}
    </div>
  );
};

const Header: React.FC<{ issue: number }> = ({ issue }) => (
  <div style={{ position: "absolute", top: 40, left: 40, right: 40, height: 170, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `8px solid ${INK}` }}>
    <Img src={staticFile("neocapta-logo-dark.png")} style={{ width: 170, height: 170 * LOGO_RATIO }} />
    <div dir="rtl" style={{ textAlign: "right" }}>
      <div style={{ fontFamily: fonts.punch, fontSize: 74, color: INK, lineHeight: 1 }}>كوميكس نيو كابتا</div>
      <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 22, letterSpacing: 5, color: "#EF233C", marginTop: 8 }}>{`NEO CAPTA COMICS · NO. ${issue}`}</div>
    </div>
  </div>
);

const EndPage: React.FC<{ t: number; line: string; en: string; len: number }> = ({ t, line, en, len }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: t, fps, config: { damping: 10 } });
  const out = interpolate(t, [len - 12, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 260, bottom: 260, background: "#FFD60A", border: `8px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`, overflow: "hidden", transform: `scale(${0.7 + 0.3 * p})` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: halftone("rgba(17,17,17,0.12)"), backgroundSize: "16px 16px" }} />
        <svg width={1000} height={1400} viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
          <g opacity={0.5}>
            {new Array(30).fill(0).map((_, i) => {
              const a = (i / 30) * Math.PI * 2;
              return <path key={i} d={`M ${300 + Math.cos(a) * 120} ${260 + Math.sin(a) * 120} L ${300 + Math.cos(a) * 600} ${260 + Math.sin(a) * 600}`} stroke="#FFFFFF" strokeWidth={i % 2 ? 6 : 12} />;
            })}
          </g>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: 40, background: "#FFFFFF", border: `8px solid ${INK}`, borderRadius: "50%", boxShadow: `10px 10px 0 ${INK}`, transform: `rotate(${(1 - p) * -20}deg)` }}>
            <Img src={staticFile("neocapta-logo-dark.png")} style={{ width: 460, height: 460 * LOGO_RATIO }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center" }}>
          <Bubble text={line} t={t - 14} tail="down" size={62} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: fonts.en, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: INK, opacity: interpolate(t, [30, 44], [0, 1], clamp) }}>{en.toUpperCase()}</div>
      </div>
      <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, bottom: 140, textAlign: "center", fontFamily: fonts.punch, fontSize: 44, color: INK, opacity: interpolate(t, [36, 50], [0, 1], clamp) }}>استراتيجية · هوية · محتوى · حملات</div>
    </AbsoluteFill>
  );
};

export const ComicVideo: React.FC<{ clip: string }> = ({ clip }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const c = COMICS[clip];
  const issue = Object.keys(COMICS).indexOf(clip) + 1;
  return (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: halftone("rgba(17,17,17,0.06)"), backgroundSize: "22px 22px" }} />
      <Header issue={issue} />
      {c.pages.map((pg, i) => {
        if (frame < pg.from - 2 || frame >= pg.to) return null;
        const inX = interpolate(frame, [pg.from, pg.from + 12], [i === 0 ? 0 : 1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
        const outX = interpolate(frame, [pg.to - 12, pg.to], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
        return (
          <AbsoluteFill key={i} style={{ transform: `translateX(${(inX - outX) * -1200}px) rotate(${(inX + outX) * 4}deg)` }}>
            {pg.panels.map((p, k) => (
              <PanelView key={k} p={p} />
            ))}
          </AbsoluteFill>
        );
      })}
      {frame >= c.end ? <EndPage t={frame - c.end} line={c.endLine} en={c.endEn} len={durationInFrames - c.end} /> : null}
      <Audio src={staticFile(c.music)} />
    </AbsoluteFill>
  );
};

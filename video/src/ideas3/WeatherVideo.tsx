import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";
import TL from "./timelines.json";

// «نشرة السوق»: a TV weather forecast for your business. Stormy without a plan, sunny with NEO CAPTA.
const T = TL.weather;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = { bg1: "#0B1B44", bg2: "#173A80", card: "rgba(255,255,255,0.10)", line: "rgba(255,255,255,0.18)", text: "#FFFFFF", muted: "#AFC0E8", red: "#E63946", sun: "#FFC83D", blue: "#5E78FF" };

const Cloud: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#E8EEF9" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={-30} cy={0} r={34} fill={c} />
    <circle cx={10} cy={-20} r={44} fill={c} />
    <circle cx={50} cy={4} r={30} fill={c} />
    <rect x={-60} y={0} width={136} height={34} rx={17} fill={c} />
  </g>
);
const Sun: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${t * 2})`}>
    {new Array(10).fill(0).map((_, i) => <rect key={i} x={-6} y={-90} width={12} height={28} rx={6} fill={W.sun} transform={`rotate(${i * 36})`} />)}
    <circle r={52} fill={W.sun} />
  </g>
);
const Icon: React.FC<{ kind: string; t: number }> = ({ kind, t }) => (
  <svg width={220} height={220} viewBox="-110 -110 220 220">
    {kind === "storm" ? (
      <>
        <Cloud x={0} y={-20} s={1.1} c="#7F8BA6" />
        {t % 30 < 4 ? <polygon points="0,10 -26,60 -4,60 -20,100 30,40 6,40 22,10" fill={W.sun} /> : null}
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-50 + i * 30} ${30 + ((t * 6 + i * 20) % 60)} l -8 20`} stroke="#9CC3FF" strokeWidth={6} strokeLinecap="round" />)}
      </>
    ) : kind === "fog" ? (
      <>
        <Cloud x={0} y={-30} c="#8C97B0" />
        {[0, 1, 2].map((i) => <path key={i} d={`M ${-70 + Math.sin(t / 10 + i) * 14} ${30 + i * 24} l 140 0`} stroke="#B9C2D6" strokeWidth={10} strokeLinecap="round" />)}
      </>
    ) : kind === "showers" ? (
      <>
        <Sun x={-30} y={-40} t={t} s={0.6} />
        <Cloud x={14} y={0} c="#9AA6BE" />
        {[0, 1, 2].map((i) => <path key={i} d={`M ${-20 + i * 30} ${40 + ((t * 5 + i * 25) % 50)} l -6 16`} stroke="#9CC3FF" strokeWidth={6} strokeLinecap="round" />)}
      </>
    ) : kind === "partly" ? (
      <>
        <Sun x={-20} y={-20} t={t} s={0.8} />
        <Cloud x={30} y={30} s={0.8} />
      </>
    ) : (
      <Sun x={0} y={0} t={t} />
    )}
  </svg>
);

const BAD = [
  { ar: "المنافسة", en: "COMPETITION", state: "عواصف", val: "شديدة", icon: "storm" },
  { ar: "التفاعل", en: "ENGAGEMENT", state: "ضباب", val: "ضعيف", icon: "fog" },
  { ar: "المبيعات", en: "SALES", state: "متقلبة", val: "↓", icon: "showers" },
];
const GOOD = [
  { ar: "الرؤية", en: "VISIBILITY", state: "واضحة", val: "١٠٠٪", icon: "sun" },
  { ar: "التفاعل", en: "ENGAGEMENT", state: "مرتفع", val: "↑", icon: "partly" },
  { ar: "المبيعات", en: "SALES", state: "مشمسة", val: "↑↑", icon: "sun" },
];

export const WeatherVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = frame < T.intro[1];
  const alert = frame >= T.alert && frame < T.good;
  const thunder = alert && frame % 20 < 3;
  const ticker = "عاجل: مشاريع محلية تحقق نمو بعد خطة واضحة  •  المحتوى المفيد يجذب عملاء أكثر  •  نيو كابتا: لكل فكرة وجهة  •  ";
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${W.bg2} 0%, ${W.bg1} 70%)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${W.line} 1px, transparent 1px), linear-gradient(90deg, ${W.line} 1px, transparent 1px)`, backgroundSize: "120px 120px", opacity: 0.25 }} />
      {/* channel bug */}
      <div style={{ position: "absolute", top: 30, left: 34, display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={staticFile("neocapta-logo-white.png")} style={{ width: 150, height: 150 * LOGO_RATIO }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: W.red, padding: "6px 16px", borderRadius: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#FFF", opacity: frame % 30 < 18 ? 1 : 0.3 }} />
          <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 26, color: "#FFF", letterSpacing: 3 }}>LIVE</span>
        </div>
      </div>
      {/* title bar */}
      <div dir="rtl" style={{ position: "absolute", top: 210, left: 40, right: 40, display: "flex", alignItems: "stretch", transform: `translateX(${interpolate(frame, [T.intro[1], T.intro[1] + 14], [1100, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px)` }}>
        <div style={{ background: W.blue, padding: "14px 34px", fontFamily: fonts.display, fontWeight: 900, fontSize: 64, color: "#FFF" }}>نشرة السوق</div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", padding: "0 30px", fontFamily: fonts.en, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: W.bg1 }}>MARKET FORECAST</div>
      </div>
      {frame >= T.good ? (
        <div dir="rtl" style={{ position: "absolute", top: 340, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <span style={{ background: W.sun, color: W.bg1, fontFamily: fonts.display, fontWeight: 900, fontSize: 46, padding: "8px 34px", borderRadius: 40, transform: `scale(${spring({ frame: frame - T.good - 10, fps, config: { damping: 9 } })})` }}>مع نيو كابتا ☀</span>
        </div>
      ) : null}
      {/* forecast cards */}
      {[0, 1, 2].map((i) => {
        const inP = spring({ frame: frame - T.bad - i * 10, fps, config: { damping: 13 } });
        const flip = interpolate(frame, [T.good + i * 8, T.good + i * 8 + 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        const good = flip >= 0.5;
        const d = good ? GOOD[i] : BAD[i];
        const scaleY = Math.abs(Math.cos(flip * Math.PI));
        return (
          <div key={i} dir="rtl" style={{ position: "absolute", left: 50, right: 50, top: 450 + i * 400, height: 360, borderRadius: 30, background: good ? "rgba(255,200,61,0.16)" : W.card, border: `3px solid ${good ? W.sun : W.line}`, display: "flex", alignItems: "center", gap: 30, padding: "0 40px", transform: `translateX(${(1 - inP) * -1200}px) scaleY(${scaleY})` }}>
            <Icon kind={d.icon} t={frame} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 70, color: W.text, lineHeight: 1.1 }}>{d.ar}</div>
              <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 22, letterSpacing: 5, color: W.muted, marginTop: 6 }}>{d.en}</div>
              <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 46, color: good ? W.sun : "#C9D3EC", marginTop: 10 }}>{d.state}</div>
            </div>
            <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 84, color: good ? W.sun : W.red, direction: "rtl" }}>{d.val}</div>
          </div>
        );
      })}
      {/* storm alert */}
      {alert ? (
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 860, height: 200, background: W.red, display: "flex", alignItems: "center", justifyContent: "center", gap: 24, transform: `scaleY(${spring({ frame: frame - T.alert, fps, config: { damping: 12 } })})`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 90, color: "#FFF" }}>⚠</span>
          <div>
            <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 72, color: "#FFF" }}>تحذير: لا تطلع بدون خطة!</div>
            <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: "#FFE1E1" }}>WARNING: DON'T GO OUT WITHOUT A PLAN</div>
          </div>
        </div>
      ) : null}
      {thunder ? <AbsoluteFill style={{ background: "rgba(255,255,255,0.35)" }} /> : null}
      {/* ticker */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, height: 90, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div dir="rtl" style={{ position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 2, background: W.red, color: "#FFF", fontFamily: fonts.display, fontWeight: 900, fontSize: 44, padding: "0 30px", display: "flex", alignItems: "center" }}>عاجل</div>
        <div dir="rtl" style={{ position: "absolute", top: 18, whiteSpace: "nowrap", fontFamily: fonts.display, fontWeight: 700, fontSize: 40, color: W.bg1, left: -2400 + ((frame * 6) % 2400) }}>
          {ticker.repeat(4)}
        </div>
      </div>
      {/* intro bumper */}
      {intro ? (
        <AbsoluteFill style={{ background: W.bg1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
          <svg width={400} height={400} viewBox="-200 -200 400 400">
            <circle r={170} fill="none" stroke={W.blue} strokeWidth={14} strokeDasharray="60 30" transform={`rotate(${frame * 8})`} />
            <circle r={130} fill="none" stroke={W.sun} strokeWidth={8} strokeDasharray="20 20" transform={`rotate(${-frame * 6})`} />
          </svg>
          <div dir="rtl" style={{ position: "absolute", fontFamily: fonts.display, fontWeight: 900, fontSize: 70, color: "#FFF", textAlign: "center", lineHeight: 1.1 }}>نشرة<br />السوق</div>
        </AbsoluteFill>
      ) : null}
      {/* end card */}
      {frame >= T.end ? (
        <AbsoluteFill style={{ background: `linear-gradient(170deg, ${W.bg2} 0%, ${W.bg1} 70%)`, opacity: interpolate(frame, [T.duration - 12, T.duration], [1, 0], clamp) }}>
          <svg width={1080} height={700} style={{ position: "absolute", top: 260 }}>
            <Sun x={540} y={330} t={frame} s={2.6} />
          </svg>
          <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${0.7 + 0.3 * spring({ frame: frame - T.end, fps, config: { damping: 12 } })})` }}>
            <Img src={staticFile("neocapta-logo-dark.png")} style={{ width: 380, height: 380 * LOGO_RATIO }} />
          </div>
          <div dir="rtl" style={{ position: "absolute", top: 1060, left: 0, right: 0, textAlign: "center" }}>
            <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 84, color: "#FFF" }}>توقعاتنا لمشروعك: مشمس.</div>
            <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: W.sun, marginTop: 16 }}>FORECAST: SUNNY</div>
            <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 36, color: W.muted, marginTop: 60 }}>استراتيجية · هوية · محتوى · حملات</div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Audio src={staticFile("idea-weather-music.wav")} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { Background } from "../components/Background";
import { Grain } from "../components/Grain";
import { Flash } from "../components/Flash";
import { Logo } from "../components/Logo";
import { colors, fonts } from "../theme";
import { Words } from "./Words";
import { EndCard } from "./EndCard";
import series from "./series2.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = series.funnel;

// funnel geometry: tier boundaries and half-widths
const Y = [470, 700, 930, 1160, 1390];
const HW = [430, 320, 215, 120, 64];
const STAGES = [
  { ar: "شافوا الإعلان", en: "SAW" },
  { ar: "اهتموا", en: "INTERESTED" },
  { ar: "زاروا الصفحة", en: "VISITED" },
  { ar: "اشتروا", en: "BOUGHT" },
];
const PHASES = {
  a: { start: T.a, spawn: T.aSpawn, rates: [0.3, 0.3, 0.14], targets: [1000, 300, 90, 12], seed: "a" },
  b: { start: T.b, spawn: T.bSpawn, rates: [0.52, 0.46, 0.36], targets: [1000, 520, 240, 85], seed: "b" },
};
type Phase = (typeof PHASES)["a"];
const N = 120;
const V = 10; // fall speed px/frame
const PILE_Y = 1480;

const hw = (y: number) => {
  if (y <= Y[0]) return HW[0];
  for (let k = 0; k < 4; k++) if (y <= Y[k + 1]) return HW[k] + ((HW[k + 1] - HW[k]) * (y - Y[k])) / (Y[k + 1] - Y[k]);
  return HW[4];
};

// deterministic particle states for a phase at a frame
const simulate = (ph: Phase, frame: number) => {
  const pts: { x: number; y: number; o: number; leak: boolean; done: boolean }[] = [];
  const crossed = [0, 0, 0, 0];
  const total = [0, 0, 0, 0];
  let pile = 0;
  for (let i = 0; i < N; i++) {
    const r = (i * 0.6180339887 + (ph.seed === "a" ? 0.11 : 0.37)) % 1;
    const [p1, p2, p3] = ph.rates;
    const stage = r < p1 * p2 * p3 ? 3 : r < p1 * p2 ? 2 : r < p1 ? 1 : 0;
    for (let k = 0; k <= stage; k++) total[k]++;
    const spawn = ph.start + (ph.spawn * i) / N;
    const t = frame - spawn;
    const pileIdx = stage === 3 ? pile++ : 0;
    if (t < 0) continue;
    const y0 = Y[0] - 70;
    const y = y0 + V * t;
    for (let k = 0; k <= stage; k++) if (y >= Y[k]) crossed[k]++;
    const xn = (random(`${ph.seed}x${i}`) - 0.5) * 1.7;
    const leakY = stage < 3 ? Y[stage + 1] - 12 : Y[4];
    if (y < leakY) {
      pts.push({ x: 540 + xn * hw(y) + Math.sin(t / 5 + i) * 4, y, o: 1, leak: false, done: false });
    } else if (stage < 3) {
      const tl = t - (leakY - y0) / V;
      const dir = xn === 0 ? 1 : Math.sign(xn);
      pts.push({ x: 540 + xn * hw(leakY) + dir * 13 * tl, y: leakY + 2 * tl + 0.45 * tl * tl, o: Math.max(0, 1 - tl / 32), leak: true, done: false });
    } else {
      const px = 540 + ((pileIdx % 7) - 3) * 24;
      const py = PILE_Y - Math.floor(pileIdx / 7) * 22;
      const k = interpolate(y, [Y[4], py], [0, 1], clamp);
      pts.push({ x: 540 + (px - 540) * k, y: Math.min(y, py), o: 1, leak: false, done: true });
    }
  }
  const shown = total.map((tt, k) => (tt ? Math.round((ph.targets[k] * crossed[k]) / tt) : 0));
  return { pts, shown };
};

const Funnel: React.FC = () => {
  const frame = useCurrentFrame();
  const fixed = interpolate(frame, [T.fix + 6, T.b - 6], [0, 1], clamp);
  const ph = frame < T.fix ? PHASES.a : PHASES.b;
  const { pts, shown } = simulate(ph, frame);
  const resultIn = frame >= ph.start + ph.spawn + 60;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={colors.royal} stopOpacity={0.55} />
            <stop offset="1" stopColor={colors.accent} stopOpacity={0.35} />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {[0, 1, 2, 3].map((k) => {
          const pts4 = `${540 - HW[k]},${Y[k] + 6} ${540 + HW[k]},${Y[k] + 6} ${540 + HW[k + 1]},${Y[k + 1] - 6} ${540 - HW[k + 1]},${Y[k + 1] - 6}`;
          return (
            <g key={k}>
              <polygon points={pts4} fill="rgba(228,230,238,0.07)" stroke="rgba(228,230,238,0.3)" strokeWidth={3} />
              <polygon points={pts4} fill="url(#band)" opacity={fixed} />
              <polygon points={pts4} fill="none" stroke={colors.accent} strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fixed} strokeLinejoin="round" />
              {/* leaks */}
              {k < 3
                ? [-1, 1].map((d) => (
                    <g key={d} opacity={1 - fixed} transform={`translate(${540 + d * (HW[k + 1] + 26)} ${Y[k + 1] - 30})`}>
                      <path d={`M 0 0 L ${d * 36} 22 M ${d * 36} 22 L ${d * 18} 24 M ${d * 36} 22 L ${d * 30} 6`} stroke="#ff5a66" strokeWidth={5} strokeLinecap="round" fill="none" />
                    </g>
                  ))
                : null}
            </g>
          );
        })}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.done ? 10 : 8} fill={p.leak ? (ph === PHASES.a ? "#ff5a66" : "#8890aa") : p.done ? "#FFE7A3" : "#F4F5FA"} opacity={p.o * (frame < T.fix ? interpolate(frame, [T.fix - 14, T.fix], [1, 0], clamp) : 1)} />
        ))}
      </svg>
      {/* tier labels */}
      {STAGES.map((s, k) => {
        const mid = (Y[k] + Y[k + 1]) / 2;
        const narrow = k === 3;
        return (
          <div key={k} style={{ position: "absolute", top: mid - (narrow ? 70 : 82), left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>
            <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 800, fontSize: narrow ? 30 : 38, color: "#DCE4FF", textShadow: "0 2px 10px #000" }}>
              {s.ar} <span style={{ fontFamily: fonts.en, fontSize: narrow ? 16 : 20, letterSpacing: 3, opacity: 0.7 }}>{s.en}</span>
            </div>
            <div style={{ fontFamily: fonts.en, fontWeight: 900, fontSize: narrow ? 58 : 76, lineHeight: 1.1, color: k === 3 && shown[3] > 0 ? "#FFE7A3" : "#fff", textShadow: "0 4px 16px #000" }}>{shown[k].toLocaleString("en-US")}</div>
          </div>
        );
      })}
      {/* result badge */}
      <div style={{ position: "absolute", top: 1560, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: resultIn ? 1 : 0 }}>
        <div dir="rtl" style={{ padding: "14px 40px", borderRadius: 50, background: ph === PHASES.a ? "#c8303a" : colors.accent, fontFamily: fonts.ar, fontWeight: 900, fontSize: 48, color: "#fff" }}>
          {ph === PHASES.a ? "12 عميل بس من 1000" : "85 عميل من نفس الـ 1000"}
        </div>
      </div>
    </>
  );
};

const Caption: React.FC<{ text: string; hl?: number[]; hlColor?: string; en?: string }> = ({ text, hl, hlColor, en }) => (
  <div style={{ position: "absolute", top: 170, left: 0, right: 0 }}>
    <Words text={text} size={74} color={colors.white} highlight={hl} hlColor={hlColor} />
    {en ? (
      <div style={{ marginTop: 10 }}>
        <Words text={en} size={38} color={colors.silver} ar={false} weight={800} delay={8} gap={2} />
      </div>
    ) : null}
  </div>
);

const Compare: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 4, fps, config: { damping: 12 } });
  const b = spring({ frame: frame - 18, fps, config: { damping: 9 } });
  const box = (label: string, en: string, n: number, p: number, hot: boolean) => (
    <div style={{ width: 400, padding: "40px 0", borderRadius: 40, textAlign: "center", background: hot ? `linear-gradient(150deg, ${colors.royal}, ${colors.accent})` : "rgba(228,230,238,0.08)", border: `4px solid ${hot ? "#b9c6ff" : "rgba(228,230,238,0.25)"}`, transform: `scale(${p})` }}>
      <div style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 56, color: "#fff" }}>{label}</div>
      <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 26, letterSpacing: 5, color: "#DCE4FF" }}>{en}</div>
      <div style={{ fontFamily: fonts.en, fontWeight: 900, fontSize: 190, lineHeight: 1.1, color: hot ? "#fff" : colors.steel }}>{Math.round(n * Math.min(1, p))}</div>
      <div style={{ fontFamily: fonts.ar, fontWeight: 800, fontSize: 40, color: hot ? "#fff" : colors.steel }}>عميل</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 60, direction: "rtl" }}>
        {box("قبل", "BEFORE", 12, a, false)}
        {box("بعد", "AFTER", 85, b, true)}
      </div>
      <div style={{ position: "absolute", top: 1220, left: 0, right: 0 }}>
        <Words text="نفس الإعلان… ٧ أضعاف العملاء" size={76} color={colors.white} highlight={[2, 3]} delay={30} />
      </div>
    </AbsoluteFill>
  );
};

export const FunnelVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const show = interpolate(frame, [T.show, T.show + 20], [0, 1], clamp);
  const hide = interpolate(frame, [T.compare - 14, T.compare], [1, 0], clamp);
  const fixShake = frame >= T.fix && frame < T.fix + 10 ? Math.sin(frame * 3) * 8 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Background intensity={frame < T.fix ? 0.6 : 1.3} />
      <AbsoluteFill style={{ opacity: show * hide, transform: `translateX(${fixShake}px) translateY(${(1 - show) * 200}px)` }}>
        <Funnel />
      </AbsoluteFill>
      <Sequence from={0} durationInFrames={T.a + 10} layout="none">
        <div style={{ opacity: interpolate(frame, [T.a, T.a + 10], [1, 0], clamp) }}>
          <div style={{ position: "absolute", top: 170, left: 0, right: 0 }}>
            <Words text="1000 شخص شافوا إعلانك…" size={78} color={colors.white} highlight={[0]} />
            <div style={{ marginTop: 10 }}>
              <Words text="كم واحد اشترى؟" size={78} color={colors.white} highlight={[1]} delay={34} />
            </div>
          </div>
        </div>
      </Sequence>
      <Sequence from={T.a + 10} durationInFrames={T.fix - T.a - 10} layout="none">
        <Caption text="بدون خطة… أغلبهم يضيعون بالطريق" hl={[3]} hlColor="#c8303a" en="No plan? Most of them leak out." />
      </Sequence>
      <Sequence from={T.fix} durationInFrames={T.b - T.fix} layout="none">
        <div style={{ position: "absolute", top: 170, left: 0, right: 0 }}>
          <Words text="خلنا نصلحه." size={110} color={colors.white} highlight={[1]} />
        </div>
      </Sequence>
      <Sequence from={T.b} durationInFrames={T.compare - T.b} layout="none">
        <Caption text="مع نيو كابتا: نسد التسريب في كل مرحلة" hl={[3, 4]} en="We seal every leak in your funnel." />
      </Sequence>
      <Sequence from={T.compare} durationInFrames={T.end - T.compare}>
        <Compare />
      </Sequence>
      <Sequence from={T.end} durationInFrames={T.duration - T.end}>
        <EndCard line="نخلي كل مشاهدة تفرق" en="Make every view count." />
      </Sequence>
      <Sequence from={0} durationInFrames={T.end}>
        <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 0.8 }}>
          <Logo width={140} />
        </div>
      </Sequence>
      {[T.fix, T.compare, T.end].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={8}>
          <Flash duration={6} />
        </Sequence>
      ))}
      <Grain />
      <Audio src={staticFile("funnel-music.wav")} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { C, ClayBg, ClayEnd, ClayLogo, Say, clamp, clay } from "./kit";
import TL from "./timelines.json";

// «لوحة النتائج»: a results dashboard assembling itself — every riyal measured.
const T = TL.dash;
const GRID = { x: 70, y: 470, w: 940, gap: 30 };
const half = (GRID.w - GRID.gap) / 2;

const Card: React.FC<{ i: number; x: number; y: number; w: number; h: number; color: string; title: string; en: string; children: React.ReactNode }> = ({ i, x, y, w, h, color, title, en, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - T.widgets[i], fps, config: { damping: 10, stiffness: 150 } });
  return (
    <div dir="rtl" style={{ position: "absolute", left: x, top: y, width: w, height: h, padding: "26px 30px", ...clay(color, 44), transform: `scale(${p}) translateY(${(1 - p) * 80}px)`, opacity: Math.min(1, p * 2) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 40, color: C.navy }}>{title}</span>
        <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 16, letterSpacing: 4, color: C.muted }}>{en}</span>
      </div>
      {children}
    </div>
  );
};

const count = (frame: number, from: number, to: number, start: number, dur = 40) => from + (to - from) * interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

export const DashVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const W = T.widgets;
  const reach = count(frame, 0, 128, W[0] + 8);
  const conv = count(frame, 0, 4.8, W[2] + 8);
  const sales = interpolate(frame, [W[3] + 8, W[3] + 50], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const roas = count(frame, 0, 6.2, W[4] + 10, 50);
  const bars = [0.35, 0.5, 0.42, 0.7, 0.62, 0.9];
  const pts = [[0, 150], [80, 130], [160, 140], [240, 95], [320, 80], [400, 30]];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <ClayBg />
      <Sequence from={0} durationInFrames={T.line} layout="none">
        <Say ar="تبي تعرف وين راحت فلوسك؟" en="Want to know where your money went?" top={150} from={4} hl={3} size={80} />
      </Sequence>
      <Sequence from={T.line} durationInFrames={T.end - T.line} layout="none">
        <Say ar="كل ريال… له رقم." en="Every riyal, measured." top={150} from={2} hl={1} size={92} />
      </Sequence>
      {/* reach */}
      <Card i={0} x={GRID.x + half + GRID.gap} y={GRID.y} w={half} h={330} color={C.white} title="الوصول" en="REACH">
        <div style={{ marginTop: 30, fontFamily: fonts.en, fontWeight: 800, fontSize: 96, color: C.blue, direction: "ltr", textAlign: "right" }}>{reach.toFixed(0)}K</div>
        <svg width={half - 60} height={70} viewBox="0 0 400 70" style={{ marginTop: 6 }}>
          <path d="M 0 60 C 60 55, 100 40, 160 45 S 260 20, 400 8" fill="none" stroke={C.peri} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(frame, [W[0] + 8, W[0] + 48], [0, 1], clamp)} />
        </svg>
      </Card>
      {/* clicks */}
      <Card i={1} x={GRID.x} y={GRID.y} w={half} h={330} color={C.mint} title="النقرات" en="CLICKS">
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 190, display: "flex", alignItems: "flex-end", gap: 16, direction: "ltr" }}>
          {bars.map((b, k) => {
            const p = spring({ frame: frame - W[1] - 8 - k * 4, fps: 30, config: { damping: 8 } });
            return <div key={k} style={{ flex: 1, height: `${b * 100 * p}%`, ...clay(k === bars.length - 1 ? C.blue : C.white, 16) }} />;
          })}
        </div>
      </Card>
      {/* conversion donut */}
      <Card i={2} x={GRID.x + half + GRID.gap} y={GRID.y + 360} w={half} h={330} color={C.peach} title="التحويل" en="CONVERSION">
        <div style={{ position: "absolute", left: 30, bottom: 30, width: 200, height: 200, borderRadius: "50%", background: `conic-gradient(${C.blue} ${(conv / 4.8) * 0.62 * 360}deg, rgba(255,255,255,0.7) 0deg)`, boxShadow: "0 16px 30px rgba(52,68,153,0.2)" }}>
          <div style={{ position: "absolute", inset: 40, borderRadius: "50%", background: C.peach }} />
        </div>
        <div style={{ position: "absolute", right: 30, bottom: 60, fontFamily: fonts.en, fontWeight: 800, fontSize: 76, color: C.navy, direction: "ltr" }}>{conv.toFixed(1)}%</div>
      </Card>
      {/* sales */}
      <Card i={3} x={GRID.x} y={GRID.y + 360} w={half} h={330} color={C.lilac} title="المبيعات" en="SALES">
        <svg width={half - 60} height={200} viewBox="0 0 420 170" style={{ position: "absolute", left: 30, bottom: 30, direction: "ltr" }}>
          <path d={`M ${pts.map((p) => p.join(" ")).join(" L ")}`} fill="none" stroke={C.blue} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - sales} />
          <circle cx={400} cy={30} r={16 * sales} fill={C.blue} />
          <path d="M 360 30 L 400 30 L 400 70" fill="none" stroke={C.blue} strokeWidth={8} strokeLinecap="round" opacity={sales} />
        </svg>
      </Card>
      {/* ROAS */}
      <Card i={4} x={GRID.x} y={GRID.y + 720} w={GRID.w} h={330} color={C.blue} title="" en="">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%", marginTop: -40 }}>
          <div>
            <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 48, color: C.white }}>العائد على الإعلان</div>
            <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 20, letterSpacing: 5, color: C.lilac, marginTop: 6 }}>RETURN ON AD SPEND</div>
          </div>
          <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 150, color: C.butter, direction: "ltr" }}>×{roas.toFixed(1)}</div>
        </div>
      </Card>
      {frame >= W[0] && frame < T.end ? (
        <div dir="rtl" style={{ position: "absolute", top: GRID.y + 1080, left: 0, right: 0, textAlign: "center", fontFamily: fonts.display, fontWeight: 500, fontSize: 28, color: C.muted }}>* أرقام توضيحية</div>
      ) : null}
      <Sequence from={T.end}>
        <ClayEnd ar="حملات تقدر تقيس نتيجتها." en="Campaigns you can measure." />
      </Sequence>
      {frame < T.end ? <ClayLogo /> : null}
      <Audio src={staticFile("clay-dash-music.wav")} />
    </AbsoluteFill>
  );
};

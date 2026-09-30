import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../../components/useFonts";
import { Grain } from "../../components/Grain";
import { Flash } from "../../components/Flash";
import { Logo } from "../../components/Logo";
import { LuxTitle } from "../../chess/LuxTitle";
import { colors, fonts } from "../../theme";
import { BrandOutro } from "../BrandOutro";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CX = 540;
const CY = 1270;
const R = 360;

export const services = [
  { en: "STRATEGY", ar: "الاستراتيجية" },
  { en: "BRANDING", ar: "الهوية" },
  { en: "CONTENT", ar: "المحتوى" },
  { en: "CAMPAIGNS", ar: "الحملات" },
  { en: "GROWTH", ar: "النمو" },
];

const steel = "radial-gradient(circle at 35% 30%, #d7dce6 0%, #9aa3b5 30%, #5b6275 65%, #2e3340 100%)";

const Dial: React.FC<{ angle: number }> = ({ angle }) => (
  <div style={{ position: "absolute", left: -120, top: -120, width: 240, height: 240 }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #2a2f3b, #0b0d12)", border: "6px solid #c9ceda", boxShadow: "0 10px 30px rgba(0,0,0,0.7)" }} />
    <svg width={240} height={240} viewBox="-120 -120 240 240" style={{ position: "absolute", inset: 0, transform: `rotate(${angle}deg)` }}>
      {new Array(60).fill(0).map((_, i) => {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const long = i % 5 === 0;
        return <line key={i} x1={Math.cos(a) * 100} y1={Math.sin(a) * 100} x2={Math.cos(a) * (long ? 82 : 92)} y2={Math.sin(a) * (long ? 82 : 92)} stroke="#E4E6EE" strokeWidth={long ? 3 : 1.5} />;
      })}
      {new Array(6).fill(0).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return (
          <text key={i} x={Math.cos(a) * 64} y={Math.sin(a) * 64 + 9} textAnchor="middle" fill="#E4E6EE" fontFamily="Montserrat" fontWeight={800} fontSize={24}>
            {i * 10}
          </text>
        );
      })}
      <circle r={30} fill="#1a1e28" stroke="#8A90A8" strokeWidth={3} />
    </svg>
    {/* pointer */}
    <div style={{ position: "absolute", left: 110, top: -26, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: `20px solid ${colors.accent}` }} />
  </div>
);

const Wheel: React.FC<{ angle: number }> = ({ angle }) => (
  <svg width={260} height={260} viewBox="-130 -130 260 260" style={{ position: "absolute", left: -130, top: -130, transform: `rotate(${angle}deg)`, overflow: "visible" }}>
    {[0, 60, 120].map((a) => (
      <rect key={a} x={-120} y={-9} width={240} height={18} rx={9} fill="#c9ceda" transform={`rotate(${a})`} stroke="#5b6275" strokeWidth={2} />
    ))}
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 120} cy={Math.sin((a * Math.PI) / 180) * 120} r={16} fill="#e4e8f0" stroke="#5b6275" strokeWidth={2} />
    ))}
    <circle r={34} fill="#9aa3b5" stroke="#2e3340" strokeWidth={4} />
  </svg>
);

const Vault: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro, locked, answer, code, open } = timeline;

  // dial angle through the phases
  const wobble = frame >= locked.from && frame < answer.from ? Math.sin(frame / 5) * 70 + Math.sin(frame / 2.3) * 25 : 0;
  let dial = wobble;
  if (frame >= answer.from) dial = interpolate(frame, [answer.from, answer.from + 20], [wobble, 0], clamp);
  code.angles.forEach((a, k) => {
    const s = code.from + k * code.each;
    const prev = k === 0 ? 0 : code.angles[k - 1];
    if (frame >= s) dial = interpolate(frame, [s, s + code.turn], [prev, a], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  });
  const entered = code.values.filter((_, k) => frame >= code.from + k * code.each + code.turn).length;

  const wheel = interpolate(frame, [open.wheel, open.bolts], [0, 300], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const bolts = interpolate(frame, [open.bolts, open.bolts + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const door = interpolate(frame, [open.door, open.door + 50], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const glow = interpolate(frame, [open.door, open.door + 40], [0, 1], clamp);
  const logoIn = spring({ frame: frame - (open.door + 20), fps, config: { damping: 200 } });
  const intro1 = interpolate(frame, [intro.from, intro.from + 40], [0, 1], clamp);
  const lockedLamp = frame >= locked.from && frame < answer.from && frame % 14 < 7;
  const shake = frame >= locked.from && frame < answer.from ? Math.sin(frame * 1.7) * 3 : 0;
  const push = interpolate(frame, [open.door + 30, open.to], [1, 1.35], { ...clamp, easing: Easing.in(Easing.quad) });

  return (
    <AbsoluteFill style={{ opacity: intro1, transform: `scale(${push})`, transformOrigin: `${CX}px ${CY}px` }}>
      {/* combination panel */}
      <div style={{ position: "absolute", top: 600, left: 70, right: 70, display: "flex", gap: 16, opacity: 1 - glow }}>
        {code.values.map((v, k) => {
          const done = k < entered;
          return (
            <div key={k} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 96, borderRadius: 14, background: "#07090f", border: `3px solid ${done ? colors.accent : "#2e3340"}`, boxShadow: done ? "0 0 24px rgba(94,120,255,0.7)" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.mono, fontWeight: 700, fontSize: 58, color: done ? colors.white : "#3a4050" }}>
                {done ? String(v).padStart(2, "0") : "--"}
              </div>
              <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 16, letterSpacing: 1, color: done ? colors.accent : colors.steel, marginTop: 8 }}>{services[k].en}</div>
              <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 20, color: done ? colors.silver : "#3a4050" }}>
                {services[k].ar}
              </div>
            </div>
          );
        })}
      </div>
      {/* status lamp */}
      <div style={{ position: "absolute", top: CY + 490, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14, alignItems: "center", opacity: 1 - glow }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: frame >= open.bolts ? colors.accent : lockedLamp ? "#e0303a" : "#4a1a20", boxShadow: frame >= open.bolts ? "0 0 20px #5E78FF" : lockedLamp ? "0 0 20px #e0303a" : "none" }} />
        <span style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: frame >= open.bolts ? colors.accent : "#c05060" }}>{frame >= open.bolts ? "UNLOCKED · مفتوح" : "LOCKED · مقفل"}</span>
      </div>

      {/* wall frame */}
      <div style={{ position: "absolute", left: CX - 470, top: CY - 470, width: 940, height: 940, borderRadius: 40, background: "linear-gradient(145deg, #3a4050, #151821)", boxShadow: "inset 0 0 60px rgba(0,0,0,0.8), 0 40px 100px rgba(0,0,0,0.8)" }} />
      {/* the treasure behind the door */}
      <div style={{ position: "absolute", left: CX - R, top: CY - R, width: R * 2, height: R * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(170,185,255,${glow}) 0%, rgba(94,120,255,${glow * 0.8}) 35%, #05070d 75%)`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: logoIn, transform: `scale(${0.8 + logoIn * 0.2})` }}>
          <Logo width={460} />
        </div>
      </div>
      {/* light rays when open */}
      {glow > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
          {new Array(14).fill(0).map((_, i) => {
            const a = (i / 14) * Math.PI * 2 + frame / 80;
            return <polygon key={i} points={`${CX},${CY} ${CX + Math.cos(a - 0.06) * 1400},${CY + Math.sin(a - 0.06) * 1400} ${CX + Math.cos(a + 0.06) * 1400},${CY + Math.sin(a + 0.06) * 1400}`} fill="rgba(160,180,255,0.12)" opacity={glow} />;
          })}
        </svg>
      ) : null}
      {/* the door */}
      <div style={{ position: "absolute", left: CX - R, top: CY - R, width: R * 2, height: R * 2, perspective: 1800 }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "0% 50%", transform: `rotateY(${-door * 105}deg) translateX(${shake}px)`, transformStyle: "preserve-3d" }}>
          {/* bolts */}
          {new Array(8).fill(0).map((_, i) => {
            const a = (i / 8) * 360;
            return (
              <div key={i} style={{ position: "absolute", left: R - 22, top: R - 10, width: 44, height: 20, transformOrigin: "22px 10px", transform: `rotate(${a}deg) translateX(${R - 10 - bolts * 50}px)`, background: "linear-gradient(180deg, #e4e8f0, #7a8296)", borderRadius: 6 }} />
            );
          })}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: steel, boxShadow: "inset 0 0 0 18px rgba(0,0,0,0.25), inset 0 0 0 22px #c9ceda, 0 20px 60px rgba(0,0,0,0.7)" }} />
          <div style={{ position: "absolute", inset: 70, borderRadius: "50%", border: "4px solid rgba(0,0,0,0.25)" }} />
          {new Array(24).fill(0).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <div key={i} style={{ position: "absolute", left: R + Math.cos(a) * (R - 44) - 7, top: R + Math.sin(a) * (R - 44) - 7, width: 14, height: 14, borderRadius: 7, background: "radial-gradient(circle at 35% 35%, #fff, #6d7488)" }} />;
          })}
          <div style={{ position: "absolute", left: R, top: R - 110 }}>
            <Dial angle={dial} />
          </div>
          <div style={{ position: "absolute", left: R, top: R + 150 }}>
            <Wheel angle={wheel} />
          </div>
          <div style={{ position: "absolute", left: R - 90, top: R + 38, width: 180, textAlign: "center", fontFamily: fonts.en, fontWeight: 800, fontSize: 18, letterSpacing: 6, color: "#2e3340" }}>NEO CAPTA</div>
        </div>
      </div>
      {/* intro light sweep */}
      <AbsoluteFill style={{ background: `linear-gradient(115deg, transparent ${interpolate(frame, [10, 70], [-30, 130]) - 10}%, rgba(255,255,255,0.18) ${interpolate(frame, [10, 70], [-30, 130])}%, transparent ${interpolate(frame, [10, 70], [-30, 130]) + 10}%)`, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// "الخزنة / The Vault" — every service is a number in the combination that unlocks the idea.
export const VaultVideo: React.FC = () => {
  useFonts();
  const { intro, locked, answer, code, open, outro } = timeline;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #151a2a 0%, #05060a 70%)", overflow: "hidden" }}>
      <Sequence from={0} durationInFrames={outro.from}>
        <Vault />
      </Sequence>
      <Sequence from={intro.from + 20} durationInFrames={intro.to - intro.from - 20}>
        <AbsoluteFill style={{ paddingTop: 230 }}>
          <LuxTitle kicker="THE VAULT · الخزنة" en="Every idea holds a treasure." ar="كل فكرة وراها كنز." enSize={80} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={locked.from + 4} durationInFrames={locked.to - locked.from - 4}>
        <AbsoluteFill style={{ paddingTop: 230 }}>
          <LuxTitle en="But not every idea knows the code." ar="لكن مو كل فكرة تعرف الرمز." enSize={76} arSize={70} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={answer.from + 4} durationInFrames={answer.to - answer.from - 4}>
        <AbsoluteFill style={{ paddingTop: 230 }}>
          <LuxTitle kicker="NEO CAPTA" en="We know the combination." ar="نحن نعرف الرمز." enSize={80} />
        </AbsoluteFill>
      </Sequence>
      {services.map((s, k) => (
        <Sequence key={s.en} from={code.from + k * code.each} durationInFrames={code.each}>
          <AbsoluteFill style={{ paddingTop: 250 }}>
            <LuxTitle kicker={`CODE ${k + 1} · ${String(code.values[k]).padStart(2, "0")}`} en={s.en.charAt(0) + s.en.slice(1).toLowerCase()} ar={s.ar} enSize={90} arSize={80} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence from={open.door} durationInFrames={outro.from - open.door}>
        <AbsoluteFill style={{ paddingTop: 230 }}>
          <LuxTitle en="We unlock your idea's potential." ar="نفتح لفكرتك أبوابها." enSize={74} arSize={80} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <BrandOutro en="Unlock your idea." ar="افتح أبواب فكرتك" />
      </Sequence>
      <Sequence from={0} durationInFrames={outro.from}>
        <div style={{ position: "absolute", top: 70, right: 60, opacity: 0.85 }}>
          <Logo width={150} />
        </div>
      </Sequence>
      {[open.door + 10, outro.from].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={12}>
          <Flash duration={10} />
        </Sequence>
      ))}
      <Grain />
      <Audio src={staticFile("vault-music.wav")} />
    </AbsoluteFill>
  );
};

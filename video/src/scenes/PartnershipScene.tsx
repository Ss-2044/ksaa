import React from "react";
import { AbsoluteFill, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { colors, fonts } from "../theme";
import { Logo } from "../components/Logo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Handwritten-looking signatures.
const SIG_A = "M 10 70 C 30 10, 50 10, 45 60 S 70 90, 90 40 C 100 20, 110 80, 130 50 C 145 30, 150 70, 175 45 C 190 30, 210 60, 240 30";
const SIG_B = "M 10 60 C 40 20, 60 80, 80 40 C 95 15, 105 75, 125 55 C 140 40, 150 20, 170 60 C 180 80, 200 30, 235 40";

const Signature: React.FC<{ d: string; from: number; to: number; x: number; y: number }> = ({ d, from, to, x, y }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [from, to], [0, 1], clamp);
  const len = getLength(d);
  const pt = getPointAtLength(d, Math.max(0.01, len * p));
  const penVisible = p > 0 && p < 1 && pt !== null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 250, height: 100 }}>
      <svg width={250} height={100} style={{ overflow: "visible" }}>
        <path d={d} stroke="#10205e" strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
        {penVisible && pt ? (
          <g transform={`translate(${pt.x} ${pt.y}) rotate(-35)`}>
            <rect x={-6} y={-160} width={12} height={150} rx={6} fill="#141824" />
            <rect x={-6} y={-60} width={12} height={10} fill="#c9a24a" />
            <path d="M -6 -10 L 6 -10 L 0 4 Z" fill="#c9a24a" />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

const PartyBadge: React.FC<{ children: React.ReactNode; label: string; labelAr: string; delay: number }> = ({ children, label, labelAr, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, transform: `scale(${s})`, opacity: s }}>
      <div
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          overflow: "hidden",
          border: `6px solid ${colors.silver}`,
          boxShadow: `0 0 60px rgba(94,120,255,0.55)`,
          background: colors.night,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
      <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 34, color: colors.white }}>{label}</div>
      <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 36, color: colors.steel, marginTop: -14 }}>
        {labelAr}
      </div>
    </div>
  );
};

// Generic civic emblem (not any real authority's mark) — swap for the actual partner logo.
const PartnerEmblem: React.FC = () => (
  <svg width={190} height={190} viewBox="0 0 100 100">
    <path d="M 50 12 L 90 32 L 10 32 Z" fill={colors.silver} />
    {[20, 35, 50, 65, 80].map((x) => (
      <rect key={x} x={x - 4} y={38} width={8} height={40} fill={colors.silver} />
    ))}
    <rect x={8} y={80} width={84} height={8} fill={colors.silver} />
  </svg>
);

const Flashes: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(9).fill(0).map((_, i) => {
        const at = from + Math.floor(random(`f${i}`) * 34);
        const life = frame - at;
        if (life < 0 || life > 5) return null;
        const x = random(`fx${i}`) * 1080;
        const y = 300 + random(`fy${i}`) * 1300;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 260,
              top: y - 260,
              width: 520,
              height: 520,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(200,210,255,0.55) 25%, rgba(0,0,0,0) 65%)",
              opacity: 1 - life / 5,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const PartnershipScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  // Phase 1 (0-55): the two parties. Phase 2 (45-150): the agreement is signed. Phase 3 (140+): flashes, handshake line.
  const partiesOut = interpolate(frame, [48, 62], [1, 0], clamp);
  const connect = interpolate(frame, [20, 40], [0, 1], clamp);
  const doc = spring({ frame: frame - 50, fps, config: { damping: 18 } });
  const docZoom = interpolate(frame, [60, 150], [1, 1.06], clamp) - interpolate(frame, [150, 175], [0, 0.18], clamp);
  const stamp = spring({ frame: frame - 128, fps, config: { damping: 9, stiffness: 180 } });
  const closing = spring({ frame: frame - 150, fps, config: { damping: 200 } });
  const out = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      {/* title */}
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, textAlign: "center", opacity: interpolate(frame, [0, 10], [0, 1], clamp) }}>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 76, color: colors.white }}>
          شراكة استراتيجية
        </div>
        <div style={{ fontFamily: fonts.en, fontWeight: 500, fontSize: 38, letterSpacing: 8, color: colors.accent }}>STRATEGIC PARTNERSHIP</div>
      </div>

      {/* phase 1: parties */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: partiesOut }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <PartyBadge label="NEO CAPTA" labelAr="نيو كابتا" delay={4}>
            <Img src={staticFile("me.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "55% 30%", transform: "scale(1.6)", transformOrigin: "58% 30%" }} />
          </PartyBadge>
          <div style={{ width: 150, height: 6, background: colors.accent, transform: `scaleX(${connect})`, boxShadow: "0 0 20px #5E78FF", marginTop: -110 }} />
          <PartyBadge label="GOV. PARTNER" labelAr="جهة حكومية" delay={10}>
            <PartnerEmblem />
          </PartyBadge>
        </div>
      </AbsoluteFill>

      {/* phase 2: the agreement */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 860,
            height: 1060,
            marginTop: 120,
            borderRadius: 16,
            background: "#f7f7f2",
            boxShadow: "0 60px 120px rgba(0,0,0,0.7)",
            transform: `translateY(${(1 - doc) * 1400}px) rotate(${(1 - doc) * 8 - 1.5}deg) scale(${docZoom})`,
            position: "relative",
            overflow: "hidden",
            padding: 60,
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Logo width={190} style={{ filter: "none", background: "#0a0c18", borderRadius: 12, padding: 8 }} />
            <svg width={110} height={110} viewBox="0 0 100 100">
              <path d="M 50 12 L 90 32 L 10 32 Z" fill="#1c2340" />
              {[20, 35, 50, 65, 80].map((x) => (
                <rect key={x} x={x - 4} y={38} width={8} height={40} fill="#1c2340" />
              ))}
              <rect x={8} y={80} width={84} height={8} fill="#1c2340" />
            </svg>
          </div>
          <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 56, color: "#10183f", textAlign: "center", marginTop: 30 }}>
            اتفاقية شراكة
          </div>
          <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 32, letterSpacing: 6, color: "#344499", textAlign: "center" }}>PARTNERSHIP AGREEMENT</div>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            {[1, 0.92, 0.96, 0.7, 0.88, 0.95, 0.6].map((w, i) => (
              <div key={i} style={{ height: 14, width: `${w * 100}%`, marginLeft: "auto", borderRadius: 7, background: "#d9dbe3" }} />
            ))}
          </div>
          {/* signature lines */}
          <div style={{ position: "absolute", left: 60, right: 60, bottom: 110, display: "flex", justifyContent: "space-between" }}>
            {[
              { en: "NEO CAPTA", ar: "الطرف الأول" },
              { en: "PARTNER", ar: "الطرف الثاني" },
            ].map((s) => (
              <div key={s.en} style={{ width: 330, borderTop: "3px solid #10183f", paddingTop: 10, textAlign: "center" }}>
                <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 26, color: "#10183f" }}>{s.en}</div>
                <div dir="rtl" style={{ fontFamily: fonts.ar, fontSize: 26, color: "#5a6078" }}>
                  {s.ar}
                </div>
              </div>
            ))}
          </div>
          <Signature d={SIG_A} from={66} to={96} x={105} y={780} />
          <Signature d={SIG_B} from={100} to={124} x={505} y={780} />
          {/* stamp */}
          <div
            style={{
              position: "absolute",
              right: 90,
              top: 560,
              width: 250,
              height: 250,
              borderRadius: "50%",
              border: "8px solid rgba(52,68,153,0.85)",
              color: "rgba(52,68,153,0.9)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${interpolate(stamp, [0, 1], [2.6, 1])}) rotate(-14deg)`,
              opacity: frame >= 128 ? Math.min(1, stamp * 1.5) : 0,
            }}
          >
            <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 44 }}>SIGNED</div>
            <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 40 }}>
              تم التوقيع
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* phase 3: press flashes + closing line */}
      <Sequence from={130} layout="none">
        <Flashes from={0} />
      </Sequence>
      <div
        style={{
          position: "absolute",
          bottom: 150,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: closing,
          transform: `translateY(${(1 - closing) * 30}px)`,
        }}
      >
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 64, color: colors.white, textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}>
          بداية طريقٍ جديد
        </div>
        <div style={{ fontFamily: fonts.en, fontWeight: 500, fontSize: 36, letterSpacing: 6, color: colors.silver }}>A NEW ROAD BEGINS</div>
      </div>
    </AbsoluteFill>
  );
};

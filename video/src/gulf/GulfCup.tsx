import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { Grain } from "../components/Grain";
import { Flash } from "../components/Flash";
import { fonts } from "../theme";
import { CornerLogo, GoldConfetti, GoldText, SaduBand, Trophy, gold, green } from "./parts";
import T from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const TEAM = staticFile("gulf/team.jpg");
const OWAIS = staticFile("gulf/owais.jpg");

const Stamp: React.FC<{ p: number; size: number }> = ({ p, size }) => (
  <div
    style={{
      display: "inline-block",
      padding: `0 ${size * 0.32}px`,
      borderRadius: size * 0.16,
      background: `linear-gradient(180deg, ${gold.light}, ${gold.mid} 55%, ${gold.deep})`,
      transform: `scale(${interpolate(p, [0, 1], [2.4, 1])}) rotate(-5deg)`,
      opacity: Math.min(1, p * 3),
      boxShadow: "0 14px 40px rgba(0,0,0,0.55)",
    }}
  >
    <span style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: size, lineHeight: 1.3, color: green.deep }}>لا لعب</span>
  </div>
);

// 1) Al-Owais with the falcon: "هذا الأخضر… لا لعب"
const OwaisScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, T.team], [1.18, 1.02], clamp);
  const line = spring({ frame: frame - T.line1, fps, config: { damping: 10, stiffness: 170 } });
  const stamp = spring({ frame: frame - T.stamp, fps, config: { damping: 8, stiffness: 220 } });
  const shake = frame >= T.stamp && frame < T.stamp + 10 ? (random(`o${frame}`) - 0.5) * 34 * (1 - (frame - T.stamp) / 10) : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <Img src={OWAIS} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "72% 50%", transform: `scale(${zoom})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 48%, rgba(2,26,16,0.92) 78%, #021a10 100%)" }} />
      <div style={{ position: "absolute", top: 1240, left: 0, right: 0, textAlign: "center" }}>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 170, lineHeight: 1.2, color: "#fff", textShadow: `0 0 40px ${green.light}`, transform: `scale(${interpolate(line, [0, 1], [1.8, 1])})`, opacity: Math.min(1, line * 2) }}>
          هذا الأخضر
        </div>
        <div style={{ marginTop: 16 }}>
          <Stamp p={stamp} size={150} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 2) The whole squad, panning: "أبطال الخليج"
const TeamScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = T.trophy - T.team;
  // photo scaled to fill height; pan across the line-up
  const h = 1920;
  const w = (2048 / 1592) * h;
  const x = interpolate(frame, [0, len], [-360, -w + 1080 + 330], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const title = spring({ frame: frame - 20, fps, config: { damping: 11 } });
  const sub = interpolate(frame, [40, 60], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Img src={TEAM} style={{ position: "absolute", top: -90, left: x, width: w, height: h }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 52%, rgba(2,26,16,0.95) 70%, ${green.deep} 100%)` }} />
      <div style={{ position: "absolute", top: 1360, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ transform: `scale(${interpolate(title, [0, 1], [0.6, 1])})`, opacity: title }}>
          <GoldText size={190}>أبطال الخليج</GoldText>
        </div>
        <div style={{ marginTop: 6, opacity: sub, fontFamily: fonts.en, fontWeight: 800, fontSize: 44, letterSpacing: 12, color: "#fff" }}>GULF CUP CHAMPIONS</div>
        <div style={{ marginTop: 30, display: "flex", justifyContent: "center", opacity: sub }}>
          <SaduBand width={700} />
        </div>
      </div>
      <GoldConfetti t={frame - 18} seed="team" />
    </AbsoluteFill>
  );
};

// 3) Gold cup: "جهزوا كاس الذهب"
const TrophyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 90 } });
  const shine = interpolate(frame, [36, 66], [-0.2, 1.2], clamp);
  const l1 = spring({ frame: frame - 34, fps, config: { damping: 11 } });
  const l2 = spring({ frame: frame - 48, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${green.mid} 0%, ${green.dark} 45%, ${green.deep} 100%)` }}>
      <Img src={TEAM} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.16, filter: "blur(10px) grayscale(0.3)" }} />
      {/* rays */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.55 * rise }}>
        <g transform={`translate(540 760) rotate(${frame * 0.4})`}>
          {new Array(18).fill(0).map((_, i) => (
            <path key={i} d="M 0 0 L -60 -1100 L 60 -1100 Z" fill={gold.mid} opacity={0.18} transform={`rotate(${i * 20})`} />
          ))}
        </g>
      </svg>
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `translateY(${(1 - rise) * 900}px)` }}>
        <Trophy size={520} shine={shine} />
      </div>
      <div style={{ position: "absolute", top: 1100, left: 0, right: 0, textAlign: "center" }}>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 150, lineHeight: 1.2, color: "#fff", transform: `scale(${l1})` }}>
          جهّزوا
        </div>
        <div style={{ transform: `scale(${interpolate(l2, [0, 1], [2, 1])})`, opacity: Math.min(1, l2 * 2) }}>
          <GoldText size={190}>كاس الذهب</GoldText>
        </div>
      </div>
      <GoldConfetti t={frame - 50} seed="cup" count={70} />
    </AbsoluteFill>
  );
};

// 4) Final poster layout (also used for the still poster)
export const FinalLayout: React.FC<{ height: number; frame: number; animate?: boolean }> = ({ height, frame, animate = true }) => {
  const s = (d: number) => (animate ? spring({ frame: frame - d, fps: 30, config: { damping: 12 } }) : 1);
  const tall = height > 1500;
  const photoH = tall ? 1000 : 760;
  const archW = tall ? 430 : 380;
  const archH = tall ? 640 : 500;
  const archTop = photoH - (tall ? 150 : 130);
  const textTop = photoH - (tall ? 40 : 60);
  return (
    <AbsoluteFill style={{ background: green.deep }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: height - photoH + 200, background: `radial-gradient(ellipse at 65% 60%, rgba(11,110,59,0.45) 0%, rgba(2,26,16,0) 65%)` }} />
      {/* squad */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: photoH, overflow: "hidden", opacity: s(0) }}>
        <Img src={TEAM} style={{ position: "absolute", left: -(photoH * 1.7 - 1080) / 2, top: -photoH * 0.02, width: photoH * 1.7, height: ((photoH * 1.7) / 2048) * 1592 }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 45%, rgba(2,26,16,0.9) 64%, ${green.deep} 80%)` }} />
      </div>
      {/* Al-Owais & falcon in a golden arch */}
      <div style={{ position: "absolute", left: 50, top: archTop, width: archW, height: archH, borderRadius: `${archW / 2}px ${archW / 2}px 26px 26px`, padding: 8, background: `linear-gradient(180deg, ${gold.light}, ${gold.mid} 50%, ${gold.deep})`, boxShadow: "0 24px 60px rgba(0,0,0,0.6)", transform: `translateY(${(1 - s(10)) * 400}px)`, opacity: s(10) }}>
        <div style={{ width: "100%", height: "100%", borderRadius: `${archW / 2 - 8}px ${archW / 2 - 8}px 20px 20px`, overflow: "hidden" }}>
          <Img src={OWAIS} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "66% 40%" }} />
        </div>
      </div>
      {/* text column */}
      <div dir="rtl" style={{ position: "absolute", top: textTop, right: 50, width: 1080 - archW - 130, textAlign: "center" }}>
        <div style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: tall ? 104 : 92, lineHeight: 1.2, color: "#fff", textShadow: `0 0 30px ${green.light}`, opacity: s(18), transform: `scale(${0.7 + 0.3 * s(18)})` }}>هذا الأخضر</div>
        <div style={{ marginTop: 8, transform: `scale(${s(28)})` }}>
          <Stamp p={animate ? spring({ frame: frame - 28, fps: 30, config: { damping: 9, stiffness: 200 } }) : 1} size={tall ? 92 : 80} />
        </div>
        {tall ? (
          <div style={{ marginTop: 46, display: "flex", justifyContent: "center", opacity: s(40) }}>
            <SaduBand width={480} opacity={0.75} />
          </div>
        ) : null}
        <div style={{ marginTop: tall ? 30 : 18, opacity: s(46), transform: `translateY(${(1 - s(46)) * 40}px)` }}>
          <div style={{ fontFamily: fonts.ar, fontWeight: 800, fontSize: tall ? 66 : 56, color: "#fff", lineHeight: 1.3 }}>جهّزوا</div>
          <GoldText size={tall ? 100 : 88} style={{ whiteSpace: "nowrap" }}>كاس الذهب</GoldText>
        </div>
        <div style={{ marginTop: tall ? 20 : 4, display: "flex", justifyContent: "center", transform: `scale(${s(56)})` }}>
          <Trophy size={tall ? 150 : 100} shine={animate ? ((frame % 60) / 60) * 1.4 - 0.2 : 0.5} />
        </div>
      </div>
      <div style={{ position: "absolute", bottom: tall ? 70 : 34, left: 0, right: 0, textAlign: "center", fontFamily: fonts.en, fontWeight: 800, fontSize: tall ? 30 : 24, letterSpacing: 10, color: gold.mid, opacity: s(60) }}>
        GULF CUP CHAMPIONS · أبطال الخليج
      </div>
      <GoldConfetti t={animate ? frame - 20 : 60} seed="final" count={animate ? 90 : 70} h={height} avoid={animate ? undefined : { x0: 150, x1: 930, y0: 60, y1: photoH * 0.75 }} />
    </AbsoluteFill>
  );
};

const Final: React.FC = () => {
  const frame = useCurrentFrame();
  return <FinalLayout height={1920} frame={frame} />;
};

export const GulfCupVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const out = interpolate(frame, [T.duration - 12, T.duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: green.deep, overflow: "hidden", opacity: out }}>
      <Sequence from={0} durationInFrames={T.team}>
        <OwaisScene />
      </Sequence>
      <Sequence from={T.team} durationInFrames={T.trophy - T.team}>
        <TeamScene />
      </Sequence>
      <Sequence from={T.trophy} durationInFrames={T.final - T.trophy}>
        <TrophyScene />
      </Sequence>
      <Sequence from={T.final}>
        <Final />
      </Sequence>
      <CornerLogo />
      {[T.stamp, T.team, T.trophy, T.final].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={10}>
          <Flash duration={8} color={f === T.stamp ? gold.light : "#ffffff"} />
        </Sequence>
      ))}
      <Grain />
      <Audio src={staticFile("gulf-music.wav")} />
    </AbsoluteFill>
  );
};

export const GulfCupPoster: React.FC = () => {
  useFonts();
  const { height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: green.deep, overflow: "hidden" }}>
      <FinalLayout height={height} frame={0} animate={false} />
      <CornerLogo width={height > 1500 ? 210 : 180} />
    </AbsoluteFill>
  );
};

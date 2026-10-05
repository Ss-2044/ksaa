import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { CornerLogo, Line, P, PaperBg, PaperEnd, clamp } from "./kit";
import TL from "./timelines.json";

// «المغناطيس»: shouting ads push people away; useful content pulls them in.
const T = TL.magnet;
const N = 70;
const MEGA = { x: 170, y: 1120 };
const MAG = { x: 540, y: 1180 };
const SHOUTS = ["اشترِ!", "خصم!!", "الآن!", "عرض!", "لا تفوتك!"];

const people = new Array(N).fill(0).map((_, i) => {
  const x = 380 + random(`px${i}`) * 600;
  const y = 640 + random(`py${i}`) * 1000;
  const dx = x - MEGA.x;
  const dy = y - MEGA.y;
  const d = Math.hypot(dx, dy);
  const ring = 230 + (i % 4) * 62;
  const ang = i * 2.39996; // golden angle spread
  return { x, y, ux: dx / d, uy: dy / d, tx: MAG.x + Math.cos(ang) * ring, ty: MAG.y - 40 + Math.sin(ang) * ring * 0.9 };
});

const pushAt = (frame: number) => T.blasts.reduce((acc, b) => acc + 170 * interpolate(frame, [b, b + 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }), 0);

const Person: React.FC<{ x: number; y: number; color: string; s?: number }> = ({ x, y, color, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy={-22} r={11} fill={color} />
    <path d="M -15 12 Q -15 -6 0 -6 Q 15 -6 15 12 Z" fill={color} />
  </g>
);

const Megaphone: React.FC<{ kick: number }> = ({ kick }) => (
  <g transform={`translate(${MEGA.x} ${MEGA.y}) rotate(-8) translate(${-kick * 14} 0)`}>
    <path d="M -60 -40 L 60 -110 L 60 110 L -60 40 Z" fill="#e0262f" stroke={P.ink} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-110} y={-40} width={50} height={80} rx={10} fill={P.white} stroke={P.ink} strokeWidth={8} />
    <path d="M -90 40 L -100 110 L -70 110 L -66 40" fill={P.white} stroke={P.ink} strokeWidth={8} strokeLinejoin="round" />
  </g>
);

const Magnet: React.FC = () => (
  <g>
    <path d="M -150 -170 L -150 40 A 150 150 0 0 0 150 40 L 150 -170 L 70 -170 L 70 40 A 70 70 0 0 1 -70 40 L -70 -170 Z" fill={P.blue} stroke={P.ink} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-150} y={-230} width={80} height={60} fill={P.white} stroke={P.ink} strokeWidth={8} />
    <rect x={70} y={-230} width={80} height={60} fill={P.white} stroke={P.ink} strokeWidth={8} />
  </g>
);

export const MagnetVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const push = pushAt(frame);
  const dropP = interpolate(frame, [T.drop, T.drop + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const magIn = spring({ frame: frame - T.magnet, fps, config: { damping: 10, stiffness: 140 } });
  const lastBlast = [...T.blasts].reverse().find((b) => frame >= b);
  const kick = lastBlast !== undefined ? Math.max(0, 1 - (frame - lastBlast) / 6) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg />
      <Sequence from={0} durationInFrames={T.blasts[2]} layout="none">
        <Line ar="تصرخ في وجه الناس؟" en="Shouting at people?" top={150} from={4} hl={1} size={92} hlColor="#e0262f" />
      </Sequence>
      <Sequence from={T.blasts[2]} durationInFrames={T.magnet - T.blasts[2]} layout="none">
        <Line ar="…يهربون." en="…they run." top={150} from={2} hl={0} size={92} hlColor="#e0262f" />
      </Sequence>
      <Sequence from={T.magnet} durationInFrames={T.line - T.magnet} layout="none">
        <Line ar="خلّهم هم يجونك." en="Make them come to you." top={150} from={6} hl={2} size={92} />
      </Sequence>
      <Sequence from={T.line} durationInFrames={T.end - T.line} layout="none">
        <Line ar="التسويق الصح يجذب… ما يطارد." en="Good marketing attracts. It doesn't chase." top={150} from={2} hl={2} size={84} />
      </Sequence>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* megaphone + its shouts */}
        {frame < T.drop + 16 ? (
          <g transform={`translate(0 ${dropP * 900}) rotate(${dropP * 40} ${MEGA.x} ${MEGA.y})`}>
            <Megaphone kick={kick} />
            {T.blasts.map((b, i) => {
              const t = frame - b;
              if (t < 0 || t > 26) return null;
              return (
                <g key={b}>
                  {[0, 1, 2].map((r) => (
                    <path key={r} d={`M ${MEGA.x + 80 + t * 9 + r * 40} ${MEGA.y - 110 - r * 30} Q ${MEGA.x + 130 + t * 9 + r * 50} ${MEGA.y} ${MEGA.x + 80 + t * 9 + r * 40} ${MEGA.y + 110 + r * 30}`} fill="none" stroke="#e0262f" strokeWidth={8 - r * 2} opacity={1 - t / 26} strokeLinecap="round" />
                  ))}
                  <text x={MEGA.x + 160 + t * 6} y={MEGA.y - 180 - (i % 2) * 60} fontFamily={fonts.punch} fontSize={90} fill="#e0262f" opacity={1 - t / 26} transform={`rotate(${i % 2 ? 6 : -8} ${MEGA.x + 200} ${MEGA.y - 200})`}>
                    {SHOUTS[i]}
                  </text>
                </g>
              );
            })}
          </g>
        ) : null}
        {/* field lines */}
        {frame >= T.magnet
          ? [0, 1, 2].map((i) => {
              const k = interpolate(frame, [T.magnet + 10 + i * 6, T.magnet + 30 + i * 6], [0, 1], clamp);
              const w = 190 + i * 110;
              return <path key={i} d={`M ${MAG.x - 110} ${MAG.y - 230} C ${MAG.x - w} ${MAG.y - 330 - i * 80}, ${MAG.x + w} ${MAG.y - 330 - i * 80}, ${MAG.x + 110} ${MAG.y - 230}`} fill="none" stroke={P.blue} strokeWidth={4} strokeDasharray="3 14" strokeLinecap="round" opacity={k * 0.8} />;
            })
          : null}
        {/* people */}
        {people.map((p, i) => {
          let x = p.x + p.ux * push;
          let y = p.y + p.uy * push;
          let color = P.ink;
          const g0 = T.gather[0] + (i % 35) * 3;
          const gk = interpolate(frame, [g0, g0 + 45], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
          if (gk > 0) {
            x = x + (p.tx - x) * gk + Math.sin(frame / 8 + i) * 4 * gk;
            y = y + (p.ty - y) * gk + Math.cos(frame / 9 + i) * 4 * gk;
            if (gk >= 1) color = P.blue;
          }
          const fleeing = frame >= T.blasts[0] && frame < T.blasts[4] + 16;
          return <Person key={i} x={x} y={y} color={color} s={fleeing ? 0.95 : 1} />;
        })}
        {/* magnet */}
        {frame >= T.magnet ? (
          <g transform={`translate(${MAG.x} ${MAG.y + (1 - magIn) * 900}) rotate(${Math.sin(frame / 10) * 2 * magIn})`}>
            <Magnet />
          </g>
        ) : null}
      </svg>
      {frame >= T.magnet + 20 && frame < T.end ? (
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: MAG.y + 140, display: "flex", justifyContent: "center", opacity: interpolate(frame, [T.magnet + 20, T.magnet + 34], [0, 1], clamp) }}>
          <span style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 48, color: P.paper, background: P.ink, padding: "8px 30px", borderRadius: 40 }}>محتوى يفيد</span>
        </div>
      ) : null}
      <Sequence from={T.end}>
        <AbsoluteFill style={{ backgroundColor: P.paper }}>
          <PaperBg />
          <PaperEnd line="محتوى يجذب جمهورك." en="Content that pulls your audience in." hl={1} />
        </AbsoluteFill>
      </Sequence>
      {frame < T.end ? <CornerLogo /> : null}
      <Audio src={staticFile("magnet-music.wav")} />
    </AbsoluteFill>
  );
};

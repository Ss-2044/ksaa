import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { CornerLogo, Line, P, PaperBg, PaperEnd, clamp } from "./kit";
import TL from "./timelines.json";

// «الختم»: one stamp prints the same identity on a card, cup, bag, phone and billboard.
const T = TL.stamp;
const CY = 1060;
const o = { fill: P.white, stroke: P.ink, strokeWidth: 8, strokeLinejoin: "round" as const };

// item outline + where the mark lands on it (relative to item centre) + mark size
const ITEMS: { ar: string; en: string; mark: [number, number, number]; draw: React.ReactNode }[] = [
  { ar: "كرت العمل", en: "BUSINESS CARD", mark: [-150, 0, 120], draw: <><rect x={-300} y={-170} width={600} height={340} rx={20} {...o} /><path d="M -40 -40 L 220 -40 M -40 10 L 160 10 M -40 60 L 190 60" stroke={P.muted} strokeWidth={14} strokeLinecap="round" /></> },
  { ar: "الكوب", en: "CUP", mark: [0, 40, 130], draw: <><path d="M -170 -230 L 170 -230 L 140 250 L -140 250 Z" {...o} /><rect x={-195} y={-270} width={390} height={50} rx={12} {...o} /><path d="M -155 -60 L 155 -60 L 147 130 L -147 130 Z" fill="none" stroke={P.ink} strokeWidth={6} /></> },
  { ar: "الكيس", en: "BAG", mark: [0, 60, 150], draw: <><path d="M -100 -170 C -100 -300, 100 -300, 100 -170" fill="none" stroke={P.ink} strokeWidth={10} /><path d="M -220 -170 L 220 -170 L 250 300 L -250 300 Z" {...o} /></> },
  { ar: "الجوال", en: "PHONE", mark: [0, -20, 140], draw: <><rect x={-170} y={-330} width={340} height={660} rx={46} {...o} /><rect x={-145} y={-290} width={290} height={560} rx={20} fill={P.paper} stroke={P.ink} strokeWidth={4} /><rect x={-50} y={-316} width={100} height={14} rx={7} fill={P.ink} /></> },
  { ar: "اللوحة", en: "BILLBOARD", mark: [0, -60, 150], draw: <><rect x={-380} y={-250} width={760} height={380} {...o} /><path d="M -220 130 L -220 330 M 220 130 L 220 330 M -300 330 L 300 330" stroke={P.ink} strokeWidth={14} strokeLinecap="round" /></> },
];

const Mark: React.FC<{ size: number; p?: number }> = ({ size, p = 1 }) => (
  <g opacity={0.95 * p}>
    <circle r={size / 2} fill={P.blue} />
    <circle r={size / 2 - 10} fill="none" stroke={P.paper} strokeWidth={4} strokeDasharray="2 10" />
    <text y={size * 0.09} textAnchor="middle" fontFamily={fonts.display} fontWeight={900} fontSize={size * 0.24} fill={P.paper}>شعارك</text>
  </g>
);

// rubber stamp: handle + base, drawn with its printing face at (0,0)
const Stamp: React.FC = () => (
  <g>
    <rect x={-120} y={-60} width={240} height={60} rx={8} fill={P.blue} stroke={P.ink} strokeWidth={6} />
    <rect x={-100} y={-120} width={200} height={60} rx={6} fill="#c98a4b" stroke={P.ink} strokeWidth={6} />
    <path d="M -36 -120 L -46 -260 L 46 -260 L 36 -120 Z" fill="#c98a4b" stroke={P.ink} strokeWidth={6} />
    <ellipse cx={0} cy={-290} rx={80} ry={50} fill="#c98a4b" stroke={P.ink} strokeWidth={6} />
  </g>
);

const stampY = (frame: number, slam: number, targetY: number) => {
  const down = interpolate(frame, [slam - 8, slam], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const up = interpolate(frame, [slam + 5, slam + 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return targetY - 1500 * (1 - down) - 1300 * up;
};

export const StampVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = Math.floor((frame - T.items) / T.each);
  const active = frame >= T.items && k >= 0 && k < ITEMS.length;
  const local = frame - (T.items + k * T.each);
  const slamAt = T.items + k * T.each + T.slam;
  const slamming = [...ITEMS.map((_, i) => T.items + i * T.each + T.slam), T.logo].find((f) => frame >= f && frame < f + 7);
  const shake = slamming !== undefined ? (random(`s${frame}`) - 0.5) * 22 * (1 - (frame - slamming) / 7) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg />
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        <Sequence from={0} durationInFrames={T.all} layout="none">
          <Line ar="وين ما شافك عميلك…" en="Wherever your customer sees you…" top={150} from={6} hl={3} size={96} />
        </Sequence>
        <Sequence from={T.all} durationInFrames={T.logo - T.all} layout="none">
          <Line ar="…لازم يعرف إنك أنت." en="…they should know it's you." top={150} from={4} hl={3} size={96} />
        </Sequence>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {active
            ? (() => {
                const it = ITEMS[k];
                const enter = interpolate(local, [0, 14], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
                const exit = interpolate(local, [T.each - 12, T.each], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
                const x = 540 + enter * 1100 - exit * 1100;
                const printed = frame >= slamAt;
                const [mx, my, ms] = it.mark;
                return (
                  <g transform={`translate(${x} ${CY})`}>
                    {it.draw}
                    {printed ? (
                      <g transform={`translate(${mx} ${my})`}>
                        <Mark size={ms} />
                        {/* ink splats */}
                        {frame < slamAt + 10
                          ? new Array(10).fill(0).map((_, i) => {
                              const a = (i / 10) * Math.PI * 2;
                              const d = ms * 0.6 + (frame - slamAt) * 6;
                              return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={6} fill={P.blue} opacity={1 - (frame - slamAt) / 10} />;
                            })
                          : null}
                      </g>
                    ) : null}
                    <text x={0} y={420} textAnchor="middle" fontFamily={fonts.display} fontWeight={900} fontSize={60} fill={P.ink}>{it.ar}</text>
                    <text x={0} y={470} textAnchor="middle" fontFamily={fonts.en} fontWeight={800} fontSize={24} letterSpacing={6} fill={P.muted}>{it.en}</text>
                    {/* counter */}
                    <text x={0} y={-430} textAnchor="middle" fontFamily={fonts.mono} fontSize={28} fill={P.muted}>{`0${k + 1} / 05`}</text>
                    {/* the stamp */}
                    <g transform={`translate(${mx} ${stampY(frame, slamAt, my)})`}>
                      <Stamp />
                    </g>
                  </g>
                );
              })()
            : null}
          {/* all items together, same mark everywhere */}
          {frame >= T.all && frame < T.logo + 4
            ? ITEMS.map((it, i) => {
                const pos = [[300, 640], [780, 640], [300, 1080], [780, 1080], [540, 1480]][i];
                const p = spring({ frame: frame - T.all - i * 5, fps, config: { damping: 12 } });
                const out = interpolate(frame, [T.logo - 10, T.logo], [1, 0], clamp);
                const [mx, my, ms] = it.mark;
                return (
                  <g key={i} transform={`translate(${pos[0]} ${pos[1]}) scale(${0.42 * p * out})`}>
                    {it.draw}
                    <g transform={`translate(${mx} ${my})`}>
                      <Mark size={ms} />
                    </g>
                  </g>
                );
              })
            : null}
          {/* final stamp on the paper */}
          {frame >= T.logo - 10 && frame < T.logo ? (
            <g transform={`translate(540 ${stampY(frame, T.logo, 800)})`}>
              <Stamp />
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>
      <Sequence from={T.logo}>
        <AbsoluteFill style={{ backgroundColor: frame < T.end ? "transparent" : P.paper }}>
          {frame >= T.end ? <PaperBg /> : null}
          <PaperEnd line="نبني لك هوية تنطبع." en="An identity that leaves a mark." hl={3} instant />
        </AbsoluteFill>
      </Sequence>
      {frame >= T.logo && frame < T.end ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(540 ${stampY(frame, T.logo, 800)})`}>
            <Stamp />
          </g>
        </svg>
      ) : null}
      {frame < T.logo ? <CornerLogo /> : null}
      <Audio src={staticFile("stamp-music.wav")} />
    </AbsoluteFill>
  );
};

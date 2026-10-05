import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { CornerLogo, Line, P, PaperBg, PaperEnd, clamp } from "./kit";
import TL from "./timelines.json";

// «الأحجية»: brand pieces scattered and mismatched snap into one complete brand.
const T = TL.puzzle;
const S = 300; // piece size
const GRID = { x: 540 - S * 1.5, y: 760 }; // 3 x 2 board
const PIECES = [
  { ar: "الشعار", en: "LOGO", style: { bg: P.ink, fg: P.paper } },
  { ar: "الألوان", en: "COLOURS", style: { bg: "#ffd400", fg: P.ink } },
  { ar: "الصوت", en: "VOICE", style: { bg: P.white, fg: P.ink } },
  { ar: "المحتوى", en: "CONTENT", style: { bg: "#e0262f", fg: P.white } },
  { ar: "الإعلان", en: "ADS", style: { bg: "#1aa34a", fg: P.white } },
  { ar: "التجربة", en: "EXPERIENCE", style: { bg: "#7a2fd0", fg: P.white } },
];
const ORDER = [2, 0, 4, 1, 5, 3]; // order they get placed

// a jigsaw-ish outline: square with a tab on the right and a slot on top, as one path
const shape = (col: number, row: number) => {
  const tabR = col < 2; // tab to the right neighbour
  const tabB = row < 1;
  const slotL = col > 0;
  const slotT = row > 0;
  const k = S;
  const t = 44;
  let d = `M 0 0`;
  d += slotT ? ` L ${k / 2 - t} 0 A ${t} ${t} 0 0 0 ${k / 2 + t} 0 L ${k} 0` : ` L ${k} 0`;
  d += tabR ? ` L ${k} ${k / 2 - t} A ${t} ${t} 0 1 1 ${k} ${k / 2 + t} L ${k} ${k}` : ` L ${k} ${k}`;
  d += tabB ? ` L ${k / 2 + t} ${k} A ${t} ${t} 0 1 1 ${k / 2 - t} ${k} L 0 ${k}` : ` L 0 ${k}`;
  d += slotL ? ` L 0 ${k / 2 + t} A ${t} ${t} 0 0 0 0 ${k / 2 - t} Z` : ` Z`;
  return d;
};

export const PuzzleVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const done = frame >= T.done;
  const unify = interpolate(frame, [T.done, T.done + 20], [0, 1], clamp);
  const word = spring({ frame: frame - T.word, fps, config: { damping: 12 } });
  const glow = done ? 0.5 + 0.5 * Math.sin((frame - T.done) / 6) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg />
      <Sequence from={0} durationInFrames={T.place} layout="none">
        <Line ar="علامتك قطع متفرقة؟" en="Is your brand in pieces?" top={150} from={4} hl={1} size={92} />
      </Sequence>
      <Sequence from={T.place} durationInFrames={T.done - T.place} layout="none">
        <Line ar="قطعة… قطعة…" en="Piece by piece…" top={150} from={2} size={92} />
      </Sequence>
      <Sequence from={T.done} durationInFrames={T.end - T.done} layout="none">
        <Line ar="لما تتركب صح… تصير علامة." en="Put together right, it becomes a brand." top={150} from={4} hl={3} size={84} />
      </Sequence>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* the board outline */}
        <rect x={GRID.x} y={GRID.y} width={S * 3} height={S * 2} fill="none" stroke={P.ink} strokeWidth={4} strokeDasharray="6 14" opacity={interpolate(frame, [T.scatter, T.scatter + 20], [0, 0.5], clamp) * (1 - unify)} />
        {done ? <rect x={GRID.x - 14} y={GRID.y - 14} width={S * 3 + 28} height={S * 2 + 28} rx={10} fill="none" stroke={P.blue} strokeWidth={10} opacity={0.35 + glow * 0.4} /> : null}
        {PIECES.map((pc, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const homeX = GRID.x + col * S;
          const homeY = GRID.y + row * S;
          // scattered start
          const sx = 60 + random(`x${i}`) * 700;
          const sy = (row ? 1250 : 380) + random(`y${i}`) * 260 + (row ? 0 : 0);
          const rot0 = (random(`r${i}`) - 0.5) * 50;
          const appear = spring({ frame: frame - T.scatter - i * 6, fps, config: { damping: 11 } });
          const slot = ORDER.indexOf(i);
          const ps = T.place + slot * T.each;
          const k = interpolate(frame, [ps, ps + 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
          const snap = frame >= ps + 18 && frame < ps + 24 ? 1.04 : 1;
          const x = sx + (homeX - sx) * k;
          const y = sy + (homeY - sy) * k;
          const rot = rot0 * (1 - k) + Math.sin(frame / 14 + i) * 3 * (1 - k);
          const bg = unify > 0 ? P.blue : pc.style.bg;
          const fg = unify > 0 ? P.paper : pc.style.fg;
          return (
            <g key={i} transform={`translate(${x + S / 2} ${y + S / 2}) rotate(${rot}) scale(${appear * snap}) translate(${-S / 2} ${-S / 2})`}>
              <path d={shape(col, row)} fill={bg} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
              <g opacity={1 - interpolate(frame, [T.word - 10, T.word], [0, 1], clamp)}>
                <text x={S / 2} y={S / 2 + 10} textAnchor="middle" fontFamily={fonts.display} fontWeight={900} fontSize={58} fill={fg}>{pc.ar}</text>
                <text x={S / 2} y={S / 2 + 56} textAnchor="middle" fontFamily={fonts.en} fontWeight={800} fontSize={20} letterSpacing={4} fill={fg} opacity={0.75}>{pc.en}</text>
              </g>
            </g>
          );
        })}
      </svg>
      {/* the assembled brand */}
      {frame >= T.word - 4 && frame < T.end ? (
        <div dir="rtl" style={{ position: "absolute", left: GRID.x, top: GRID.y, width: S * 3, height: S * 2, display: "flex", alignItems: "center", justifyContent: "center", opacity: word, transform: `scale(${0.7 + 0.3 * word})` }}>
          <span style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 210, color: P.paper }}>علامتك.</span>
        </div>
      ) : null}
      <Sequence from={T.end}>
        <AbsoluteFill style={{ backgroundColor: P.paper }}>
          <PaperBg />
          <PaperEnd line="نركّب علامتك صح." en="We put your brand together." hl={1} />
        </AbsoluteFill>
      </Sequence>
      {frame < T.end ? <CornerLogo /> : null}
      <Audio src={staticFile("puzzle-music.wav")} />
    </AbsoluteFill>
  );
};

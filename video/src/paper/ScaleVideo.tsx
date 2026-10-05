import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { CornerLogo, Line, P, PaperBg, PaperEnd, clamp } from "./kit";
import TL from "./timelines.json";

// «الميزان»: a huge budget on one pan, a smart idea on the other — the idea wins.
const T = TL.scale;
const PIV = { x: 540, y: 820 };
const ARM = 360;
const CHAIN = 300;

const Bag: React.FC = () => (
  <g>
    <path d="M -110 -20 C -150 -140, -60 -200, -40 -220 L 40 -220 C 60 -200, 150 -140, 110 -20 Q 120 30, 0 30 Q -120 30, -110 -20 Z" fill="#c9a227" stroke={P.ink} strokeWidth={7} />
    <path d="M -50 -220 L 50 -220 L 30 -250 L -30 -250 Z" fill="#c9a227" stroke={P.ink} strokeWidth={7} />
    <text x={0} y={-80} textAnchor="middle" fontFamily={fonts.display} fontWeight={900} fontSize={46} fill={P.ink}>ميزانية</text>
    <text x={0} y={-30} textAnchor="middle" fontFamily={fonts.display} fontWeight={900} fontSize={46} fill={P.ink}>ضخمة</text>
  </g>
);

const Bulb: React.FC<{ glow: number }> = ({ glow }) => (
  <g>
    {glow > 0 ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d="M 0 -150 L 0 -185" stroke={P.blue} strokeWidth={8} strokeLinecap="round" opacity={glow} transform={`rotate(${i * 45} 0 -90)`} />) : null}
    <path d="M 0 -160 C -55 -160, -75 -120, -70 -95 C -65 -65, -40 -55, -38 -30 L 38 -30 C 40 -55, 65 -65, 70 -95 C 75 -120, 55 -160, 0 -160 Z" fill={glow > 0 ? "#ffe58a" : P.white} stroke={P.ink} strokeWidth={7} />
    <path d="M -34 -16 L 34 -16 M -28 0 L 28 0" stroke={P.ink} strokeWidth={7} strokeLinecap="round" />
  </g>
);

const Pan: React.FC<{ x: number; y: number; children?: React.ReactNode }> = ({ x, y, children }) => (
  <g>
    <path d={`M ${x} ${y} L ${x - 130} ${y + CHAIN} M ${x} ${y} L ${x + 130} ${y + CHAIN}`} stroke={P.ink} strokeWidth={4} strokeDasharray="10 6" />
    <g transform={`translate(${x} ${y + CHAIN})`}>
      {children}
      <path d="M -170 0 Q 0 90, 170 0 Z" fill={P.white} stroke={P.ink} strokeWidth={7} strokeLinejoin="round" />
    </g>
  </g>
);

export const ScaleVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bagDrop = spring({ frame: frame - T.budget, fps, config: { damping: 14, stiffness: 120 } });
  const bulbDrop = spring({ frame: frame - T.idea, fps, config: { damping: 14, stiffness: 110 } });
  const tilt1 = spring({ frame: frame - T.budget - 12, fps, config: { damping: 6, stiffness: 90 } });
  const tilt2 = spring({ frame: frame - T.ideaLand, fps, config: { damping: 6, stiffness: 70 } });
  const angle = -20 * tilt1 + 36 * tilt2; // degrees, positive = right side down
  const a = (angle * Math.PI) / 180;
  const L = { x: PIV.x - Math.cos(a) * ARM, y: PIV.y - Math.sin(a) * ARM };
  const R = { x: PIV.x + Math.cos(a) * ARM, y: PIV.y + Math.sin(a) * ARM };
  const glow = interpolate(frame, [T.ideaLand + 10, T.ideaLand + 25], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg />
      <Sequence from={0} durationInFrames={T.idea} layout="none">
        <Line ar="تحسب التسويق يبي ميزانية ضخمة؟" en="Think marketing needs a huge budget?" top={150} from={4} hl={3} size={84} />
      </Sequence>
      <Sequence from={T.idea} durationInFrames={T.line - T.idea} layout="none">
        <Line ar="حط قدامها فكرة صح…" en="Put the right idea against it…" top={150} from={4} hl={3} size={88} />
      </Sequence>
      <Sequence from={T.line} durationInFrames={T.end - T.line} layout="none">
        <Line ar="…الفكرة أثقل." en="…the idea weighs more." top={150} from={2} hl={0} size={96} />
      </Sequence>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* stand */}
        <path d={`M ${PIV.x} ${PIV.y} L ${PIV.x} 1620 M ${PIV.x - 200} 1640 L ${PIV.x + 200} 1640`} stroke={P.ink} strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${PIV.x - 120} 1640 L ${PIV.x} 1560 L ${PIV.x + 120} 1640 Z`} fill={P.ink} />
        {/* beam */}
        <path d={`M ${L.x} ${L.y} L ${R.x} ${R.y}`} stroke={P.ink} strokeWidth={16} strokeLinecap="round" />
        <circle cx={PIV.x} cy={PIV.y} r={22} fill={P.blue} stroke={P.ink} strokeWidth={6} />
        <path d={`M ${PIV.x} ${PIV.y - 20} L ${PIV.x - 18} ${PIV.y - 70} L ${PIV.x + 18} ${PIV.y - 70} Z`} fill={P.ink} transform={`rotate(${angle} ${PIV.x} ${PIV.y})`} />
        <Pan x={L.x} y={L.y}>
          {frame >= T.budget ? (
            <g transform={`translate(0 ${-10 - (1 - bagDrop) * 1200})`}>
              <Bag />
            </g>
          ) : null}
        </Pan>
        <Pan x={R.x} y={R.y}>
          {frame >= T.idea ? (
            <g transform={`translate(0 ${-6 - (1 - bulbDrop) * 1200}) scale(1.1)`}>
              <Bulb glow={glow} />
            </g>
          ) : null}
        </Pan>
        {frame >= T.idea + 10 && frame < T.line + 40 ? (
          <text x={R.x} y={R.y + CHAIN + 120} textAnchor="middle" fontFamily={fonts.display} fontWeight={900} fontSize={50} fill={P.blue} opacity={interpolate(frame, [T.idea + 10, T.idea + 24], [0, 1], clamp)}>فكرة ذكية</text>
        ) : null}
      </svg>
      <Sequence from={T.end}>
        <AbsoluteFill style={{ backgroundColor: P.paper }}>
          <PaperBg />
          <PaperEnd line="أفكار تشتغل… على قد ميزانيتك." en="Ideas that work, on your budget." hl={1} />
        </AbsoluteFill>
      </Sequence>
      {frame < T.end ? <CornerLogo /> : null}
      <Audio src={staticFile("scale-music.wav")} />
    </AbsoluteFill>
  );
};

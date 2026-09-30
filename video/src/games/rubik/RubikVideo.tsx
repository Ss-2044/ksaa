import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../../components/useFonts";
import { Grain } from "../../components/Grain";
import { Flash } from "../../components/Flash";
import { Logo } from "../../components/Logo";
import { LuxTitle } from "../../chess/LuxTitle";
import { colors } from "../../theme";
import { BrandOutro } from "../BrandOutro";
import { Cubie, M3, Move, applyMove, inLayer, invert, matrix3d, mul, rotation, solved } from "./cube";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const S = 150; // cubie size
const LOGO_RATIO = 765 / 1041;

export const services = [
  { en: "STRATEGY", ar: "الاستراتيجية" },
  { en: "BRANDING", ar: "الهوية" },
  { en: "CONTENT", ar: "المحتوى" },
  { en: "CAMPAIGNS", ar: "الحملات" },
  { en: "GROWTH", ar: "النمو" },
];

const SCRAMBLE: Move[] = [
  { axis: "x", layer: 1, dir: 1 },
  { axis: "y", layer: -1, dir: 1 },
  { axis: "z", layer: 1, dir: -1 },
  { axis: "x", layer: -1, dir: -1 },
  { axis: "y", layer: 1, dir: 1 },
];
const CHAOS: Move[] = [
  { axis: "z", layer: 1, dir: 1 },
  { axis: "x", layer: 0, dir: 1 },
  { axis: "y", layer: 1, dir: -1 },
  { axis: "x", layer: 1, dir: 1 },
];
const START = SCRAMBLE.reduce(applyMove, solved());

// Every animated move with its start frame and duration: a flurry (that undoes itself), then the five solving twists.
const { chaos, solve } = timeline;
const timed: { m: Move; start: number; dur: number }[] = [
  ...[...CHAOS, ...invert(CHAOS)].map((m, i) => ({ m, start: chaos.movesFrom + i * chaos.each, dur: chaos.each - 1 })),
  ...invert(SCRAMBLE).map((m, i) => ({ m, start: solve.from + i * solve.each, dur: solve.turn })),
];

// sticker colour by the face the sticker started on
const FACE = {
  front: colors.royal,
  right: "#F4F5FA",
  top: colors.accent,
  left: "#8A90A8",
  bottom: "#1F2B6B",
  back: "#C9D2FF",
};

// The front stickers share one logo image, each showing its own ninth of it.
const logoSlice = (col: number, row: number): React.CSSProperties => {
  const w = S * 3 * 0.8;
  const h = w * LOGO_RATIO;
  const offX = (S * 3 - w) / 2;
  const offY = (S * 3 - h) / 2;
  return {
    backgroundImage: `url(${staticFile("neocapta-logo-white.png")})`,
    backgroundSize: `${w}px ${h}px`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: `${offX - col * S - 7}px ${offY - row * S - 7}px`,
  };
};

const Sticker: React.FC<{ transform: string; color?: string; logo?: [number, number] }> = ({ transform, color, logo }) => (
  <div style={{ position: "absolute", width: S, height: S, transform, backfaceVisibility: "hidden", background: "#07080c", padding: 7, boxSizing: "border-box" }}>
    {color ? (
      <div style={{ width: "100%", height: "100%", borderRadius: 16, backgroundColor: color, boxShadow: "inset 0 0 18px rgba(255,255,255,0.25)", ...(logo ? logoSlice(logo[0], logo[1]) : {}) }} />
    ) : null}
  </div>
);

const CubieView: React.FC<{ c: Cubie; extra?: M3 }> = ({ c, extra }) => {
  const r = extra ? mul(extra, c.rot) : c.rot;
  const t0 = c.pos.map((v) => v * S);
  const t = extra ? extra.map((row) => row[0] * t0[0] + row[1] * t0[1] + row[2] * t0[2]) : t0;
  const [hx, hy, hz] = c.home;
  const h = S / 2;
  return (
    <div style={{ position: "absolute", left: -h, top: -h, width: S, height: S, transformStyle: "preserve-3d", transform: matrix3d(r, t) }}>
      <Sticker transform={`translateZ(${h}px)`} color={hz === 1 ? FACE.front : undefined} logo={hz === 1 ? [hx + 1, hy + 1] : undefined} />
      <Sticker transform={`rotateY(180deg) translateZ(${h}px)`} color={hz === -1 ? FACE.back : undefined} />
      <Sticker transform={`rotateY(90deg) translateZ(${h}px)`} color={hx === 1 ? FACE.right : undefined} />
      <Sticker transform={`rotateY(-90deg) translateZ(${h}px)`} color={hx === -1 ? FACE.left : undefined} />
      <Sticker transform={`rotateX(90deg) translateZ(${h}px)`} color={hy === -1 ? FACE.top : undefined} />
      <Sticker transform={`rotateX(-90deg) translateZ(${h}px)`} color={hy === 1 ? FACE.bottom : undefined} />
    </div>
  );
};

const Cube: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { answer, reveal } = timeline;

  // replay the moves up to this frame
  let cubes = START;
  let current: { m: Move; angle: number } | null = null;
  for (const tm of timed) {
    if (frame >= tm.start + tm.dur) {
      cubes = applyMove(cubes, tm.m);
    } else {
      if (frame >= tm.start) {
        const p = interpolate(frame, [tm.start, tm.start + tm.dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        current = { m: tm.m, angle: 90 * tm.m.dir * p };
      }
      break;
    }
  }
  const extra = current ? rotation(current.m.axis, current.angle) : undefined;

  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
  const face = interpolate(frame, [reveal.from, reveal.face], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const drift = frame < answer.from ? frame * 0.2 : answer.from * 0.2;
  const rx = interpolate(face, [0, 1], [-26 + Math.sin(frame / 40) * 6, 0]);
  const ry = interpolate(face, [0, 1], [-40 + Math.sin(frame / 55) * 14 + drift, 0]);
  const zoom = interpolate(frame, [reveal.face, reveal.to], [1.3, 1.55], clamp);
  const glow = interpolate(frame, [reveal.face, reveal.face + 20], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ perspective: 2200 }}>
      <div style={{ position: "absolute", left: 540 - 420, top: 1200 - 420, width: 840, height: 840, borderRadius: "50%", background: "radial-gradient(circle, rgba(94,120,255,0.5), rgba(0,0,0,0) 65%)", opacity: 0.35 + glow * 0.65 }} />
      <div style={{ position: "absolute", left: 540, top: 1200, width: 0, height: 0, transformStyle: "preserve-3d", transform: `translateY(${(1 - enter) * 1200}px) scale(${zoom}) rotateX(${rx}deg) rotateY(${ry}deg)` }}>
        {cubes.map((c, i) => (
          <CubieView key={i} c={c} extra={current && inLayer(c, current.m) ? extra : undefined} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// "مكعب روبيك / Rubik's Cube" — every twist is a service; once solved, the front face shows the brand.
export const RubikVideo: React.FC = () => {
  useFonts();
  const { intro, chaos: ch, answer, solve: so, reveal, outro } = timeline;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #121a3d 0%, #04050c 70%)", overflow: "hidden" }}>
      <Sequence from={0} durationInFrames={outro.from}>
        <Cube />
      </Sequence>
      <Sequence from={intro.from + 20} durationInFrames={intro.to - intro.from - 20}>
        <AbsoluteFill style={{ paddingTop: 260 }}>
          <LuxTitle kicker="THE CUBE · المكعب" en="Every idea starts scattered." ar="كل فكرة تبدأ مبعثرة." enSize={80} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={ch.from + 4} durationInFrames={ch.to - ch.from - 4}>
        <AbsoluteFill style={{ paddingTop: 250 }}>
          <LuxTitle en="But not every idea finds its order." ar="لكن مو كل فكرة تلقى ترتيبها." enSize={74} arSize={70} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={answer.from + 4} durationInFrames={answer.to - answer.from - 4}>
        <AbsoluteFill style={{ paddingTop: 260 }}>
          <LuxTitle kicker="NEO CAPTA" en="We put every piece in place." ar="نحن نرتّب كل قطعة." enSize={76} />
        </AbsoluteFill>
      </Sequence>
      {services.map((s, k) => (
        <Sequence key={s.en} from={so.from + k * so.each} durationInFrames={so.each}>
          <AbsoluteFill style={{ paddingTop: 260 }}>
            <LuxTitle kicker={`TWIST ${k + 1}`} en={s.en.charAt(0) + s.en.slice(1).toLowerCase()} ar={s.ar} enSize={96} arSize={84} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence from={reveal.face} durationInFrames={outro.from - reveal.face}>
        <AbsoluteFill style={{ paddingTop: 250 }}>
          <LuxTitle en="From chaos… to a brand." ar="من الفوضى… إلى علامة." enSize={80} arSize={84} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <BrandOutro en="Every piece in place." ar="كل قطعة في مكانها" />
      </Sequence>
      <Sequence from={0} durationInFrames={outro.from}>
        <div style={{ position: "absolute", top: 70, right: 60, opacity: 0.85 }}>
          <Logo width={150} />
        </div>
      </Sequence>
      {[reveal.face, outro.from].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={12}>
          <Flash duration={10} />
        </Sequence>
      ))}
      <Grain />
      <Audio src={staticFile("rubik-music.wav")} />
    </AbsoluteFill>
  );
};

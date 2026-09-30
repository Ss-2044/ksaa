import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../../components/useFonts";
import { Grain } from "../../components/Grain";
import { Flash } from "../../components/Flash";
import { Logo } from "../../components/Logo";
import { LuxTitle } from "../../chess/LuxTitle";
import { colors, fonts } from "../../theme";
import { BrandOutro } from "../BrandOutro";
import { Suit } from "../Suits";
import { CardBack, CardFace, CH, CW } from "./Card";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CX = 540;
const CY = 1020;

export const hand: { rank: string; suit: Suit; en: string; ar: string }[] = [
  { rank: "A", suit: "spade", en: "STRATEGY", ar: "الاستراتيجية" },
  { rank: "10", suit: "heart", en: "BRANDING", ar: "الهوية" },
  { rank: "K", suit: "diamond", en: "CONTENT", ar: "المحتوى" },
  { rank: "Q", suit: "club", en: "CAMPAIGNS", ar: "الحملات" },
  { rank: "J", suit: "spade", en: "GROWTH", ar: "النمو" },
];
const OPP = [
  { from: { x: -300, y: CY }, to: { x: CX - 170, y: CY - 10 }, rot: -12 },
  { from: { x: CX, y: -400 }, to: { x: CX, y: CY - 170 }, rot: 6 },
  { from: { x: 1380, y: CY }, to: { x: CX + 170, y: CY + 6 }, rot: 14 },
];
const OPP_FACES: { rank: string; suit: Suit }[] = [
  { rank: "9", suit: "heart" },
  { rank: "8", suit: "club" },
  { rank: "7", suit: "diamond" },
];

const Placed: React.FC<{ x: number; y: number; rot: number; scale?: number; flip?: number; children: React.ReactNode; back?: React.ReactNode; opacity?: number }> = ({ x, y, rot, scale = 1, flip = 0, children, back, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x - CW / 2, top: y - CH / 2, width: CW, height: CH, transform: `rotate(${rot}deg) scale(${scale}) rotateY(${flip * 180}deg)`, transformStyle: "preserve-3d", opacity }}>
    <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>{children}</div>
    {back ? <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>{back}</div> : null}
  </div>
);

// Fan position of card i when `left` cards remain in hand.
const fanPos = (i: number, n: number) => {
  const a = n <= 1 ? 0 : -22 + (44 * i) / (n - 1);
  const rad = (a * Math.PI) / 180;
  return { x: CX + Math.sin(rad) * 560, y: 1780 - Math.cos(rad) * 180, rot: a };
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Table: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro, chaos, hand: h, tricks, kaboot } = timeline;
  const trickStart = (k: number) => tricks.from + k * tricks.each;
  const played = hand.filter((_, k) => frame >= trickStart(k) + tricks.ours).length;
  const won = hand.filter((_, k) => frame >= trickStart(k) + tricks.win + 6).length;
  const burst = interpolate(frame, [kaboot.from, kaboot.from + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out: React.ReactNode[] = [];

  // 1. the lone card
  if (frame < chaos.from + 10) {
    const s = spring({ frame, fps, config: { damping: 14 } });
    out.push(
      <Placed key="lone" x={CX} y={lerp(1500, CY, s)} rot={lerp(-40, -4, s) + Math.sin(frame / 20) * 2} scale={1.2} opacity={interpolate(frame, [chaos.from, chaos.from + 10], [1, 0], clamp)}>
        <CardBack />
      </Placed>,
    );
  }
  // 2. chaos: cards flying everywhere
  if (frame >= chaos.from && frame < h.gather + 10) {
    for (let i = 0; i < 26; i++) {
      const t = (frame - chaos.from) / 30;
      const g = interpolate(frame, [h.from, h.gather], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
      const ang = random(`a${i}`) * Math.PI * 2 + t * (random(`s${i}`) - 0.5) * 2;
      const rad = 250 + random(`r${i}`) * 650;
      const x = lerp(CX + Math.cos(ang) * rad, CX, g);
      const y = lerp(CY + Math.sin(ang) * rad * 1.3, CY, g);
      const appear = interpolate(frame, [chaos.from + i * 1.5, chaos.from + i * 1.5 + 8], [0, 1], clamp);
      const face = i % 3 === 0;
      out.push(
        <Placed key={`c${i}`} x={x} y={y} rot={t * 90 * (random(`d${i}`) - 0.5) * 4 * (1 - g)} scale={0.75 * appear} opacity={1 - interpolate(frame, [h.gather, h.gather + 10], [0, 1], clamp)}>
          {face ? <CardFace rank={["A", "K", "Q", "J", "10", "9"][i % 6]} suit={(["spade", "heart", "diamond", "club"] as Suit[])[i % 4]} /> : <CardBack />}
        </Placed>,
      );
    }
  }
  // 3-4. the hand, then each card played into the trick
  if (frame >= h.deal - 4) {
    hand.forEach((c, i) => {
      const deal = spring({ frame: frame - (h.deal + i * 5), fps, config: { damping: 15 } });
      const playAt = trickStart(i) + tricks.ours;
      // position in the fan among the cards still in hand (the fan closes up as cards are played)
      const before = Math.min(played, i);
      const fanNow = fanPos(i - before, hand.length - before);
      const tp = interpolate(frame, [playAt, playAt + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      const winT = interpolate(frame, [trickStart(i) + tricks.win, trickStart(i) + tricks.win + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
      let x = lerp(CX, fanNow.x, deal);
      let y = lerp(CY, fanNow.y, deal);
      let rot = fanNow.rot * deal;
      let scale = 0.9;
      if (tp > 0) {
        x = lerp(fanNow.x, CX, tp);
        y = lerp(fanNow.y, CY + 170, tp);
        rot = lerp(fanNow.rot, -3, tp);
        scale = lerp(0.9, 1.1, tp);
      }
      if (winT > 0) {
        x = lerp(CX, 150 + i * 14, winT);
        y = lerp(CY + 170, 1450 - i * 6, winT);
        rot = lerp(-3, 80, winT);
        scale = lerp(1.1, 0.6, winT);
      }
      if (burst > 0) {
        const a = random(`b${i}`) * Math.PI * 2;
        x += Math.cos(a) * 1400 * burst;
        y += Math.sin(a) * 1400 * burst;
        rot += 720 * burst;
      }
      out.push(
        <Placed key={`h${i}`} x={x} y={y} rot={rot} scale={scale} flip={winT > 0.5 ? 1 : 0} back={<CardBack />}>
          <CardFace {...c} />
        </Placed>,
      );
    });
  }
  // opponents' cards for each trick, swept away with ours
  hand.forEach((_, k) => {
    tricks.opp.forEach((d, j) => {
      const s = trickStart(k) + d;
      if (frame < s) return;
      const p = interpolate(frame, [s, s + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      const winT = interpolate(frame, [trickStart(k) + tricks.win, trickStart(k) + tricks.win + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
      if (burst >= 1) return;
      const o = OPP[j];
      let x = lerp(o.from.x, o.to.x, p);
      let y = lerp(o.from.y, o.to.y, p);
      let rot = o.rot + (1 - p) * 180;
      x = lerp(x, 150 + k * 14, winT);
      y = lerp(y, 1450 - k * 6, winT);
      rot = lerp(rot, 80, winT);
      if (burst > 0) {
        const a = random(`ob${k}${j}`) * Math.PI * 2;
        x += Math.cos(a) * 1400 * burst;
        y += Math.sin(a) * 1400 * burst;
        rot += 540 * burst;
      }
      out.push(
        <Placed key={`o${k}${j}`} x={x} y={y} rot={rot} scale={lerp(1, 0.6, winT)} flip={winT > 0.5 ? 1 : 0} back={<CardBack />}>
          <CardFace {...OPP_FACES[j]} />
        </Placed>,
      );
    });
  });

  return (
    <>
      {out}
      {/* trick counter */}
      {frame >= tricks.from - 10 && frame < kaboot.from + 20 ? (
        <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: interpolate(frame, [tricks.from - 10, tricks.from, kaboot.from, kaboot.from + 20], [0, 1, 1, 0], clamp) }}>
          <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: colors.steel }}>TRICKS</span>
          {hand.map((_, k) => (
            <div key={k} style={{ width: 44, height: 16, borderRadius: 8, background: k < won ? colors.accent : "rgba(228,230,238,0.15)", boxShadow: k < won ? "0 0 14px #5E78FF" : "none" }} />
          ))}
          <span dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 30, color: colors.silver }}>
            الأكلات {won}/5
          </span>
        </div>
      ) : null}
    </>
  );
};

const KabootMoment: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { kaboot } = timeline;
  const stamp = spring({ frame: frame - kaboot.from, fps, config: { damping: 8, stiffness: 160 } });
  const flip = interpolate(frame, [kaboot.flip, kaboot.flip + 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cardIn = spring({ frame: frame - (kaboot.flip - 14), fps, config: { damping: 14 } });
  const stampOut = interpolate(frame, [kaboot.flip - 16, kaboot.flip - 4], [1, 0], clamp);
  return (
    <>
      <div style={{ position: "absolute", top: 820, left: 0, right: 0, textAlign: "center", transform: `scale(${interpolate(stamp, [0, 1], [3, 1])}) rotate(-6deg)`, opacity: Math.min(1, stamp * 2) * stampOut }}>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 250, lineHeight: 1, color: colors.white, textShadow: "0 0 60px rgba(94,120,255,0.9)" }}>
          كبوت!
        </div>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 70, letterSpacing: 24, color: colors.accent }}>KABOOT</div>
      </div>
      {frame >= kaboot.flip - 14 ? (
        <Placed x={CX} y={CY + 60} rot={0} scale={1.9 * cardIn} flip={1 - flip} back={<CardBack />}>
          <CardFace rank="" suit="spade" logo />
        </Placed>
      ) : null}
    </>
  );
};

// "كبوت / Kaboot" — a Baloot hand where every card is a NEO CAPTA service and every trick is won.
export const KabootVideo: React.FC = () => {
  useFonts();
  const { intro, chaos, hand: h, tricks, kaboot, outro } = timeline;
  const trickStart = (k: number) => tricks.from + k * tricks.each;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 55%, #0f2266 0%, #050a24 55%, #010207 100%)", overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: 0.25, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1.5px)", backgroundSize: "6px 6px" }} />
      <div style={{ position: "absolute", left: CX - 470, top: CY - 470, width: 940, height: 940, borderRadius: "50%", border: "3px solid rgba(228,230,238,0.12)", boxShadow: "inset 0 0 120px rgba(0,0,0,0.6)" }} />
      <Sequence from={0} durationInFrames={outro.from} layout="none">
        <Table />
        <KabootMoment />
      </Sequence>

      <Sequence from={intro.from + 14} durationInFrames={intro.to - intro.from - 10}>
        <AbsoluteFill style={{ paddingTop: 260 }}>
          <LuxTitle kicker="KABOOT · كبوت" en="Every idea starts with a card." ar="كل فكرة تبدأ بورقة." enSize={78} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={chaos.from + 6} durationInFrames={chaos.to - chaos.from - 6}>
        <AbsoluteFill style={{ paddingTop: 240 }}>
          <LuxTitle en="But not every idea knows how to play it." ar="لكن مو كل فكرة تعرف وش تلعب." enSize={74} arSize={70} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={h.from + 6} durationInFrames={h.to - h.from - 6}>
        <AbsoluteFill style={{ paddingTop: 260 }}>
          <LuxTitle kicker="NEO CAPTA" en="We know the game." ar="نحن نعرف اللعبة." />
        </AbsoluteFill>
      </Sequence>
      {hand.map((c, k) => (
        <Sequence key={c.en} from={trickStart(k) + tricks.ours} durationInFrames={Math.min(tricks.each, kaboot.from - trickStart(k) - tricks.ours)}>
          <AbsoluteFill style={{ paddingTop: 260 }}>
            <LuxTitle kicker={`TRICK ${k + 1} · ${c.rank}`} en={c.en.charAt(0) + c.en.slice(1).toLowerCase()} ar={c.ar} enSize={96} arSize={84} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence from={kaboot.flip + 8} durationInFrames={outro.from - kaboot.flip - 8}>
        <AbsoluteFill style={{ paddingTop: 240 }}>
          <LuxTitle en="Every trick… is yours." ar="كبوت… للسوق." enSize={80} arSize={96} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <BrandOutro en="Every trick is yours." ar="كل الأكلات لك" />
      </Sequence>
      <Sequence from={0} durationInFrames={outro.from}>
        <div style={{ position: "absolute", top: 70, right: 60, opacity: 0.85 }}>
          <Logo width={150} />
        </div>
      </Sequence>
      {[kaboot.from, outro.from].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={12}>
          <Flash duration={10} />
        </Sequence>
      ))}
      <Grain />
      <Audio src={staticFile("kaboot-music.wav")} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "../timeline.json";
import { IPad } from "../components/IPad";
import { colors, fonts } from "../theme";
import { AdCard } from "../cards/AdCard";
import { MapCard } from "../cards/MapCard";
import { DataCard } from "../cards/DataCard";
import { SocialCard } from "../cards/SocialCard";
import { RestaurantCard } from "../cards/RestaurantCard";
import { ClipCard } from "../cards/ClipCard";
import { GraphCard } from "../cards/GraphCard";
import { IdeaCard } from "../cards/IdeaCard";

const T = timeline.transition;

const cardContent: Record<string, { el: React.ReactNode; en: string; ar: string }> = {
  ad: { el: <AdCard />, en: "Ad", ar: "إعلان" },
  map: { el: <MapCard />, en: "Map", ar: "خريطة" },
  data: { el: <DataCard />, en: "Data", ar: "أرقام وبيانات" },
  social: { el: <SocialCard />, en: "Social Media", ar: "سوشال ميديا" },
  restaurant: { el: <RestaurantCard />, en: "Restaurant", ar: "مطعم" },
  product: { el: <ClipCard src="product.mp4" tagEn="NEW" tagAr="منتج جديد" />, en: "Product", ar: "منتج" },
  watch: { el: <ClipCard src="watch.mp4" tagEn="Ad · 0:15" tagAr="يشاهد الإعلان" progress />, en: "Watching", ar: "مشاهدة" },
  campaign: { el: <ClipCard src="campaign.mp4" tagEn="LIVE CAMPAIGN" tagAr="الحملة انطلقت" live />, en: "Campaign", ar: "حملة إعلانية" },
  graph: { el: <GraphCard />, en: "Growth", ar: "نمو" },
  idea: { el: <IdeaCard />, en: "Idea", ar: "فكرة" },
};

// Start frame (relative to the montage) of each card.
export const cardStarts = timeline.cards.reduce<number[]>((acc, c, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + timeline.cards[i - 1].duration);
  return acc;
}, []);
export const montageDuration = cardStarts[cardStarts.length - 1] + timeline.cards[timeline.cards.length - 1].duration;

// Slides a card in from the right and out to the left, with motion blur.
const Slide: React.FC<{ duration: number; first: boolean; last: boolean; children: React.ReactNode }> = ({
  duration,
  first,
  last,
  children,
}) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.7, 0, 0.2, 1);
  const enter = first ? 1 : interpolate(frame, [0, T], [0, 1], { extrapolateRight: "clamp", easing: ease });
  const exit = last ? 0 : interpolate(frame, [duration, duration + T], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const x = (1 - enter) * 100 - exit * 100;
  const moving = Math.sin(Math.PI * (1 - enter)) + Math.sin(Math.PI * exit);
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}%)`, filter: `blur(${moving * 10}px)` }}>{children}</AbsoluteFill>
  );
};

const SwipeFinger: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, T + 2], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const opacity = interpolate(frame, [0, 2, T, T + 3], [0, 0.9, 0.6, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 1160,
        left: 540 + 260 - p * 520 - 55,
        width: 110,
        height: 110,
        borderRadius: "50%",
        background: "rgba(246,248,249,0.35)",
        border: "4px solid rgba(246,248,249,0.8)",
        boxShadow: "0 0 40px rgba(67,214,155,0.6)",
        opacity,
      }}
    />
  );
};

const Label: React.FC<{ en: string; ar: string }> = ({ en, ar }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 1640,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: s,
        transform: `translateY(${(1 - s) * 30}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 22,
          alignItems: "center",
          padding: "14px 40px",
          borderRadius: 60,
          border: `2px solid rgba(213,218,223,0.5)`,
          background: "rgba(1,13,9,0.45)",
          color: colors.white,
        }}
      >
        <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 40, letterSpacing: 2, textTransform: "uppercase" }}>{en}</span>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: colors.mint }} />
        <span dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 44 }}>
          {ar}
        </span>
      </div>
    </div>
  );
};

export const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = timeline.cards.length;

  // Camera: arrive from the intro push-in, drift in 3D, small kick on every cut, then dive into the paper.
  const arrive = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });
  const cutIndex = cardStarts.filter((s) => s <= frame).length - 1;
  const sinceCut = frame - cardStarts[cutIndex];
  const kick = cutIndex > 0 ? Math.exp(-sinceCut / 4) : 0;
  const shakeX = (random(`sx-${cutIndex}`) - 0.5) * 30 * kick;
  const shakeY = (random(`sy-${cutIndex}`) - 0.5) * 30 * kick;
  const dive = interpolate(frame, [montageDuration - 16, montageDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const scale = interpolate(arrive, [0, 1], [1.6, 0.97]) + frame * 0.0003 + kick * 0.02 + dive * 2.6;
  const rotY = Math.sin(frame / 38) * 7 * (1 - dive);
  const rotX = 5 + Math.cos(frame / 50) * 3 * (1 - dive);

  return (
    <AbsoluteFill style={{ opacity: interpolate(dive, [0.6, 1], [1, 0]) }}>
      <AbsoluteFill style={{ perspective: 2200, alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            transform: `translate(${shakeX}px, ${shakeY - 60}px) scale(${scale}) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
          }}
        >
          <IPad>
            {timeline.cards.map((c, i) => (
              <Sequence key={c.id} from={cardStarts[i]} durationInFrames={c.duration + (i === n - 1 ? 0 : T)} layout="none">
                <Slide duration={c.duration} first={i === 0} last={i === n - 1}>
                  {cardContent[c.id].el}
                </Slide>
              </Sequence>
            ))}
          </IPad>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - dive }}>
        {timeline.cards.map((c, i) => (
          <Sequence key={c.id} from={cardStarts[i]} durationInFrames={c.duration}>
            <Label en={cardContent[c.id].en} ar={cardContent[c.id].ar} />
            {i > 0 ? <SwipeFinger /> : null}
          </Sequence>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

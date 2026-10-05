import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { C, ClayBg, ClayEnd, ClayLogo, Say, clamp, clay, sphere } from "./kit";
import TL from "./timelines.json";

// «من الإعلان للسلة»: see the ad → tap → product → add to cart → order placed.
const T = TL.cart;
const PH = { w: 560, h: 1060, top: 450 };

const Bottle: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <div style={{ position: "relative", width: 220 * s, height: 300 * s }}>
    <div style={{ position: "absolute", left: 70 * s, top: 0, width: 80 * s, height: 70 * s, ...clay(C.navy, 18 * s) }} />
    <div style={{ position: "absolute", left: 0, top: 60 * s, width: 220 * s, height: 240 * s, ...clay(C.peach, 60 * s), display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 90 * s, height: 90 * s, ...sphere(C.white) }} />
    </div>
  </div>
);

const Tap: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -14 || t > 18) return null;
  const come = interpolate(t, [-14, 0], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const r = interpolate(t, [0, 18], [0, 1], clamp);
  return (
    <>
      {t >= 0 ? <div style={{ position: "absolute", left: x - 20 - r * 80, top: y - 20 - r * 80, width: 40 + r * 160, height: 40 + r * 160, borderRadius: "50%", border: `6px solid ${C.peri}`, opacity: 1 - r }} /> : null}
      <div style={{ position: "absolute", left: x - 34 + come * 160, top: y - 34 + come * 220, width: 68, height: 68, transform: `scale(${t >= 0 && t < 5 ? 0.85 : 1})`, ...sphere(C.lilac), opacity: t > 12 ? 1 - (t - 12) / 6 : 1 }} />
    </>
  );
};

export const CartVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phoneIn = spring({ frame, fps, config: { damping: 12 } });
  const aside = interpolate(frame, [T.tapAdd + 10, T.tapAdd + 26], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) * (1 - interpolate(frame, [T.checkout - 16, T.checkout], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }));
  const phoneX = 540 - aside * 190;
  const phoneScale = 1 - aside * 0.18;
  const scroll = interpolate(frame, [T.feed, T.tapAd - 15], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const screen = frame < T.product ? "feed" : frame < T.checkout ? "product" : "done";
  const cartIn = spring({ frame: frame - (T.tapAdd + 14), fps, config: { damping: 9 } });
  const cartOut = interpolate(frame, [T.checkout - 16, T.checkout - 4], [0, 1], clamp);
  const flyP = interpolate(frame, [T.fly[0], T.fly[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const bump = frame >= T.fly[1] && frame < T.fly[1] + 10 ? Math.sin(((frame - T.fly[1]) / 10) * Math.PI) * 0.15 : 0;
  const done = spring({ frame: frame - T.done, fps, config: { damping: 8 } });
  const cart = { x: 860, y: 1180 };
  const src = { x: phoneX, y: 1250 };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <ClayBg />
      <Sequence from={0} durationInFrames={T.product} layout="none">
        <Say ar="يشوف إعلانك…" en="They see your ad…" top={150} from={4} hl={1} />
      </Sequence>
      <Sequence from={T.product} durationInFrames={T.fly[0] - T.product} layout="none">
        <Say ar="…يتحمس…" en="…they get curious…" top={150} from={2} hl={0} />
      </Sequence>
      <Sequence from={T.fly[0]} durationInFrames={T.checkout - T.fly[0]} layout="none">
        <Say ar="…يضيف للسلة…" en="…add to cart…" top={150} from={2} hl={1} />
      </Sequence>
      <Sequence from={T.checkout} durationInFrames={T.line - T.checkout} layout="none">
        <Say ar="…ويشتري." en="…and buy." top={150} from={4} hl={0} />
      </Sequence>
      <Sequence from={T.line} durationInFrames={T.end - T.line} layout="none">
        <Say ar="كل خطوة… مدروسة." en="Every step, designed." top={150} from={2} hl={1} />
      </Sequence>
      {/* phone */}
      <div style={{ position: "absolute", left: phoneX - PH.w / 2, top: PH.top, width: PH.w, height: PH.h, padding: 22, transform: `translateY(${(1 - phoneIn) * 1200}px) scale(${phoneScale})`, ...clay(C.navy, 80) }}>
        <div dir="rtl" style={{ position: "relative", width: "100%", height: "100%", borderRadius: 60, background: "#FBFAFF", overflow: "hidden" }}>
          {screen === "feed" ? (
            <div style={{ position: "absolute", left: 26, right: 26, top: 40 - scroll * 900 }}>
              {[0, 1, 2, 3, 4].map((i) =>
                i === 3 ? (
                  <div key={i} style={{ height: 420, marginBottom: 26, padding: 30, ...clay(C.peri, 40), display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 18, letterSpacing: 3, color: C.white, opacity: 0.8 }}>SPONSORED</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 50, color: C.white, lineHeight: 1.2 }}>عرض نهاية الأسبوع</div>
                        <div style={{ marginTop: 10, display: "inline-block", fontFamily: fonts.display, fontWeight: 900, fontSize: 40, color: C.navy, padding: "4px 22px", ...clay(C.butter, 30) }}>خصم ٢٠٪</div>
                      </div>
                      <Bottle s={0.6} />
                    </div>
                  </div>
                ) : (
                  <div key={i} style={{ height: 300, marginBottom: 26, ...clay([C.lilac, C.mint, C.peach, C.pink, C.butter][i], 40), opacity: 0.85 }} />
                ),
              )}
            </div>
          ) : screen === "product" ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 70 }}>
              <div style={{ width: 380, height: 380, ...clay(C.lilac, 60), display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${spring({ frame: frame - T.product, fps, config: { damping: 10 } })})` }}>
                {frame < T.fly[0] ? <Bottle /> : null}
              </div>
              <div style={{ marginTop: 40, fontFamily: fonts.display, fontWeight: 900, fontSize: 56, color: C.navy }}>عطر نيو</div>
              <div style={{ marginTop: 6, fontSize: 34, color: "#F5B400", letterSpacing: 4 }}>★★★★★</div>
              <div style={{ marginTop: 10, fontFamily: fonts.display, fontWeight: 700, fontSize: 44, color: C.blue }}>١٨٩ ر.س</div>
              <div style={{ position: "absolute", bottom: 60, left: 50, right: 50, height: 120, ...clay(C.blue, 60), display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${frame >= T.tapAdd && frame < T.tapAdd + 6 ? 0.92 : 1})` }}>
                <span style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 50, color: C.white }}>{frame >= T.tapAdd ? "تمت الإضافة ✓" : "أضف للسلة"}</span>
              </div>
            </div>
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 260, height: 260, transform: `scale(${done})`, ...sphere(C.mint), display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={140} height={140} viewBox="0 0 100 100"><path d="M 22 52 L 42 72 L 80 30" fill="none" stroke={C.white} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ marginTop: 50, fontFamily: fonts.display, fontWeight: 900, fontSize: 70, color: C.navy, opacity: done }}>تم الطلب</div>
              <div style={{ marginTop: 10, fontFamily: fonts.en, fontWeight: 800, fontSize: 30, color: C.muted, opacity: done }}>ORDER #2048</div>
            </div>
          )}
        </div>
      </div>
      {/* taps */}
      <Tap at={T.tapAd} x={540} y={PH.top + 22 + 40 - 900 + 3 * 326 + 210} />
      <Tap at={T.tapAdd} x={540} y={PH.top + PH.h - 22 - 120} />
      {/* cart */}
      {frame >= T.tapAdd + 14 && frame < T.checkout ? (
        <div style={{ position: "absolute", left: cart.x - 150, top: cart.y - 130, width: 300, height: 260, transform: `scale(${cartIn * (1 - cartOut) * (1 + bump)})` }}>
          <div style={{ position: "absolute", left: 20, top: 40, width: 260, height: 160, ...clay(C.butter, 40) }} />
          <div style={{ position: "absolute", left: -10, top: 20, width: 80, height: 26, ...clay(C.navy, 13), transform: "rotate(-20deg)" }} />
          <div style={{ position: "absolute", left: 50, top: 200, width: 56, height: 56, ...sphere(C.navy) }} />
          <div style={{ position: "absolute", left: 200, top: 200, width: 56, height: 56, ...sphere(C.navy) }} />
          {frame >= T.fly[1] ? (
            <div style={{ position: "absolute", right: -10, top: -10, width: 80, height: 80, ...sphere("#FF6B6B"), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.en, fontWeight: 800, fontSize: 40, color: C.white, transform: `scale(${spring({ frame: frame - T.fly[1], fps, config: { damping: 8 } })})` }}>1</div>
          ) : null}
        </div>
      ) : null}
      {/* product flying into the cart */}
      {frame >= T.fly[0] && frame < T.fly[1] ? (
        <div style={{ position: "absolute", left: src.x + (cart.x - src.x) * flyP - 110 * (1 - flyP * 0.6), top: 760 + (cart.y - 60 - 760) * flyP - Math.sin(flyP * Math.PI) * 300 - 150, transform: `scale(${1 - flyP * 0.6}) rotate(${flyP * 200}deg)` }}>
          <Bottle />
        </div>
      ) : null}
      {/* confetti on order */}
      {frame >= T.done
        ? new Array(30).fill(0).map((_, i) => {
            const t = frame - T.done;
            const a = random(`k${i}`) * Math.PI * 2;
            const v = 9 + random(`v${i}`) * 14;
            return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * v * t - 12, top: 900 + Math.sin(a) * v * t + 0.45 * t * t - 12, width: 24, height: 24, opacity: Math.max(0, 1 - t / 55), ...sphere([C.peri, C.pink, C.mint, C.butter][i % 4]) }} />;
          })
        : null}
      <Sequence from={T.end}>
        <ClayEnd ar="نوصل عميلك… من أول نظرة لين يشتري." en="From first look to checkout." />
      </Sequence>
      {frame < T.end ? <ClayLogo /> : null}
      <Audio src={staticFile("clay-cart-music.wav")} />
    </AbsoluteFill>
  );
};

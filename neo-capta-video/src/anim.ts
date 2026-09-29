import { Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** 0→1 progress between two frames with an ease-out curve. */
export const progress = (frame: number, start: number, length: number) =>
  interpolate(frame, [start, start + length], [0, 1], { ...clamp, easing: ease });

/** Fade in at the start of a scene and out at its end. */
export const sceneOpacity = (frame: number, duration: number, fade = 12) =>
  interpolate(frame, [0, fade, duration - fade, duration], [0, 1, 1, 0], clamp);

/** Rise + unblur reveal used for words and lines. */
export const reveal = (frame: number, start: number, length = 18) => {
  const p = progress(frame, start, length);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * 40}px)`,
    filter: `blur(${(1 - p) * 10}px)`,
  };
};

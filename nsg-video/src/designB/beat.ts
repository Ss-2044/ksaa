import {useCurrentFrame} from 'remotion';

// Music is 120 BPM → one beat every 15 frames @ 30fps. Every scene starts on a beat,
// so the local frame keeps the same beat phase as the global timeline.
export const BEAT = 15;
export const BAR = BEAT * 4;

export const useBeatPulse = (decay = 4) => {
  const frame = useCurrentFrame();
  return Math.exp(-(frame % BEAT) / decay);
};

import {createContext, useContext} from 'react';
import {useVideoConfig} from 'remotion';

// Lets a 1920×1080 scene render correctly when nested inside another canvas (e.g. the 9:16 wrapper).
export const FrameSize = createContext<{width: number; height: number} | null>(null);

export const useFrameSize = () => {
  const cfg = useVideoConfig();
  return useContext(FrameSize) ?? {width: cfg.width, height: cfg.height};
};

import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "./theme";

/** Dark gradient with a drifting indigo glow and a halftone dot field. */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const gx = 50 + Math.sin(frame / 90) * 12;
  const gy = 45 + Math.cos(frame / 110) * 8;
  const dotX = 30 + Math.sin(frame / 70) * 25;

  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 60% at ${gx}% ${gy}%, ${colors.glow} 0%, rgba(37,32,94,0.35) 45%, transparent 75%),
            linear-gradient(160deg, ${colors.bg} 0%, #10102a 55%, ${colors.bgDeep} 100%)`,
        }}
      />
      {/* faint full-frame grid */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(circle, rgba(241,240,245,0.10) 1.2px, transparent 1.6px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* brighter halftone patch that wanders across the frame */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, ${colors.lavender} 2.2px, transparent 2.8px)`,
          backgroundSize: "32px 32px",
          opacity: 0.55,
          maskImage: `radial-gradient(ellipse 28% 38% at ${dotX + 40}% 50%, black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(ellipse 28% 38% at ${dotX + 40}% 50%, black 0%, transparent 100%)`,
        }}
      />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
      />
    </AbsoluteFill>
  );
};

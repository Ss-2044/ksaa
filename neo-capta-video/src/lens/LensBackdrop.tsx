import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../theme";

/** Near-black field with a fine line grid and a low lavender horizon glow. */
export const LensBackdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.4) % 80;
  return (
    <AbsoluteFill style={{ background: "#06060b" }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(241,240,245,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(241,240,245,0.045) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: `${drift}px 0`,
        }}
      />
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse 70% 40% at 50% 110%, ${colors.indigo}66 0%, transparent 70%)` }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};

import { Audio, interpolate, Sequence, staticFile } from "remotion";

// Only the opening hit under the logo (first 3 seconds of the score); the rest is silent.
const HIT_FRAMES = 90;

export const Soundtrack: React.FC = () => (
  <Sequence durationInFrames={HIT_FRAMES}>
    <Audio
      src={staticFile("audio/music.wav")}
      volume={(f) => interpolate(f, [0, HIT_FRAMES - 30, HIT_FRAMES], [0.9, 0.9, 0], { extrapolateRight: "clamp" })}
    />
  </Sequence>
);

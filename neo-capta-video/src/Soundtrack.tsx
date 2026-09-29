import { Audio, staticFile } from "remotion";

// Full original score (scripts/make-music.py): logo hit at 0s, beat from 13s, final hit at 25s.
export const Soundtrack: React.FC = () => <Audio src={staticFile("audio/music.wav")} volume={0.85} />;

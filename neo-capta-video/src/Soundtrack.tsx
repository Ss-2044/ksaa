import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { useLang } from "./lang";
import { FPS } from "./theme";

// Voice-over line start times in seconds, one per scene after the logo.
const starts = [3.3, 7.4, 13.4, 19.4, 25.4];
// Clip lengths in seconds (public/audio/<lang>-<n>.mp3), used to duck the music.
const lengths = {
  ar: [2.3, 5.1, 5.5, 5.4, 4.1],
  en: [2.1, 5.0, 3.4, 4.2, 3.1],
};

export const Soundtrack: React.FC = () => {
  const { lang } = useLang();
  const musicVolume = (f: number) => {
    const s = f / FPS;
    const speaking = starts.some((st, i) => s > st - 0.3 && s < st + lengths[lang][i] + 0.2);
    // smooth the duck so it never clicks
    const near = Math.min(...starts.map((st, i) => Math.max(st - 0.3 - s, s - (st + lengths[lang][i] + 0.2), 0)));
    return speaking ? 0.25 : interpolate(near, [0, 0.4], [0.25, 0.75], { extrapolateRight: "clamp" });
  };

  return (
    <>
      <Audio src={staticFile("audio/music.wav")} volume={musicVolume} />
      {starts.map((st, i) => (
        <Sequence key={i} from={Math.round(st * FPS)}>
          <Audio src={staticFile(`audio/${lang}-${i + 1}.mp3`)} volume={1} />
        </Sequence>
      ))}
    </>
  );
};

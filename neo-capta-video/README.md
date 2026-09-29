# Neo Capta — brand video (Remotion)

A 30-second motion video in the Neo Capta palette, rendered as two separate cuts from the same scenes:

- `NeoCaptaAR` renders `neo-capta-ar.mp4`, the Arabic cut (right-to-left).
- `NeoCaptaEN` renders `neo-capta-en.mp4`, the English cut.

Both are 1920×1080 at 30 fps. `neo-capta.mp4` is the earlier bilingual cut, rendered from a previous commit.

All on-screen text for both languages is in `src/lang.tsx`.

## Audio

`src/Soundtrack.tsx` lays one voice-over line over each scene after the logo. It also lowers the music while a line is playing.

- `public/audio/ar-1.mp3` to `ar-5.mp3` hold the Arabic voice-over (Microsoft `ar-SA-HamedNeural` voice, generated with edge-tts).
- `public/audio/en-1.mp3` to `en-5.mp3` hold the English voice-over (`en-US-AndrewNeural` voice).
- `public/audio/music.wav` is an original score synthesized by `scripts/make-music.py` (numpy). It has no samples and no licensed material.

To use a different voice (for example ElevenLabs), replace the mp3 files under the same names. If the clip lengths change, update `lengths` in `src/Soundtrack.tsx`.

The script, storyboard, voice-over and AI-video prompts are in [SCRIPT.md](SCRIPT.md).

## Scenes

| Time | Scene | File |
|---|---|---|
| 0–3s | Logo reveal | `src/scenes/LogoIntro.tsx` |
| 3–7s | "We see the unseen." (EN) or «نرى ما لا يُرى» (AR) | `src/scenes/Tagline.tsx` |
| 7–13s | Born in the desert (halftone dunes) | `src/scenes/Desert.tsx` |
| 13–19s | Traditional marketing → reimagined | `src/scenes/Different.tsx` |
| 19–25s | New ideas + five pillars | `src/scenes/Ideas.tsx` |
| 25–30s | Logo + tagline outro | `src/scenes/Outro.tsx` |

Colors and fonts are defined in `src/theme.ts`. The fonts (IBM Plex Sans Arabic, Archivo and IBM Plex Mono) ship in `public/fonts`.

## Run

```bash
npm install
npm run studio   # live preview in the browser
npm run render     # writes out/neo-capta-ar.mp4 and out/neo-capta-en.mp4
npm run render:ar  # Arabic only
npm run render:en  # English only
```

In a sandbox without Remotion's own Chrome, add `--browser-executable=<path to chrome/headless_shell>`.

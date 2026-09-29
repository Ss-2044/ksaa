# Neo Capta — brand video (Remotion)

A 30-second motion video in the Neo Capta palette, rendered as two separate cuts from the same scenes:

- `NeoCaptaAR` renders `neo-capta-ar.mp4`, the Arabic cut (right-to-left).
- `NeoCaptaEN` renders `neo-capta-en.mp4`, the English cut.

Both are 1920×1080 at 30 fps. `neo-capta.mp4` is the earlier bilingual cut, rendered from a previous commit.

All on-screen text for both languages is in `src/lang.tsx`.

## Design 2: Lens

This design is built around "we see the unseen": a scanner lens reveals what is hidden. It uses the same copy, timing and music as design 1.

- `NeoCaptaLensAR` renders `neo-capta-lens-ar.mp4`.
- `NeoCaptaLensEN` renders `neo-capta-lens-en.mp4`.

| Time | Scene |
|---|---|
| 0–3s | Radar ping; the logo is revealed through a growing lens |
| 3–7s | The official line sits dim until the lens passes over it |
| 7–13s | The desert as a topographic survey with a scan line |
| 13–19s | "Traditional marketing" is sliced apart, then the frame flips to lavender |
| 19–25s | The five pillars appear one at a time, full screen, with a progress bar |
| 25–30s | The logo inside a rotating lens, with the official line |

The scenes are in `src/lens/`. Run `npm run render:lens` to render both cuts.

## Audio

There is no voice-over, only music. The track is `public/audio/music.wav`, an original score synthesized by `scripts/make-music.py` (numpy) and timed to the scenes:

- a hit under the logo at 0s
- a beat that starts with "marketing, differently" at 13s
- a shimmer arp over the pillars at 19s
- a final hit on the outro at 25s, then a fade-out

`src/Soundtrack.tsx` plays it.

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

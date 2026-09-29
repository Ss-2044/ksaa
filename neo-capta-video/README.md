# Neo Capta — brand video (Remotion)

A 30-second bilingual (Arabic / English) motion video in the Neo Capta palette.
It is rendered as a 1920×1080 video at 30 fps.

The script, storyboard, voice-over and AI-video prompts are in [SCRIPT.md](SCRIPT.md).

## Scenes

| Time | Scene | File |
|---|---|---|
| 0–3s | Logo reveal | `src/scenes/LogoIntro.tsx` |
| 3–7s | "We see the unseen." / «نرى ما لا يُرى» | `src/scenes/Tagline.tsx` |
| 7–13s | Born in the desert (halftone dunes) | `src/scenes/Desert.tsx` |
| 13–19s | Traditional marketing → reimagined | `src/scenes/Different.tsx` |
| 19–25s | New ideas + five pillars | `src/scenes/Ideas.tsx` |
| 25–30s | Logo + tagline outro | `src/scenes/Outro.tsx` |

Colors and fonts are defined in `src/theme.ts`. The fonts (IBM Plex Sans Arabic, Archivo and IBM Plex Mono) ship in `public/fonts`.

## Run

```bash
npm install
npm run studio   # live preview in the browser
npm run render   # writes out/neo-capta.mp4
```

In a sandbox without Remotion's own Chrome, add `--browser-executable=<path to chrome/headless_shell>`.

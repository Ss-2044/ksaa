# Neo Capta — brand videos (Remotion)

Three 1080p / 30 fps videos, each in Arabic and English, with an original soundtrack.

| Composition | Length | Idea |
|---|---|---|
| `NeoCapta-AR/EN` | 24 s | **From idea to impact** — a dot becomes a halftone grid, assembles the logo, the runner breaks out. |
| `Manifesto-AR/EN` | 20 s | **Move your brand** — a noisy market, one voice heard, three bold slams, the runner sprints into the logo. |
| `Journey-AR/EN` | 22 s | **Your brand's journey** — four process steps (audience → strategy → content → launch) with animated panels. |

```bash
npm install
npm run studio        # live preview
npm run music         # regenerate soundtracks -> public/audio/*.wav (needs python3 + numpy + scipy)
npm run render        # all six -> out/*.mp4   (or: node render-all.mjs manifesto)
```

- Text: `src/copy.ts`. Scene timing: constants at the top of each composition file.
- Music: `music/compose.py` synthesizes every sound (no samples — royalty free). Cue times there must match the scene frames.
- `src/logo.json` is the logo vectorized from the brand image (NEO / CAPTA / runner paths + halftone points).
- Fonts (Cairo, Montserrat — OFL) are bundled in `public/fonts`.
- On a machine without Remotion's Chrome, set `REMOTION_BROWSER=/path/to/headless_shell`.

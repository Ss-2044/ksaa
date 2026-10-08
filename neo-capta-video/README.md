# Neo Capta — brand videos (Remotion)

Six videos (three 16:9, three vertical 9:16 for Reels/TikTok/Stories), each in Arabic and English, 30 fps, with an original soundtrack.

| Composition | Length | Idea |
|---|---|---|
| `NeoCapta-AR/EN` | 24 s | **From idea to impact** — a dot becomes a halftone grid, assembles the logo, the runner breaks out. |
| `Manifesto-AR/EN` | 20 s | **Move your brand** — a noisy market, one voice heard, three bold slams, the runner sprints into the logo. |
| `Journey-AR/EN` | 22 s | **Your brand's journey** — four process steps (audience → strategy → content → launch) with animated panels. |
| `BeforeAfter-AR/EN` (9:16) | 15 s | **Before / After** — the same post, dull vs. designed by Neo Capta, revealed with a slider. |
| `Brief-AR/EN` (9:16) | 15 s | **The brief** — a client chat ("I have an idea…" → "Leave it to us.") bursts into a full campaign. |
| `Sting-AR/EN` (9:16) | 8 s | **Logo sting** — halftone wave, the logo draws itself, the runner pops in. Intro/outro for posts. |

```bash
npm install
npm run studio        # live preview
npm run music         # regenerate soundtracks -> public/audio/*.wav (needs python3 + numpy + scipy)
npm run render        # everything -> out/*.mp4   (or: node render-all.mjs manifesto brief)
```

- Text: `src/copy.ts`. Scene timing: constants at the top of each composition file.
- Music: `music/compose.py` synthesizes every sound (no samples — royalty free). Cue times there must match the scene frames.
- `src/logo.json` is the logo vectorized from the brand image (NEO / CAPTA / runner paths + halftone points).
- Fonts (Cairo, Montserrat — OFL) are bundled in `public/fonts`.
- On a machine without Remotion's Chrome, set `REMOTION_BROWSER=/path/to/headless_shell`.

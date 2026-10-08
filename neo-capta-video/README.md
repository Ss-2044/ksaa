# Neo Capta — brand videos (Remotion)

Nine videos (three 16:9, three vertical 9:16 for Reels/TikTok/Stories, three square 1:1 for feed posts), each in Arabic and English, 30 fps, with an original soundtrack.

| Composition | Length | Idea |
|---|---|---|
| `NeoCapta-AR/EN` | 24 s | **From idea to impact** — a dot becomes a halftone grid, assembles the logo, the runner breaks out. |
| `Manifesto-AR/EN` | 20 s | **Move your brand** — a noisy market, one voice heard, three bold slams, the runner sprints into the logo. |
| `Journey-AR/EN` | 22 s | **Your brand's journey** — four process steps (audience → strategy → content → launch) with animated panels. |
| `BeforeAfter-AR/EN` (9:16) | 15 s | **Before / After** — the same post, dull vs. designed by Neo Capta, revealed with a slider. |
| `Brief-AR/EN` (9:16) | 15 s | **The brief** — a client chat ("I have an idea…" → "Leave it to us.") bursts into a full campaign. |
| `Sting-AR/EN` (9:16) | 8 s | **Logo sting** — halftone wave, the logo draws itself, the runner pops in. Intro/outro for posts. |
| `Countdown-AR/EN` (1:1) | 12 s | **Countdown** — halftone 3 · 2 · 1, "GO!", the runner launches into the logo. |
| `Grid-AR/EN` (1:1) | 15 s | **Feed plan** — nine posts flip into a 3×3 grid, then flip again to form one brand image. |
| `Carousel-AR/EN` (1:1) | 17 s | **Services carousel** — five swipeable service cards with a touch gesture. |
| `Story-AR/EN` (+ `StoryVertical`, `StorySquare`) | 17 s | **Story** — "What do we say? How? To whom?" → "this is where the story begins" → CONTENT → STORY → IMPACT → logo, "We turn ideas into stories." |
| `Scroll-AR/EN` (+ `ScrollVertical`, `ScrollSquare`) | 16 s | **Scroll-stopper** — a feed accelerates, hard-stops on the one post that matters: "We make the content that stops the scroll." |
| `BlankPage-AR/EN` (+ `BlankPageVertical`, `BlankPageSquare`) | 16 s | **The blank page** — typed and deleted attempts, the runner dives in, the design builds itself and spreads to every screen. |

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

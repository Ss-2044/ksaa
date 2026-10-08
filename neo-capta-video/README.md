# Neo Capta — "From Idea to Impact" (Remotion)

24 s, 1920×1080, 30 fps. Two compositions: `NeoCapta-AR` (Arabic) and `NeoCapta-EN` (English).

```bash
npm install
npm run studio        # live preview
npm run render        # -> out/neo-capta-ar.mp4, out/neo-capta-en.mp4
```

- Text lives in `src/copy.ts`; scene timing is the `S2…S5` constants in `src/NeoCapta.tsx`.
- `src/logo.json` is the logo vectorized from the brand image (NEO / CAPTA / runner paths + 778 halftone points used by the particles).
- Fonts (Cairo, Montserrat — OFL) are bundled in `public/fonts`.
- On a machine without Remotion's Chrome, set `REMOTION_BROWSER=/path/to/headless_shell`.

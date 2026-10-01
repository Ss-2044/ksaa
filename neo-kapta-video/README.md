# Neo Capta × Diriyah — Remotion videos (3 ideas)

Three 30-second 1920×1080 partnership announcements, each with its own design and original soundtrack:

| Composition | Idea | Output |
|---|---|---|
| `Idea1-Notification` | Told through a phone: notifications → chat → "Accept" | `out/Idea1-Notification.mp4` |
| `Idea2-Constellation` | Stars connect into Diriyah's mountain and a megaphone | `out/Idea2-Constellation.mp4` |
| `Idea3-Arcade` | 8-bit arcade: Player 1 + Player 2 → co-op mode | `out/Idea3-Arcade.mp4` |

```bash
npm install
npm run music    # regenerates public/music-*.wav (needs python3 + numpy)
npm run studio   # live preview
npm run render   # exports all three MP4s
```

If Remotion can't download its browser, add `--browser-executable=/path/to/chrome`.

- Scenes: `src/concepts/*.tsx`, colors: `src/theme.ts`, logos: `public/`
- Script, storyboards, extra ideas, AI video prompts: `CREATIVE_BRIEF.md`

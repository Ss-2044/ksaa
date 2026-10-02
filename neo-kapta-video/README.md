# Neo Capta × Diriyah — Remotion videos (6 ideas + 2 teasers)

Six 30-second 1920×1080 partnership announcements and two 10-second 1080×1920 teasers, each with its own design and original soundtrack:

| Composition | Idea | Output |
|---|---|---|
| `Idea1-Notification` | Told through a phone: notifications → chat → "Accept" | `out/Idea1-Notification.mp4` |
| `Idea2-Constellation` | Stars connect into Diriyah's mountain and a megaphone | `out/Idea2-Constellation.mp4` |
| `Idea3-Arcade` | 8-bit arcade: Player 1 + Player 2 → co-op mode | `out/Idea3-Arcade.mp4` |
| `Idea4-Clay` | Clay wall cracks and shatters into a digital world | `out/Idea4-Clay.mp4` |
| `Idea5-Weather` | TV weather forecast: radar, "100% partnership", breaking news | `out/Idea5-Weather.mp4` |
| `Idea6-Crossword` | Newspaper crossword whose answer is "partnership" | `out/Idea6-Crossword.mp4` |
| `Teaser1-WhoIsIt` | Vertical teaser: Neo Capta × mystery partner | `out/Teaser1-WhoIsIt.mp4` |
| `Teaser2-Tomorrow` | Vertical teaser: 24h countdown + keyhole glimpses | `out/Teaser2-Tomorrow.mp4` |

```bash
npm install
npm run music    # regenerates public/music-*.wav (needs python3 + numpy)
npm run studio   # live preview
npm run render   # exports all MP4s
```

If Remotion can't download its browser, add `--browser-executable=/path/to/chrome`.

- Scenes: `src/concepts/*.tsx`, colors: `src/theme.ts`, logos: `public/`
- Script, storyboards, extra ideas, AI video prompts: `CREATIVE_BRIEF.md`

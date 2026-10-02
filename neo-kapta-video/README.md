# Neo Capta × Diriyah — Remotion videos (13 ideas + 3 teasers)

Thirteen 30-second partnership announcements (twelve 1920×1080, one 1080×1920) and three 10-second 1080×1920 teasers, each with its own design and original soundtrack:

| Composition | Idea | Output |
|---|---|---|
| `Idea1-Notification` | Told through a phone: notifications → chat → "Accept" | `out/Idea1-Notification.mp4` |
| `Idea2-Constellation` | Stars connect into Diriyah's mountain and a megaphone | `out/Idea2-Constellation.mp4` |
| `Idea3-Arcade` | 8-bit arcade: Player 1 + Player 2 → co-op mode | `out/Idea3-Arcade.mp4` |
| `Idea4-Clay` | Clay wall cracks and shatters into a digital world | `out/Idea4-Clay.mp4` |
| `Idea5-Weather` | TV weather forecast: radar, "100% partnership", breaking news | `out/Idea5-Weather.mp4` |
| `Idea6-Crossword` | Newspaper crossword whose answer is "partnership" | `out/Idea6-Crossword.mp4` |
| `Idea7-Puzzle` | Two puzzle pieces click together, then the full picture completes | `out/Idea7-Puzzle.mp4` |
| `Idea8-Coffee` | A dallah pours two cups; the steam writes the news | `out/Idea8-Coffee.mp4` |
| `Idea9-LiveStream` | Vertical: told as a live stream with comments and hearts | `out/Idea9-LiveStream.mp4` |
| `Idea10-TimeHasCome` | Cinematic tour of Diriyah photos + a clock striking twelve: "the time has come"  | `out/Idea10-TimeHasCome.mp4` |
| `Idea11-Doors` | Najdi doors open onto At-Turaif, Al Bujairi, Wadi Hanifa | `out/Idea11-Doors.mp4` |
| `Idea12-Postcards` | Postcards from Diriyah; the last one is a message to the world | `out/Idea12-Postcards.mp4` |
| `Idea13-Viewfinder` | A Neo Capta camera viewfinder shooting Diriyah | `out/Idea13-Viewfinder.mp4` |
| `Teaser1-WhoIsIt` | Vertical teaser: Neo Capta × mystery partner | `out/Teaser1-WhoIsIt.mp4` |
| `Teaser2-Tomorrow` | Vertical teaser: 24h countdown + keyhole glimpses | `out/Teaser2-Tomorrow.mp4` |
| `Teaser3-MissingPiece` | Vertical teaser: a puzzle piece looking for its match | `out/Teaser3-MissingPiece.mp4` |

```bash
npm install
npm run music    # regenerates public/music-*.wav (needs python3 + numpy)
npm run studio   # live preview
npm run render   # exports all MP4s
```

If Remotion can't download its browser, add `--browser-executable=/path/to/chrome`.

- Diriyah photos (ideas 10–13): drop real images in `public/diriyah/` — see the README there; drawn scenes are used until then
- Scenes: `src/concepts/*.tsx`, colors: `src/theme.ts`, logos: `public/`
- Script, storyboards, extra ideas, AI video prompts: `CREATIVE_BRIEF.md`

# Neo Capta — brand video (Remotion)

A 30-second motion video in the Neo Capta palette, rendered as two separate cuts from the same scenes:

- `NeoCaptaAR` renders `neo-capta-ar.mp4`, the Arabic cut (right-to-left).
- `NeoCaptaEN` renders `neo-capta-en.mp4`, the English cut.

Both are 1920×1080 at 30 fps. `neo-capta.mp4` is the earlier bilingual cut, rendered from a previous commit.

All on-screen text for both languages is in `src/lang.tsx`.

## Design 2: Lens

This design is built around "we see the unseen": a scanner lens reveals what is hidden. It has its own story: others see the surface, Neo Capta sees what is underneath. It shares timing and music with design 1, and its copy lives in `lensCopy` in `src/lang.tsx`.

| Scene | English | Arabic |
|---|---|---|
| Hook | They see data. We see people. | هم يشوفون أرقام. وإحنا نشوف الناس. |
| Desert | Others see sand. We see signals. | غيرنا يشوف رمل. وإحنا نشوف إشارات. |
| Shift | ~~Guesswork.~~ → Less noise. More signal. | ~~التخمين.~~ → ضجيج أقل. وضوح أكثر. |
| Pillars | Five lenses. One vision. | خمس عدسات. ورؤية وحدة. |
| Outro | We see the unseen. | نرى ما لا يُرى |

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

## Design 3: Teaser

This design is a cinematic trailer (letterbox, film grain) that builds suspense and holds the logo back until the drop. It has its own story and its own trailer score (`public/audio/teaser.wav`, made by `scripts/make-teaser-music.py`).

- `NeoCaptaTeaserAR` renders `neo-capta-teaser-ar.mp4`.
- `NeoCaptaTeaserEN` renders `neo-capta-teaser-en.mp4`.

| Time | Scene | English | Arabic |
|---|---|---|---|
| 0–2s | A pulsing light over a heartbeat | SIGNAL DETECTED_ | تم رصد إشارة_ |
| 2–6s | One word per hit, with flashes | What if you saw everything? | وش لو تشوف كل شي؟ |
| 6–12s | Glitch cuts over data rain | TRENDS · PEOPLE · PATTERNS · SIGNALS | الترندات · الناس · الأنماط · الإشارات |
| 12–16s | Near silence: a horizon line and a dune | We start where sight ends. | نبدأ من حيث ينتهي النظر. |
| 16–22s | Sand spirals into a point on a riser, then silence | Something different is coming. | شي مختلف… جاي. |
| 22–26s | A braam hit: white flash, shockwave, logo | — | — |
| 26–30s | The official line | We see the unseen. · COMING SOON | نرى ما لا يُرى · قريبًا |

The scenes are in `src/teaser/` and the copy is in `src/teaser/copy.ts`. Run `npm run render:teaser` to render both cuts.

## Design 4: Blink

This is a bright, editorial design built on an eye whose pupil is the Neo Capta logo. Scenes change with eyelid blinks. It has its own copy (`src/blink/copy.ts`) and its own score (`public/audio/blink.wav`, made by `scripts/make-blink-music.py`).

- `NeoCaptaBlinkAR` renders `neo-capta-blink-ar.mp4`.
- `NeoCaptaBlinkEN` renders `neo-capta-blink-en.mp4`.

| Time | Scene | English | Arabic |
|---|---|---|---|
| 0–3s | The eye opens; zoom into the pupil (the logo) | — | — |
| 3–8s | Words grow; the full stop swallows the frame | Look. / Look closer. / Closer. | شوف. / شوف أقرب. / أقرب. |
| 8–14s | Blurred marketing noise; one line comes into focus | In all the noise, we find meaning. | وسط كل هالضجيج، نلقى المعنى. |
| 14–20s | The five services orbit a small eye | New eyes for your brand. | عيون جديدة لعلامتك. |
| 20–26s | The lids slowly close, then darkness | Most brands blink. We don't. → Don't blink. | أغلب العلامات ترمش. إحنا لا. ← لا ترمش. |
| 26–30s | The eye opens on the logo, then a last blink | We see the unseen. | نرى ما لا يُرى |

The scenes are in `src/blink/`. Run `npm run render:blink` to render both cuts.

## Design 5: Bento

This is a product-demo style cut: a smart interface made of cards, with a cursor that types a question and clicks. It has its own copy (`src/bento/copy.ts`) and its own score (`public/audio/bento.wav`, made by `scripts/make-bento-music.py`), with typing and click sounds.

- `NeoCaptaBentoAR` renders `neo-capta-bento-ar.mp4`.
- `NeoCaptaBentoEN` renders `neo-capta-bento-en.mp4`.

| Time | Scene | English | Arabic |
|---|---|---|---|
| 0–3s | Nine cards snap into a grid around the logo card | — | — |
| 3–8s | The cursor clicks the search field and the question is typed | What does my audience really want? | وش يبي جمهوري فعلاً؟ |
| 8–14s | The answer as a bento: insight, chart, focus ring, signal chips, Riyadh | They don't want ads. They want stories. | ما يبون إعلانات. يبون قصص. |
| 14–20s | The cursor lights up the five service cards | One team. Five superpowers. | فريق واحد. خمس قدرات. |
| 20–25s | The cards collapse into one lavender frame | Smarter questions. Sharper answers. | أسئلة أذكى. إجابات أوضح. |
| 25–30s | The frame shrinks into the logo card | We see the unseen. | نرى ما لا يُرى |

The scenes are in `src/bento/`. Run `npm run render:bento` to render both cuts.

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

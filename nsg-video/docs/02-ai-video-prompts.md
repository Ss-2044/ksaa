# برومبتات أدوات الفيديو بالذكاء الاصطناعي — مجموعة نيو للفضاء

انسخ كل برومبت كما هو داخل الأداة. البرومبتات بالإنجليزية لأن هذه الأدوات تفهمها بدقة أعلى.

**قواعد عامة لكل الأدوات**
1. **لا تطلب من الأداة أن ترسم الشعار أو تكتب النص العربي.** هذه الأدوات تشوّه الحروف العربية والشعارات. ولِّد لقطات خلفية نظيفة بدون نص، ثم ضعها في مشروع Remotion وأضف الشعار والنص فوقها.
2. **لقطة الشعار:** استخدم وضع *Image-to-Video* وارفع `public/nsg-logo.png` على خلفية `#22243C` كإطار أول.
3. **الهوية اللونية في كل برومبت:** deep indigo‑navy gradient (#2C2D43 → #16182F), white highlights, soft lavender glow (#9DA2E6).
4. **المقاس:** 16:9 وبدقة 1080p. أنسب مدة لكل لقطة 5–10 ثوانٍ.

**اللقطات الخمس (مطابقة للستوري بورد)**
| # | اللقطة | تُستخدم في المشهد |
|---|---|---|
| A | ولادة النجمة الرباعية ثم ظهور الشعار | 1 — الشعار |
| B | شروق الأرض من المدار | 2 — الافتتاحية |
| C | قمر صناعي للاتصالات يبث الإشارات | 3/4 — عن المجموعة، الاتصالات |
| D | رصد الأرض وتحويل الصور إلى خرائط | 5 — الشركة الوطنية للخدمات الجيومكانية |
| E | كوكبة أقمار الملاحة فوق المملكة | 4/7 — PNT والرؤية |

---

## 1) Runway (Gen‑4 / Gen‑4 Turbo)
> Runway يحب البرومبت القصير والواضح: الموضوع، ثم الحركة، ثم الكاميرا. في وضع Image‑to‑Video صِف **الحركة فقط**، لا الصورة.

**A — الشعار (Image‑to‑Video، الإطار الأول = الشعار)**
```
A tiny four-pointed white star ignites at the center, spins once and settles into the logo; a soft white light sweep glides left to right across the letters. Slow push-in from 1.1x to 1.0x. Deep indigo-navy gradient background, faint twinkling stars, lavender glow. Static camera, premium corporate, 24fps.
```
**B — شروق الأرض**
```
Cinematic orbital shot: the curved horizon of Earth rises slowly from the bottom of frame, a thin bright atmosphere line glowing white-lavender, the sun flaring gently at the edge. Camera cranes up slowly and tilts toward space. Deep navy and indigo palette, minimal, photoreal, IMAX space documentary look. No text.
```
**C — قمر الاتصالات**
```
A sleek white communications satellite glides across frame above Earth's night side; concentric rings of light pulse outward from its antenna toward glowing city lights below. Slow tracking shot from the side, 35mm lens, shallow depth of field. Rim light from a distant sun, deep indigo shadows, cool white highlights. No text.
```
**D — الرصد الجيومكاني**
```
Top-down view of desert terrain and a modern city; a thin horizontal scanning beam sweeps across and leaves a glowing white wireframe map grid with location pins on the ground. Camera slowly descends from high altitude. Indigo-navy color grade, white line work, lavender glow. Clean, technical, elegant. No text.
```
**E — كوكبة الملاحة**
```
Wide shot of Earth from space at dusk, the Arabian Peninsula visible; four satellites in different orbits connect with thin dotted light lines to a single glowing point on the ground. Slow 20-degree orbit around Earth. Deep navy space, crisp white light, soft lavender bloom, photoreal. No text.
```
**الإعدادات:** 16:9 · 10s · Camera Control: Zoom / Crane حسب اللقطة · Seed ثابت لنفس الإحساس عبر اللقطات.

---

## 2) Pika (2.x)
> Pika يتجاوب مع وصف الحركة الواضح، واستخدم **Negative prompt** لإبعاد النص المشوّه. للشعار جرّب ميزة *Pikaframes* (إطار البداية = نجمة، والنهاية = الشعار).

**A — الشعار (Pikaframes: البداية خلفية بنجمة صغيرة ← النهاية الشعار)**
```
A glowing four-point white star grows, spins and transforms into the logo with a bright flash, then a light sweep crosses the logo. Dark indigo gradient background, tiny twinkling stars, soft lavender glow, elegant, smooth motion.
```
**B**
```
Earth's horizon rising from below in deep space, thin glowing atmosphere, gentle sun flare, slow camera crane up, cinematic, navy and indigo tones, ultra realistic.
```
**C**
```
White satellite orbiting above Earth at night, pulsing rings of signal light radiating down to the planet, slow side tracking camera, rim lighting, deep indigo shadows, cinematic.
```
**D**
```
Aerial view of desert city, glowing white scan line sweeps across creating a holographic map grid and pins on the ground, camera slowly descending, navy color grade, futuristic, clean.
```
**E**
```
Satellites connected by dotted light lines to a glowing point on the Arabian Peninsula, Earth from space, slow orbit camera, crisp white light, lavender glow, cinematic.
```
**Negative prompt (لكل اللقطات):**
```
text, letters, watermark, logo distortion, warped shapes, blurry, low quality, oversaturated colors, red, orange, cartoon, flicker, jitter
```
**الإعدادات:** 16:9 · Motion strength 1–2 (هادئة) · Guidance 12–16 · Camera: Zoom in / Pan حسب اللقطة.

---

## 3) Kling (2.x)
> Kling يعطي أفضل نتيجة بالترتيب: **الموضوع + الحركة + المشهد + الكاميرا + الإضاءة + الأجواء**. استخدم وضع *Professional* وميزة *Start/End frame* للشعار.

**A — الشعار (Start frame: نجمة صغيرة، End frame: الشعار)**
```
Subject: a small four-pointed white star of light. Motion: it ignites, rotates 180 degrees, flashes brightly and resolves into the brand logo, followed by a slow light sweep across the letters. Scene: deep indigo-to-navy gradient void with faint twinkling stars. Camera: locked-off, subtle push-in. Lighting: soft white bloom, lavender halo. Atmosphere: premium, calm, confident.
```
**B**
```
Subject: Earth seen from low orbit. Motion: the curved horizon slowly rises into frame, clouds drift, a thin atmosphere line glows. Scene: black-navy space with sparse stars. Camera: slow crane up with gentle forward dolly, 24mm lens. Lighting: sunrise rim light on the atmosphere, cool white and lavender. Atmosphere: awe, beginning of a journey, cinematic documentary.
```
**C**
```
Subject: a modern white communications satellite with solar panels. Motion: it glides from right to left while concentric rings of light pulse from its antenna down to Earth's glowing cities. Scene: Earth night side below, deep space above. Camera: side tracking shot, 50mm, shallow depth of field. Lighting: hard rim light from the sun, deep indigo shadows. Atmosphere: connected, high-tech, reliable.
```
**D**
```
Subject: desert landscape and a modern Saudi city seen from above. Motion: a thin bright scan line sweeps horizontally, leaving a glowing white wireframe map grid, terrain contours and location pins. Scene: dusk, clean and minimal. Camera: slow descending top-down drone shot that tilts to 45 degrees. Lighting: soft blue-hour light, white holographic lines, lavender bloom. Atmosphere: precise, intelligent, insightful.
```
**E**
```
Subject: four navigation satellites in different orbits around Earth. Motion: thin dotted light lines connect each satellite to one glowing point on the Arabian Peninsula, a time-sync pulse ripples outward. Scene: Earth from space at dusk. Camera: slow 20-degree orbit around the planet. Lighting: crisp white highlights, deep navy space, lavender glow. Atmosphere: accurate, vast, visionary.
```
**Negative prompt:** `text, subtitles, watermark, distorted logo, deformed satellite, low resolution, flicker, warm orange tones`
**الإعدادات:** 16:9 · 10s · Professional mode · Creativity/Relevance ≈ 0.5 · Camera: Crane / Orbit / Dolly حسب اللقطة.

---

## 4) Sora (Sora 2)
> Sora يفهم الوصف السينمائي المفصّل وقوائم اللقطات. اكتب مثل مخرج: نوع اللقطة، العدسة، الإضاءة، الحركة، والأسلوب. ويمكن طلب الصوت أيضاً.

**A — الشعار (أرفق صورة الشعار كمرجع)**
```
Style: premium corporate title sequence, minimal and elegant, 16:9.
Shot 1 (0–1.5s): Locked-off frame of a deep indigo-to-navy gradient void (#2C2D43 to #16182F) with faint twinkling stars. A tiny four-pointed white star ignites in the center and spins.
Shot 2 (1.5–3s): The star flies up-left to its place in the attached logo, a soft white flash fills the frame, the logo resolves from a blur, and a narrow light sweep glides across it. Subtle push-in 1.1x→1.0x.
Lighting: soft white bloom with a lavender (#9DA2E6) halo. Keep the logo exactly as in the reference image; do not add any other text.
Audio: a low ambient synth swell rising into a soft shimmering chime on the flash.
```
**B**
```
Cinematic space documentary shot, 24mm lens, 16:9. The camera floats in low Earth orbit and cranes slowly upward as the curved horizon of Earth rises from the bottom of frame. A razor-thin atmosphere glows white-lavender; the sun peeks over the edge with a gentle anamorphic flare. Palette: deep navy and indigo, white highlights. Slow, majestic motion, photoreal, no text. Audio: deep ambient pad, distant airy wind.
```
**C**
```
Medium tracking shot, 50mm, shallow depth of field. A sleek white communications satellite glides right to left above Earth's night side. Concentric rings of soft white light pulse from its antenna and travel down to the glowing city lights below, which brighten as each ring arrives. Hard rim light from an off-screen sun, deep indigo shadows. Photoreal, elegant, no text. Audio: subtle rhythmic data pulses under an ambient pad.
```
**D**
```
Aerial drone shot at blue hour over a desert landscape meeting a modern Saudi city. The camera descends slowly while tilting from top-down to 45 degrees. A bright horizontal scan line sweeps the land, leaving a white holographic wireframe grid, terrain contour lines and glowing location pins. Navy color grade, white line work, lavender bloom. Precise and intelligent mood, no text. Audio: soft scanning hum and gentle UI blips.
```
**E**
```
Wide shot of Earth from space at dusk with the Arabian Peninsula centered. Four navigation satellites sit in different orbits; thin dotted lines of light connect each one to a single glowing point on the ground, and a circular time-sync pulse ripples outward. The camera slowly orbits 20 degrees around the planet. Deep navy space, crisp white light, lavender glow, photoreal, visionary, no text. Audio: rising ambient chord resolving at the end.
```

---

## 5) Veo (Veo 3)
> Veo يقبل برومبت منظّماً بالحقول، ويولّد الصوت والمؤثرات. اكتب حقل **Audio** دائماً، وأضف «no on-screen text» لتجنب الحروف المشوّهة.

**A — الشعار (Image‑to‑Video مع صورة الشعار)**
```
Shot: logo reveal, 16:9, 8 seconds.
Subject: a four-pointed white star that becomes the provided NSG logo.
Action: the star ignites at frame center, spins, flies to its position in the logo, a soft white flash, the logo sharpens from blur, then a thin light sweep crosses the letters.
Camera: static, gentle push-in.
Lighting: white bloom, lavender (#9DA2E6) halo.
Background: deep indigo-to-navy gradient (#2C2D43 → #16182F) with faint twinkling stars.
Style: premium minimal corporate motion design.
Audio: low synth swell, airy shimmer on the flash, soft reverb tail. No voice.
Constraints: keep the logo identical to the reference, no additional on-screen text.
```
**B**
```
Shot: wide establishing shot, 16:9, 8 seconds.
Subject: Earth's curved horizon from low orbit.
Action: horizon slowly rises into frame, clouds drift, atmosphere line glows, sun peeks over the edge.
Camera: slow crane up with slight forward dolly, 24mm lens.
Lighting: sunrise rim light, cool white and lavender tones.
Style: photoreal IMAX space documentary, deep navy palette.
Audio: deep ambient pad, faint cosmic wind. No voice, no on-screen text.
```
**C**
```
Shot: medium tracking shot, 16:9, 8 seconds.
Subject: sleek white communications satellite with solar panels.
Action: glides right to left; concentric light rings pulse from its antenna down to Earth's glowing cities, which brighten on contact.
Camera: side tracking, 50mm, shallow depth of field.
Lighting: hard sun rim light, deep indigo shadows.
Style: photoreal, elegant, high-tech.
Audio: soft rhythmic data pulses, low hum. No voice, no on-screen text.
```
**D**
```
Shot: aerial drone shot, 16:9, 8 seconds.
Subject: desert landscape meeting a modern Saudi city at blue hour.
Action: a bright scan line sweeps horizontally, leaving a white holographic map grid, contour lines and glowing pins.
Camera: slow descent, tilting from top-down to 45 degrees.
Lighting: blue-hour ambient light, white holographic lines, lavender bloom.
Style: clean futuristic geospatial visualization, navy grade.
Audio: scanning hum, gentle interface blips. No voice, no on-screen text.
```
**E**
```
Shot: wide space shot, 16:9, 8 seconds.
Subject: Earth at dusk with the Arabian Peninsula centered and four navigation satellites.
Action: dotted light lines link each satellite to one glowing ground point; a circular time-sync pulse ripples outward.
Camera: slow 20-degree orbit around the planet.
Lighting: crisp white highlights, lavender glow, deep navy space.
Style: photoreal, visionary.
Audio: rising ambient chord that resolves softly. No voice, no on-screen text.
```

---

## دمج اللقطات المولّدة في مشروع Remotion
1. ضع ملفات الفيديو في `public/` (مثال: `public/shot-b.mp4`).
2. داخل المشهد المناسب أضف خلف النص:
   ```tsx
   import {OffthreadVideo, staticFile} from 'remotion';
   <OffthreadVideo src={staticFile('shot-b.mp4')} muted style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85}} />
   ```
3. أعد التصدير: `npm run render` (30 ث) أو `npm run render:60` (60 ث).

# NSG Video — مشروع Remotion لمجموعة نيو للفضاء

فيديو تعريفي ثنائي اللغة (عربي/إنجليزي) بألوان هوية مجموعة نيو للفضاء: خلفية متدرجة من `#2C2D43` إلى `#16182F` مع نصوص وشعار باللون الأبيض.

| التركيبة | المدة | الملف |
|---|---|---|
| `NSG30` | 30 ثانية (900 إطار) | `out/nsg-30s.mp4` |
| `NSG60` | 60 ثانية (1800 إطار) | `out/nsg-60s.mp4` |
| `NSG30B` | 30 ثانية — التصميم الثاني | `out/nsg-B-30s.mp4` |
| `NSG60B` | 60 ثانية — التصميم الثاني | `out/nsg-B-60s.mp4` |
| `Clip-pixel` · `Clip-zoom` · `Clip-orbit` · `Clip-layers` | 20 ثانية لكل مقطع — فضاء وبيانات جيومكانية | `out/clip-*.mp4` (السيناريوهات في `docs/03-clips-scenarios.md`) |
| `Clip-memory` · `Clip-night` · `Clip-art` · `Clip-map` | 20 ثانية — صور فضائية حقيقية (NASA) وخرائط (OpenStreetMap) وموسيقى Kevin MacLeod | `out/clip-*.mp4` (السيناريوهات في `docs/04-photo-clips-scenarios.md`، والحقوق في `CREDITS.md`) |
| `Clip-riyadh` · `Clip-pixels` · `Clip-cloud` · `Clip-coast` · `Clip-road` | 20 ثانية — الدفعة الثالثة | `out/clip-*.mp4` (`docs/05-more-clips.md`) |
| `Clip-globe` · `Clip-mosaic` · `Clip-numbers` · `Clip-circles` | 20 ثانية — **التصميم C**: فاتح تحريري + كرة أرضية ثلاثية الأبعاد (`npm run render:c`) | `out/clip-*.mp4` (`docs/06-design-c.md`) |
| `Vertical-<اسم>` | نسخة 9:16 (1080×1920) لكل مقطع | `out/vertical/vertical-*.mp4` |

1920×1080 · 30fps · H.264.

### التصميمان
- **التصميم A** (`src/scenes`): سينمائي هادئ — تدرّج ناعم، نجوم، كوكب، بطاقات زجاجية، انتقالات تلاشٍ، موسيقى Ambient (`public/ambient.mp3`).
- **التصميم B** (`src/designB`): حركي تحريري (Kinetic / Editorial) — خلفية بقطع قطري حاد وشبكة تقنية وحلقات مدارية تنبض مع الإيقاع، كلمات عربية ضخمة، صفحة بيضاء معكوسة، أرقام مفرّغة كبيرة، رادار جيومكاني، ومسحات بيضاء. القطعات متزامنة مع **موسيقى أصلية** 120 BPM (كل نبضة = 15 إطاراً) مولّدة بالكود في `scripts/make-music.mjs` — بدون أي حقوق ملكية. أعد توليدها بـ `npm run music`.

## التشغيل
```bash
npm install
npm run studio      # معاينة وتعديل في المتصفح
npm run render      # تصدير 30 ثانية
npm run render:60   # تصدير 60 ثانية
npm run render:b    # التصميم الثاني 30 ثانية
npm run render:b60  # التصميم الثاني 60 ثانية
npm run render:clips # كل المقاطع القصيرة (16:9)
npm run render:vertical # النسخ الرأسية 9:16
```
> في بيئة لا يتوفر فيها Chrome أضف: `--browser-executable=/path/to/chrome`

## البنية
```
src/
  Root.tsx            التركيبتان NSG30 و NSG60
  timelines.ts        توقيت المشاهد لكل نسخة (عدّل المدد من هنا)
  theme.ts            الألوان والخطوط
  Video.tsx           الخلفية + المشاهد + الصوت
  components/         الخلفية والنجوم، النجمة الرباعية، النصوص المتحركة، البطاقات، الرسومات (كوكب، مدار، إشارات، شبكة خرائط، ملاحة)
  scenes/             LogoIntro · Hook · About · Sectors · Geo · Services · Vision · Outro
public/
  nsg-logo.png        الشعار (أبيض بخلفية شفافة)
  ambient.mp3         الموسيقى
docs/
  01-script-storyboard.md   السكربت والستوري بورد والعناوين
  02-ai-video-prompts.md    برومبتات Runway / Pika / Kling / Sora / Veo
```

## ملاحظات
- النص العربي يتحرك **كلمةً كلمة** حتى لا ينكسر اتصال الحروف.
- الشعار مستخرج من لقطة الشاشة بدقة منخفضة؛ للحصول على أعلى جودة استبدل `public/nsg-logo.png` بنسخة SVG/PNG رسمية بنفس الاسم.
- راجع المعلومات عن المجموعة والشركة الوطنية للخدمات الجيومكانية مع المصادر الرسمية قبل النشر.

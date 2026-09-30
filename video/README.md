# NEO CAPTA — فيديو ترويجي (Remotion, 40 ثانية)

فيديو عمودي 1080×1920، 30 fps، **بدون صوت** — الكلام نصوص متحركة عربي/إنجليزي بألوان شعار نيو كابتا
(أزرق ملكي، فضي، أسود مع نقاط halftone).

## التشغيل / Usage

```bash
npm install
npm run studio   # معاينة وتعديل
npm run render   # تصدير -> out/neocapta-promo.mp4
```

النسخة المصدّرة موجودة أيضاً في `neocapta-promo.mp4`.
If Remotion can't download Chrome: `REMOTION_BROWSER=/path/to/chrome npm run render`.

## السيناريو (`src/timeline.json`)

| الوقت | المشهد |
|---|---|
| 0–2s | تقليب الـ iPad |
| 2–11.5s | مونتاج سريع: إعلان، خريطة، أرقام، سوشال ميديا، مطعم، منتج نيو كابتا، شخص يشاهد إعلان (صورتك)، حملة على لوحة إعلانية، Graph يرتفع، فكرة على ورقة |
| 11.5–17.3s | "Every idea starts somewhere." — كل فكرة تبدأ من مكانٍ ما |
| 17.3–21.3s | لقطة الوجه (صورتك) مع تقريب سينمائي |
| 21.3–26.3s | "But not every idea knows where to go." — لكن ليست كل فكرة تعرف إلى أين تذهب |
| 26.3–29.7s | الجواب: شعار نيو كابتا + "We give every idea a direction." — نحن نمنح كل فكرة وجهتها |
| 29.7–36s | توقيع شراكة استراتيجية مع جهة حكومية: الطرفان ← الاتفاقية ← التوقيع ← الختم ← فلاشات |
| 36–40s | شعار نيو كابتا + "لكل فكرة وجهة / Every idea, a direction" |

## Assets (`public/`)

- `neocapta-logo.png` — الشعار مفرّغ من الخلفية
- `me.jpg` — صورة الوجه
- `ipad.webp`, `cabin.png` — الصور المرسلة

لتبديل شعار الشريك: عدّل `PartnerEmblem` في `src/scenes/PartnershipScene.tsx` (حالياً رمز عام، ليس شعار جهة حقيقية).

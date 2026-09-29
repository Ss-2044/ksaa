import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// في الإنتاج اضبط UPLOAD_DIR على مجلد في قرص دائم (مثل /data/uploads)
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");
const MAX_BYTES = 12 * 1024 * 1024;

type Preset = "product" | "avatar" | "banner";

const PRESETS: Record<Preset, { full: [number, number, "inside" | "cover"]; thumb?: [number, number] }> = {
  product: { full: [1600, 1600, "inside"], thumb: [480, 480] },
  avatar: { full: [320, 320, "cover"] },
  banner: { full: [2000, 800, "inside"] },
};

/**
 * يضغط الصورة المرفوعة ويحولها إلى WebP بجودة عالية بصريًا وحجم صغير.
 * يُزيل بيانات EXIF (ومنها الموقع الجغرافي) ويصحح اتجاه الصورة.
 */
export async function processImage(file: File, preset: Preset) {
  if (!file || file.size === 0) throw new Error("لم يتم اختيار صورة");
  if (file.size > MAX_BYTES) throw new Error("حجم الصورة أكبر من 12 ميجابايت");
  if (!file.type.startsWith("image/")) throw new Error("الملف ليس صورة");

  const input = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(input).metadata().catch(() => null);
  if (!meta?.format) throw new Error("تعذر قراءة الصورة");

  await mkdir(UPLOAD_DIR, { recursive: true });
  const id = randomUUID();
  const cfg = PRESETS[preset];
  const [w, h, fit] = cfg.full;

  const full = await sharp(input)
    .rotate()
    .resize(w, h, { fit, withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();
  const fullName = `${id}.webp`;
  await writeFile(path.join(UPLOAD_DIR, fullName), full);

  let thumbName = fullName;
  if (cfg.thumb) {
    const thumb = await sharp(input)
      .rotate()
      .resize(cfg.thumb[0], cfg.thumb[1], { fit: "cover", withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer();
    thumbName = `${id}_t.webp`;
    await writeFile(path.join(UPLOAD_DIR, thumbName), thumb);
  }

  return { url: `/uploads/${fullName}`, thumbUrl: `/uploads/${thumbName}` };
}

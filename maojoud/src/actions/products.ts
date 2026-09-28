"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { BROKEN_CONDITION, BROKEN_WARNING, DESCRIPTION_MAX, MAX_IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";
import { processImage } from "@/lib/images";

const schema = z.object({
  categoryId: z.string().min(1, "اختر القسم"),
  title: z.string().trim().min(3, "اكتب اسم السلعة كاملًا").max(120, "اسم السلعة طويل جدًا"),
  condition: z.string().min(1, "حدد حالة السلعة"),
  description: z.string().trim().min(1, "اكتب وصفًا مختصرًا").max(DESCRIPTION_MAX, `الوصف ${DESCRIPTION_MAX} حرف بالكثير`),
  price: z.coerce.number({ message: "أدخل السعر" }).positive("أدخل السعر").max(1_000_000, "السعر غير منطقي"),
});

export type ProductState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

export async function createProduct(_: ProductState, form: FormData): Promise<ProductState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/sell");

  const parsed = schema.safeParse(Object.fromEntries(["categoryId", "title", "condition", "description", "price"].map((k) => [k, form.get(k) ?? ""])));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { fieldErrors };
  }
  const data = parsed.data;
  if (data.condition === BROKEN_CONDITION) return { fieldErrors: { condition: BROKEN_WARNING } };
  if (!["NEW", "LIKE_NEW", "GOOD"].includes(data.condition)) return { fieldErrors: { condition: "حدد حالة السلعة" } };

  const category = await db.category.findFirst({ where: { id: data.categoryId, active: true } });
  if (!category) return { fieldErrors: { categoryId: "اختر القسم" } };

  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { fieldErrors: { images: "أضف صورة واحدة على الأقل" } };
  if (files.length > MAX_IMAGES) return { fieldErrors: { images: `الحد الأقصى ${MAX_IMAGES} صور` } };

  let images: { url: string; thumbUrl: string }[];
  try {
    // الترتيب كما رتبه البائع — أول صورة هي الصورة الرئيسية
    images = await Promise.all(files.map((f) => processImage(f, "product")));
  } catch (e) {
    return { fieldErrors: { images: (e as Error).message } };
  }

  const product = await db.product.create({
    data: {
      sellerId: user.id,
      categoryId: category.id,
      title: data.title,
      description: data.description,
      condition: data.condition,
      priceHalalas: Math.round(data.price * 100),
      images: { create: images.map((img, position) => ({ ...img, position })) },
    },
  });
  revalidatePath("/");
  redirect(`/products/${product.id}`);
}

export async function deleteProduct(productId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "يجب تسجيل الدخول" };
  const { count } = await db.product.updateMany({
    where: { id: productId, sellerId: user.id, status: "ACTIVE", OR: [{ reservedUntil: null }, { reservedUntil: { lt: new Date() } }] },
    data: { status: "DELETED" },
  });
  if (count === 0) return { error: "لا يمكن حذف هذه السلعة الآن" };
  await db.cartItem.deleteMany({ where: { productId } });
  revalidatePath(`/users/${user.id}`);
  revalidatePath("/");
  return { ok: true };
}

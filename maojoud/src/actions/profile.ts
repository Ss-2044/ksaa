"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { processImage } from "@/lib/images";

export type EditState = { ok?: boolean; error?: string } | undefined;

export async function updateProfile(_: EditState, form: FormData): Promise<EditState> {
  const user = await getCurrentUser();
  if (!user) return { error: "يجب تسجيل الدخول" };
  const name = z.string().trim().min(2).max(60).safeParse(form.get("name"));
  if (!name.success) return { error: "الاسم الكامل مطلوب" };

  let avatarUrl = user.avatarUrl;
  const avatar = form.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    try {
      avatarUrl = (await processImage(avatar, "avatar")).url;
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  await db.user.update({ where: { id: user.id }, data: { name: name.data, avatarUrl } });
  revalidatePath("/", "layout");
  return { ok: true };
}

const reviewSchema = z.object({
  orderId: z.string().min(1),
  sellerId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export type ReviewState = { ok?: boolean; error?: string } | undefined;

// يقيّم المشتري البائع بعد استلام الطلب — التقييم على ملف البائع
export async function submitReview(_: ReviewState, form: FormData): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) return { error: "يجب تسجيل الدخول" };
  const parsed = reviewSchema.safeParse({
    orderId: form.get("orderId"),
    sellerId: form.get("sellerId"),
    rating: form.get("rating"),
    comment: form.get("comment") || undefined,
  });
  if (!parsed.success) return { error: "اختر عدد النجوم" };
  const { orderId, sellerId, rating, comment } = parsed.data;

  const order = await db.order.findFirst({
    where: { id: orderId, buyerId: user.id, status: "DELIVERED", items: { some: { sellerId } } },
  });
  if (!order) return { error: "يمكنك التقييم بعد استلام الطلب" };

  try {
    await db.review.create({ data: { orderId, sellerId, buyerId: user.id, rating, comment: comment || null } });
  } catch {
    return { error: "سبق أن قيّمت هذا البائع لهذا الطلب" };
  }
  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/users/${sellerId}`);
  return { ok: true };
}

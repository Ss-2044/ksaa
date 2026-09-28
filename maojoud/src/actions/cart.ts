"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

async function userOrLogin(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

async function buyableProduct(productId: string, userId: string) {
  const p = await db.product.findUnique({ where: { id: productId }, select: { id: true, status: true, sellerId: true } });
  if (!p || p.status !== "ACTIVE" || p.sellerId === userId) return null;
  return p;
}

export async function addToCart(productId: string) {
  const user = await userOrLogin(`/products/${productId}`);
  if (!(await buyableProduct(productId, user.id))) return { error: "السلعة غير متاحة" };
  await db.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    create: { userId: user.id, productId },
    update: {},
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function buyNow(productId: string) {
  const user = await userOrLogin(`/products/${productId}`);
  if (!(await buyableProduct(productId, user.id))) return { error: "السلعة غير متاحة" };
  redirect(`/checkout?buy=${productId}`);
}

export async function removeFromCart(productId: string) {
  const user = await userOrLogin("/cart");
  await db.cartItem.deleteMany({ where: { userId: user.id, productId } });
  revalidatePath("/", "layout");
}

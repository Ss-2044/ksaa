"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminBase, requireAdmin } from "@/lib/admin";
import { ADMIN_ORDER_STATUSES } from "@/lib/constants";
import { db } from "@/lib/db";
import { processImage } from "@/lib/images";
import { normalizeSaudiPhone } from "@/lib/phone";
import { clearSession, setSession } from "@/lib/session";

// ——— تسجيل الدخول ———

const attempts = new Map<string, { count: number; until: number }>();
// hash ثابت لمقارنة وهمية عند عدم وجود المستخدم (يمنع كشف أسماء المستخدمين بفارق التوقيت)
let dummyHash: string | undefined;

export type LoginState = { error?: string } | undefined;

export async function adminLogin(_: LoginState, form: FormData): Promise<LoginState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const a = attempts.get(ip);
  if (a && a.count >= 5 && a.until > Date.now()) return { error: "محاولات كثيرة، حاول بعد 15 دقيقة" };

  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const admin = username ? await db.admin.findUnique({ where: { username } }) : null;
  dummyHash ??= await bcrypt.hash("not-a-real-password", 12);
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? dummyHash);

  if (!admin || !ok) {
    const next = a && a.until > Date.now() ? a.count + 1 : 1;
    attempts.set(ip, { count: next, until: Date.now() + 15 * 60 * 1000 });
    return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
  }
  attempts.delete(ip);
  await setSession("admin", admin.id);
  redirect(adminBase());
}

export async function adminLogout() {
  await clearSession("admin");
  redirect(`${adminBase()}/login`);
}

// ——— المستخدمون ———

const userSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(60),
  gender: z.enum(["MALE", "FEMALE"]),
  email: z.union([z.literal(""), z.email("بريد غير صحيح")]),
  phone: z.string(),
});

export type AdminFormState = { ok?: boolean; error?: string } | undefined;

export async function adminUpdateUser(userId: string, _: AdminFormState, form: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = userSchema.safeParse({
    name: form.get("name"),
    gender: form.get("gender"),
    email: form.get("email") ?? "",
    phone: form.get("phone") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const phone = normalizeSaudiPhone(parsed.data.phone);
  if (!phone) return { error: "رقم الجوال غير صحيح" };
  const clash = await db.user.findFirst({ where: { phone, id: { not: userId } } });
  if (clash) return { error: "رقم الجوال مستخدم لحساب آخر" };

  const data: { name: string; gender: string; email: string | null; phone: string; avatarUrl?: string | null } = {
    name: parsed.data.name,
    gender: parsed.data.gender,
    email: parsed.data.email || null,
    phone,
  };
  if (form.get("removeAvatar") === "on") data.avatarUrl = null;
  await db.user.update({ where: { id: userId }, data });
  revalidatePath("/", "layout");
  return { ok: true };
}

// ——— الطلبات ———

export async function adminSetOrderStatus(orderId: string, form: FormData) {
  await requireAdmin();
  const status = String(form.get("status"));
  if (!(ADMIN_ORDER_STATUSES as readonly string[]).includes(status)) return;
  // لا تتغير حالة طلب لم يُدفع
  await db.order.updateMany({ where: { id: orderId, paidAt: { not: null } }, data: { status } });
  revalidatePath(`${adminBase()}/orders`);
}

// ——— محتوى المنصة ———

export async function adminAddBanner(_: AdminFormState, form: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "اختر صورة البانر" };
  let url: string;
  try {
    url = (await processImage(file, "banner")).url;
  } catch (e) {
    return { error: (e as Error).message };
  }
  const link = String(form.get("link") ?? "").trim();
  if (link && !link.startsWith("/") && !/^https:\/\//.test(link)) return { error: "الرابط يجب أن يبدأ بـ / أو https://" };
  // البانر الجديد يصبح المعروض في الصفحة الرئيسية
  await db.$transaction([
    db.banner.updateMany({ data: { active: false } }),
    db.banner.create({ data: { imageUrl: url, link: link || null, alt: String(form.get("alt") ?? "").trim(), active: true } }),
  ]);
  revalidatePath("/");
  return { ok: true };
}

export async function adminActivateBanner(id: string) {
  await requireAdmin();
  await db.$transaction([db.banner.updateMany({ data: { active: false } }), db.banner.update({ where: { id }, data: { active: true } })]);
  revalidatePath("/");
  revalidatePath(`${adminBase()}/content`);
}

export async function adminDeleteBanner(id: string) {
  await requireAdmin();
  await db.banner.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath(`${adminBase()}/content`);
}

const categorySchema = z.object({
  name: z.string().trim().min(2, "اسم القسم مطلوب").max(40),
  slug: z.string().trim().regex(/^[a-z0-9-]{2,40}$/, "المعرّف بالإنجليزية الصغيرة والأرقام و - فقط"),
  icon: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export async function adminSaveCategory(id: string | null, _: AdminFormState, form: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: form.get("name"),
    slug: form.get("slug"),
    icon: form.get("icon"),
    sortOrder: form.get("sortOrder") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const active = form.get("active") === "on";
  try {
    if (id) await db.category.update({ where: { id }, data: { ...parsed.data, active } });
    else await db.category.create({ data: { ...parsed.data, active: true } });
  } catch {
    return { error: "المعرّف مستخدم لقسم آخر" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

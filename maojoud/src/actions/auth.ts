"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sendOtp, verifyOtp } from "@/lib/authentica";
import { db } from "@/lib/db";
import { processImage } from "@/lib/images";
import { normalizeSaudiPhone } from "@/lib/phone";
import { clearSession, readSession, setSession } from "@/lib/session";

export async function requestOtp(rawPhone: string) {
  const phone = normalizeSaudiPhone(rawPhone);
  if (!phone) return { ok: false as const, error: "أدخل رقم جوال سعودي صحيح يبدأ بـ 05" };
  const r = await sendOtp(phone);
  if (!r.ok) return { ok: false as const, error: r.error };
  return { ok: true as const, phone, devCode: r.devCode };
}

export async function verifyCode(phone: string, code: string) {
  const normalized = normalizeSaudiPhone(phone);
  if (!normalized) return { ok: false as const, error: "رقم الجوال غير صحيح" };
  if (!(await verifyOtp(normalized, code))) return { ok: false as const, error: "رمز التحقق غير صحيح أو منتهي" };

  const user = await db.user.findUnique({ where: { phone: normalized } });
  if (user) {
    await setSession("user", user.id);
    return { ok: true as const, next: "done" as const };
  }
  await setSession("signup", normalized);
  return { ok: true as const, next: "profile" as const };
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "الاسم الكامل مطلوب").max(60, "الاسم طويل جدًا"),
  gender: z.enum(["MALE", "FEMALE"], { message: "اختر الجنس" }),
  email: z.union([z.literal(""), z.email("البريد الإلكتروني غير صحيح").max(120)]),
});

export type ProfileState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

export async function completeProfile(_: ProfileState, form: FormData): Promise<ProfileState> {
  const phone = await readSession("signup");
  if (!phone) return { error: "انتهت صلاحية التحقق، أعد إدخال رقم الجوال" };

  const parsed = profileSchema.safeParse({
    name: form.get("name"),
    gender: form.get("gender"),
    email: form.get("email") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { fieldErrors };
  }

  let avatarUrl: string | null = null;
  const avatar = form.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    try {
      avatarUrl = (await processImage(avatar, "avatar")).url;
    } catch (e) {
      return { fieldErrors: { avatar: (e as Error).message } };
    }
  }

  const user = await db.user.upsert({
    where: { phone },
    create: { phone, name: parsed.data.name, gender: parsed.data.gender, email: parsed.data.email || null, avatarUrl },
    update: {},
  });
  await clearSession("signup");
  await setSession("user", user.id);
  redirect(safeNext(String(form.get("next") ?? "")));
}

export async function logout() {
  await clearSession("user");
  redirect("/");
}

function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

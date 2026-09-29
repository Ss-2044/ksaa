import "server-only";
import { createHash, randomInt } from "node:crypto";
import { db } from "./db";
import { allowFallbacks, authenticaEnabled, otpLength } from "./env";

// تكامل Authentica لإرسال رمز التحقق — https://api.authentica.sa/api/v2
const BASE = "https://api.authentica.sa/api/v2";
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

async function call<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Authorization": process.env.AUTHENTICA_API_KEY!,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return (await res.json().catch(() => ({}))) as T;
}

const hash = (phone: string, code: string) =>
  createHash("sha256").update(`${phone}:${code}:${process.env.SESSION_SECRET}`).digest("hex");

export type SendResult = { ok: true; devCode?: string } | { ok: false; error: string };

export async function sendOtp(phone: string): Promise<SendResult> {
  const now = Date.now();
  const recent = await db.otpRequest.findMany({
    where: { phone, createdAt: { gte: new Date(now - 60 * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
  });
  if (recent[0] && now - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return { ok: false, error: "يرجى الانتظار دقيقة قبل طلب رمز جديد" };
  }
  if (recent.length >= MAX_SENDS_PER_HOUR) {
    return { ok: false, error: "تجاوزت الحد المسموح من المحاولات، حاول لاحقًا" };
  }

  if (authenticaEnabled()) {
    const r = await call<{ success?: boolean; message?: string }>("/send-otp", {
      method: "sms",
      phone,
      template_id: Number(process.env.AUTHENTICA_TEMPLATE_ID || 1),
    });
    if (!r.success) {
      console.error("[authentica] send-otp failed:", r.message);
      return { ok: false, error: "تعذر إرسال رمز التحقق، حاول مرة أخرى" };
    }
    await db.otpRequest.create({ data: { phone, expiresAt: new Date(now + OTP_TTL_MS) } });
    return { ok: true };
  }

  if (!allowFallbacks()) {
    console.error("[authentica] AUTHENTICA_API_KEY is not set");
    return { ok: false, error: "خدمة رسائل التحقق غير مهيأة" };
  }

  // وضع التطوير/العرض التجريبي: رمز محلي يُطبع في سجل الخادم ويظهر على الشاشة
  const len = otpLength();
  const code = String(randomInt(0, 10 ** len)).padStart(len, "0");
  await db.otpRequest.create({
    data: { phone, codeHash: hash(phone, code), expiresAt: new Date(now + OTP_TTL_MS) },
  });
  console.log(`[dev-otp] ${phone} → ${code}`);
  return { ok: true, devCode: code };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  if (!/^\d{4,8}$/.test(code)) return false;
  const req = await db.otpRequest.findFirst({
    where: { phone, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!req || req.attempts >= MAX_VERIFY_ATTEMPTS) return false;
  await db.otpRequest.update({ where: { id: req.id }, data: { attempts: { increment: 1 } } });

  let ok = false;
  if (authenticaEnabled()) {
    const r = await call<{ status?: boolean; message?: string }>("/verify-otp", { phone, otp: code });
    ok = r.status === true;
  } else if (allowFallbacks() && req.codeHash) {
    ok = req.codeHash === hash(phone, code);
  }

  if (ok) await db.otpRequest.update({ where: { id: req.id }, data: { expiresAt: new Date() } });
  return ok;
}

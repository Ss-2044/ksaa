import "server-only";

// تكامل مُيسر — https://api.moyasar.com/v1
export type MoyasarPayment = {
  id: string;
  status: "initiated" | "paid" | "failed" | "authorized" | "captured" | "refunded" | "voided";
  amount: number; // هللات
  currency: string;
  metadata?: Record<string, string> | null;
  source?: { type?: string; company?: string; message?: string; response_code?: string };
};

export async function fetchPayment(id: string): Promise<MoyasarPayment | null> {
  if (!/^[\w-]{8,64}$/.test(id)) return null;
  const key = process.env.MOYASAR_SECRET_KEY;
  if (!key) return null;
  const res = await fetch(`https://api.moyasar.com/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as MoyasarPayment;
}

// رسائل عربية لأشهر رموز رفض البطاقات
const DECLINE_MESSAGES: Record<string, string> = {
  "14": "رقم البطاقة غير صحيح",
  "51": "الرصيد غير كافٍ",
  "54": "البطاقة منتهية الصلاحية",
  "55": "الرقم السري غير صحيح",
  "82": "رمز التحقق CVV غير صحيح",
  "96": "خطأ في النظام، حاول مرة أخرى",
};

export function declineMessage(p: MoyasarPayment | null) {
  const code = p?.source?.response_code;
  return (code && DECLINE_MESSAGES[code]) || "لم تتم عملية الدفع، يرجى المحاولة مرة أخرى";
}

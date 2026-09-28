"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isProd, moyasarEnabled } from "@/lib/env";
import { CheckoutError, createPendingOrder, fulfillOrder } from "@/lib/orders";
import { normalizeSaudiPhone } from "@/lib/phone";

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "اسم المستلم مطلوب").max(60),
  phone: z.string().trim().min(1, "جوال المستلم مطلوب"),
  city: z.string().trim().min(2, "المدينة مطلوبة").max(40),
  district: z.string().trim().min(2, "الحي مطلوب").max(60),
  street: z.string().trim().min(2, "الشارع مطلوب").max(100),
  details: z.string().trim().max(200).optional(),
});

export type CheckoutState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

export async function startCheckout(_: CheckoutState, form: FormData): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const method = form.get("method");
  if (method !== "applepay" && method !== "creditcard") return { fieldErrors: { method: "اختر طريقة الدفع" } };

  const productIds = form.getAll("productId").map(String);

  // العنوان: محفوظ مسبقًا أو جديد يُحفظ للمرات القادمة
  const addressId = String(form.get("addressId") ?? "");
  let address;
  if (addressId && addressId !== "new") {
    address = await db.address.findFirst({ where: { id: addressId, userId: user.id } });
    if (!address) return { fieldErrors: { addressId: "اختر عنوان التوصيل" } };
  } else {
    const parsed = addressSchema.safeParse({
      fullName: form.get("fullName"),
      phone: form.get("phone"),
      city: form.get("city"),
      district: form.get("district"),
      street: form.get("street"),
      details: form.get("details") || undefined,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
      return { fieldErrors };
    }
    const phone = normalizeSaudiPhone(parsed.data.phone);
    if (!phone) return { fieldErrors: { phone: "رقم جوال غير صحيح" } };
    address = await db.address.create({ data: { ...parsed.data, phone, details: parsed.data.details ?? null, userId: user.id } });
  }

  let order;
  try {
    order = await createPendingOrder({
      buyerId: user.id,
      productIds,
      method,
      address: {
        fullName: address.fullName,
        phone: address.phone,
        city: address.city,
        district: address.district,
        street: address.street,
        details: address.details,
      },
    });
  } catch (e) {
    if (e instanceof CheckoutError) return { error: e.message };
    throw e;
  }
  redirect(`/checkout/pay/${order.id}`);
}

// يحفظ معرف الدفع قبل تحويل 3DS حتى لا يضيع إذا انقطع الاتصال
export async function savePaymentId(orderId: string, paymentId: string) {
  const user = await getCurrentUser();
  if (!user || !/^[\w-]{8,64}$/.test(paymentId)) return;
  await db.order.updateMany({
    where: { id: orderId, buyerId: user.id, paidAt: null },
    data: { paymentId },
  });
}

// وضع التطوير فقط (بدون مفاتيح ميسر): محاكاة دفع ناجح
export async function mockPay(orderId: string) {
  if (isProd || moyasarEnabled()) throw new Error("Not available");
  const user = await getCurrentUser();
  const order = await db.order.findFirst({ where: { id: orderId, buyerId: user?.id } });
  if (!order) throw new Error("Order not found");
  await fulfillOrder(order.id, {
    id: `mock_${order.id}`,
    status: "paid",
    amount: order.totalHalalas,
    currency: "SAR",
    metadata: { order_id: order.id },
  });
  redirect(`/checkout/callback/${order.id}`);
}

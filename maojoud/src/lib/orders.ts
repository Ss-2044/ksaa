import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import type { PaymentMethod } from "./constants";
import { RESERVATION_MINUTES } from "./constants";
import type { MoyasarPayment } from "./moyasar";

export class CheckoutError extends Error {}

type AddressInput = {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  details?: string | null;
};

/**
 * ينشئ طلبًا بانتظار الدفع ويحجز السلع مؤقتًا (كل سلعة قطعة واحدة)
 * حتى لا يدفع مشتريان ثمن السلعة نفسها في نفس الوقت.
 */
export async function createPendingOrder(opts: {
  buyerId: string;
  productIds: string[];
  address: AddressInput;
  method: PaymentMethod;
}) {
  const ids = [...new Set(opts.productIds)];
  if (ids.length === 0) throw new CheckoutError("السلة فارغة");

  return db.$transaction(async (tx) => {
    const now = new Date();

    // إلغاء الطلبات السابقة غير المدفوعة لنفس المشتري وتحرير حجوزاتها
    const stale = await tx.order.findMany({
      where: { buyerId: opts.buyerId, status: "PENDING_PAYMENT" },
      select: { id: true },
    });
    if (stale.length) {
      const staleIds = stale.map((o) => o.id);
      await tx.product.updateMany({
        where: { reservedBy: { in: staleIds }, status: "ACTIVE" },
        data: { reservedBy: null, reservedUntil: null },
      });
      await tx.order.updateMany({ where: { id: { in: staleIds } }, data: { status: "CANCELLED" } });
    }

    const products = await tx.product.findMany({
      where: { id: { in: ids } },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    });
    if (products.length !== ids.length) throw new CheckoutError("بعض السلع لم تعد متاحة");
    for (const p of products) {
      if (p.status !== "ACTIVE") throw new CheckoutError(`«${p.title}» لم تعد متاحة`);
      if (p.sellerId === opts.buyerId) throw new CheckoutError("لا يمكنك شراء سلعتك");
    }

    const orderId = randomUUID();
    const reservedUntil = new Date(now.getTime() + RESERVATION_MINUTES * 60 * 1000);
    for (const p of products) {
      const { count } = await tx.product.updateMany({
        where: {
          id: p.id,
          status: "ACTIVE",
          OR: [{ reservedUntil: null }, { reservedUntil: { lt: now } }],
        },
        data: { reservedUntil, reservedBy: orderId },
      });
      if (count === 0) throw new CheckoutError(`«${p.title}» محجوزة حاليًا لمشترٍ آخر، حاول لاحقًا`);
    }

    const last = await tx.order.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
    const total = products.reduce((s, p) => s + p.priceHalalas, 0);

    return tx.order.create({
      data: {
        id: orderId,
        number: (last?.number ?? 100000) + 1,
        buyerId: opts.buyerId,
        paymentMethod: opts.method,
        totalHalalas: total,
        addressJson: JSON.stringify(opts.address),
        items: {
          create: products.map((p) => ({
            productId: p.id,
            sellerId: p.sellerId,
            title: p.title,
            imageUrl: p.images[0]?.thumbUrl ?? null,
            priceHalalas: p.priceHalalas,
          })),
        },
      },
    });
  });
}

/**
 * يؤكد الطلب بعد التحقق من الدفع من خادم مُيسر (وليس من رابط العودة).
 * آمنة للاستدعاء أكثر من مرة (من صفحة العودة ومن الـ webhook).
 */
export async function fulfillOrder(orderId: string, payment: MoyasarPayment) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return { ok: false as const, reason: "not_found" };
    if (order.paidAt) return { ok: true as const, order };

    const valid =
      payment.status === "paid" &&
      payment.amount === order.totalHalalas &&
      payment.currency === "SAR" &&
      payment.metadata?.order_id === order.id;
    if (!valid) return { ok: false as const, reason: "invalid_payment" };

    const productIds = order.items.map((i) => i.productId);
    const { count } = await tx.product.updateMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      data: { status: "SOLD", reservedBy: null, reservedUntil: null },
    });
    if (count !== productIds.length) {
      // حالة نادرة: دُفع طلب انتهى حجزه وبيعت إحدى سلعه لغيره — يحتاج مراجعة واسترجاع من الإدارة
      console.warn(`[orders] order ${order.number} paid but ${productIds.length - count} item(s) unavailable`);
    }
    await tx.cartItem.deleteMany({ where: { productId: { in: productIds } } });

    const updated = await tx.order.update({
      where: { id: order.id },
      data: { status: "NEW", paidAt: new Date(), paymentId: payment.id },
    });
    return { ok: true as const, order: updated };
  });
}

export function parseAddress(json: string): AddressInput {
  try {
    return JSON.parse(json) as AddressInput;
  } catch {
    return { fullName: "", phone: "", city: "", district: "", street: "" };
  }
}

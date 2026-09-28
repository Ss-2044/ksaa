import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { fetchPayment } from "@/lib/moyasar";
import { fulfillOrder } from "@/lib/orders";

// Webhook مُيسر — secret_token يأتي في جسم الطلب وليس في الترويسة
function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function POST(req: Request) {
  const secret = process.env.MOYASAR_WEBHOOK_SECRET;
  const body = (await req.json().catch(() => null)) as {
    type?: string;
    secret_token?: string;
    data?: { id?: string; metadata?: { order_id?: string } | null };
  } | null;

  if (!secret || !body?.secret_token || !safeEqual(body.secret_token, secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (body.type === "payment_paid" && body.data?.id && body.data.metadata?.order_id) {
    // نعيد جلب الدفعة من مُيسر للتأكد من المبلغ والحالة
    const payment = await fetchPayment(body.data.id);
    if (!payment) return NextResponse.json({ error: "payment lookup failed" }, { status: 502 });
    const r = await fulfillOrder(body.data.metadata.order_id, payment);
    if (!r.ok) console.warn("[moyasar-webhook] not fulfilled:", r.reason, body.data.id);
  }
  return NextResponse.json({ ok: true });
}

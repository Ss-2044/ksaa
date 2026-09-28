import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/card";
import { buttonClass } from "@/components/styles";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { declineMessage, fetchPayment } from "@/lib/moyasar";
import { fulfillOrder } from "@/lib/orders";

export const metadata: Metadata = { title: "نتيجة الدفع" };
export const dynamic = "force-dynamic";

// لا نثق بحالة الدفع في رابط العودة — نتحقق مباشرة من خادم مُيسر قبل تأكيد الطلب
export default async function PaymentCallback({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const [{ orderId }, { id }] = await Promise.all([params, searchParams]);
  const user = await requireUser(`/checkout/callback/${orderId}`);
  let order = await db.order.findFirst({ where: { id: orderId, buyerId: user.id } });
  if (!order) notFound();

  let failure: string | null = null;
  if (!order.paidAt) {
    const paymentId = id || order.paymentId;
    const payment = paymentId ? await fetchPayment(paymentId) : null;
    if (payment?.status === "paid") {
      const r = await fulfillOrder(order.id, payment);
      if (r.ok) order = r.order;
      else failure = "تعذر التحقق من عملية الدفع، تواصل معنا إن تم الخصم من حسابك";
    } else {
      failure = declineMessage(payment);
    }
  }

  return (
    <div className="container-page max-w-lg py-12">
      <Card className="flex flex-col items-center gap-4 p-8 text-center">
        {order.paidAt ? (
          <>
            <CheckCircle2 className="size-16 text-emerald-500" aria-hidden />
            <h1 className="text-2xl font-bold">تم استلام طلبك بنجاح</h1>
            <p className="text-slate-600">رقم الطلب #{order.number} — سنبلغك عند شحن الطلب.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Link href={`/orders/${order.id}`} className={buttonClass()}>تفاصيل الطلب</Link>
              <Link href="/" className={buttonClass("secondary")}>متابعة التسوق</Link>
            </div>
          </>
        ) : (
          <>
            <XCircle className="size-16 text-red-500" aria-hidden />
            <h1 className="text-2xl font-bold">لم تكتمل عملية الدفع</h1>
            <p className="text-slate-600">{failure}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {order.status === "PENDING_PAYMENT" && (
                <Link href={`/checkout/pay/${order.id}`} className={buttonClass()}>حاول مرة أخرى</Link>
              )}
              <Link href="/cart" className={buttonClass("secondary")}>العودة للسلة</Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

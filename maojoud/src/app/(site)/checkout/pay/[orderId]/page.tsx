import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { mockPay } from "@/actions/checkout";
import { Card } from "@/components/card";
import { MoyasarForm } from "@/components/checkout/moyasar-form";
import { buttonClass } from "@/components/styles";
import { Alert } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { PAYMENT_METHODS } from "@/lib/constants";
import { db } from "@/lib/db";
import { allowFallbacks, appUrl, moyasarEnabled } from "@/lib/env";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "الدفع" };

export default async function PayPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await requireUser(`/checkout/pay/${orderId}`);
  const order = await db.order.findFirst({ where: { id: orderId, buyerId: user.id }, include: { items: true } });
  if (!order) notFound();
  if (order.paidAt) redirect(`/orders/${order.id}`);
  if (order.status !== "PENDING_PAYMENT") redirect("/cart");

  const method = order.paymentMethod as "applepay" | "creditcard";

  return (
    <div className="container-page max-w-xl py-8">
      <h1 className="text-2xl font-bold">الدفع</h1>
      <p className="mt-1 text-slate-500">طلب #{order.number} · {PAYMENT_METHODS[method]}</p>

      <Card className="mt-6 p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
          <span className="font-semibold text-slate-700">المبلغ المستحق</span>
          <span className="text-xl font-bold text-brand-700">{formatPrice(order.totalHalalas)}</span>
        </div>

        {moyasarEnabled() ? (
          <MoyasarForm
            orderId={order.id}
            orderNumber={order.number}
            amount={order.totalHalalas}
            method={method}
            publishableKey={process.env.MOYASAR_PUBLISHABLE_KEY!}
            callbackUrl={`${appUrl()}/checkout/callback/${order.id}`}
          />
        ) : allowFallbacks() ? (
          <div className="flex flex-col gap-4">
            <Alert tone="warning">
              نسخة تجريبية: مفاتيح مُيسر غير مضبوطة، لذلك يظهر زر دفع تجريبي بدل نموذج الدفع ولن يُخصم أي مبلغ.
            </Alert>
            <form action={mockPay.bind(null, order.id)}>
              <button type="submit" className={buttonClass("primary", "lg", "w-full")}>دفع تجريبي</button>
            </form>
          </div>
        ) : (
          <Alert>بوابة الدفع غير متاحة حاليًا، حاول لاحقًا.</Alert>
        )}

        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Lock className="size-3.5" aria-hidden /> الدفع مشفر وآمن عبر بوابة مُيسر
        </p>
      </Card>
    </div>
  );
}

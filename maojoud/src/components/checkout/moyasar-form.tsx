"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { savePaymentId } from "@/actions/checkout";

// نموذج الدفع المستضاف من مُيسر: يتكفل بإدخال البطاقة و3DS وApple Pay ومعايير PCI
const MPF_VERSION = "1.14.0";

declare global {
  interface Window {
    Moyasar?: { init: (config: Record<string, unknown>) => void };
  }
}

export function MoyasarForm({
  orderId,
  orderNumber,
  amount,
  method,
  publishableKey,
  callbackUrl,
}: {
  orderId: string;
  orderNumber: number;
  amount: number;
  method: "applepay" | "creditcard";
  publishableKey: string;
  callbackUrl: string;
}) {
  const [ready, setReady] = useState(false);
  const inited = useRef(false);

  useEffect(() => {
    if (!ready || inited.current || !window.Moyasar) return;
    inited.current = true;
    window.Moyasar.init({
      element: ".mysr-form",
      amount,
      currency: "SAR",
      description: `طلب موجود #${orderNumber}`,
      publishable_api_key: publishableKey,
      callback_url: callbackUrl,
      language: "ar",
      methods: [method],
      supported_networks: ["mada", "visa", "mastercard"],
      metadata: { order_id: orderId },
      apple_pay: {
        country: "SA",
        label: "موجود",
        validate_merchant_url: "https://api.moyasar.com/v1/applepay/initiate",
      },
      on_completed: async (payment: { id: string }) => {
        await savePaymentId(orderId, payment.id);
      },
    });
  }, [ready, amount, orderNumber, publishableKey, callbackUrl, method, orderId]);

  return (
    <>
      <link rel="stylesheet" href={`https://cdn.moyasar.com/mpf/${MPF_VERSION}/moyasar.css`} />
      <Script src={`https://cdn.moyasar.com/mpf/${MPF_VERSION}/moyasar.js`} onReady={() => setReady(true)} />
      <div className="mysr-form min-h-40" />
      {!ready && <p className="text-center text-sm text-slate-500">جارٍ تحميل نموذج الدفع…</p>}
    </>
  );
}

"use client";

import { useState } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { CreditCard, MapPin, Plus } from "lucide-react";
import { startCheckout } from "@/actions/checkout";
import { Card } from "@/components/card";
import { Alert, Button, TextField } from "@/components/ui";
import { useFormAction } from "@/components/use-form-action";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

type Product = { id: string; title: string; priceHalalas: number; image: string | null };
type Address = { id: string; label: string; phone: string };

const optionClass =
  "flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition has-data-checked:border-brand-500 has-data-checked:bg-brand-50/60";

function Dot({ value }: { value: string }) {
  return (
    <Radio.Root value={value} className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-slate-300 data-checked:border-brand-600 data-checked:bg-brand-600">
      <Radio.Indicator className="size-2 rounded-full bg-white data-unchecked:hidden" />
    </Radio.Root>
  );
}

export function CheckoutForm({
  products,
  addresses,
  defaultName,
  defaultPhone,
}: {
  products: Product[];
  addresses: Address[];
  defaultName: string;
  defaultPhone: string;
}) {
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "new");
  const [method, setMethod] = useState("");
  const [state, action, pending] = useFormAction(startCheckout, undefined);
  const fe = state?.fieldErrors ?? {};
  const total = products.reduce((s, p) => s + p.priceHalalas, 0);

  return (
    <form onSubmit={action} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {products.map((p) => (
        <input key={p.id} type="hidden" name="productId" value={p.id} />
      ))}
      <div className="flex flex-col gap-6">
        <Card className="p-5 sm:p-6">
          <h2 id="addr" className="mb-4 flex items-center gap-2 text-lg font-bold">
            <MapPin className="size-5 text-brand-600" aria-hidden /> موقع التوصيل
          </h2>
          <RadioGroup name="addressId" aria-labelledby="addr" value={addressId} onValueChange={(v) => setAddressId(String(v))} className="flex flex-col gap-2.5">
            {addresses.map((a) => (
              <label key={a.id} className={optionClass}>
                <Dot value={a.id} />
                <span>
                  <span className="block font-semibold">{a.label}</span>
                  <span dir="ltr" className="text-sm text-slate-500">{a.phone}</span>
                </span>
              </label>
            ))}
            <label className={optionClass}>
              <Dot value="new" />
              <span className="flex items-center gap-1.5 font-semibold">
                <Plus className="size-4" aria-hidden /> عنوان جديد
              </span>
            </label>
          </RadioGroup>
          {fe.addressId && <p className="mt-2 text-sm text-red-600">{fe.addressId}</p>}

          {addressId === "new" && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField label="اسم المستلم" name="fullName" defaultValue={defaultName} required error={fe.fullName} />
              <TextField label="جوال المستلم" name="phone" type="tel" dir="ltr" className="text-right" defaultValue={defaultPhone} required error={fe.phone} />
              <TextField label="المدينة" name="city" required error={fe.city} />
              <TextField label="الحي" name="district" required error={fe.district} />
              <TextField label="الشارع" name="street" required error={fe.street} />
              <TextField label="تفاصيل إضافية (اختياري)" name="details" placeholder="رقم المبنى، الشقة، علامة مميزة" error={fe.details} />
              <p className="text-xs text-slate-500 sm:col-span-2">سيُحفظ العنوان لطلباتك القادمة.</p>
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 id="pay" className="mb-4 flex items-center gap-2 text-lg font-bold">
            <CreditCard className="size-5 text-brand-600" aria-hidden /> طريقة الدفع
          </h2>
          <RadioGroup name="method" aria-labelledby="pay" value={method} onValueChange={(v) => setMethod(String(v))} className="grid gap-2.5 sm:grid-cols-2">
            <label className={optionClass}>
              <Dot value="applepay" />
              <span>
                <span className="block font-semibold">Apple Pay</span>
                <span className="text-xs text-slate-500">متاح على أجهزة Apple ومتصفح Safari</span>
              </span>
            </label>
            <label className={optionClass}>
              <Dot value="creditcard" />
              <span>
                <span className="block font-semibold">بطاقة مدى / بطاقة ائتمانية</span>
                <span className="text-xs text-slate-500">مدى · فيزا · ماستركارد</span>
              </span>
            </label>
          </RadioGroup>
          {fe.method && <p className="mt-2 text-sm text-red-600">{fe.method}</p>}
        </Card>
      </div>

      <Card className="h-fit p-5 lg:sticky lg:top-24">
        <h2 className="mb-4 text-lg font-bold">ملخص الطلب</h2>
        <ul className="flex flex-col gap-3">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image ?? ""} alt="" className="size-14 rounded-lg bg-slate-100 object-cover" />
              <span className="line-clamp-2 flex-1 text-sm">{p.title}</span>
              <span className="text-sm font-semibold">{formatPrice(p.priceHalalas)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-lg font-bold">
          <span>الإجمالي</span>
          <span className="text-brand-700">{formatPrice(total)}</span>
        </div>
        {state?.error && <div className="mt-4"><Alert>{state.error}</Alert></div>}
        {Object.keys(fe).length > 0 && (
          <div className="mt-4">
            <Alert>
              أكمل البيانات الناقصة:
              <ul className="mt-1 list-inside list-disc">
                {[...new Set(Object.values(fe))].map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </Alert>
          </div>
        )}
        <Button type="submit" size="lg" disabled={pending} className={cn("mt-5 w-full")}>
          {pending ? "جارٍ التجهيز…" : "إتمام الطلب والدفع"}
        </Button>
      </Card>
    </form>
  );
}

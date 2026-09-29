"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OTPField } from "@base-ui/react/otp-field";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { ArrowRight, Smartphone } from "lucide-react";
import { completeProfile, requestOtp, verifyCode } from "@/actions/auth";
import { Alert, Button, TextField } from "@/components/ui";
import { useFormAction } from "@/components/use-form-action";
import { displayPhone } from "@/lib/phone";
import { AvatarPicker } from "./avatar-picker";

type Step = "phone" | "otp" | "profile";


export function LoginFlow({ next, startAtProfile, otpLength }: { next: string; startAtProfile: boolean; otpLength: number }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(startAtProfile ? "profile" : "phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const send = () =>
    start(async () => {
      setError(null);
      const r = await requestOtp(phone);
      if (!r.ok) return setError(r.error);
      setPhone(r.phone);
      setDevCode(r.devCode);
      setCode("");
      setStep("otp");
    });

  const verify = (value: string) =>
    start(async () => {
      setError(null);
      const r = await verifyCode(phone, value);
      if (!r.ok) {
        setCode("");
        return setError(r.error);
      }
      if (r.next === "profile") setStep("profile");
      else {
        router.replace(next);
        router.refresh();
      }
    });

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
      {step === "phone" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Smartphone className="size-7" aria-hidden />
            </span>
            <h1 className="text-2xl font-bold">تسجيل الدخول أو إنشاء حساب</h1>
            <p className="text-sm text-slate-500">أدخل رقم جوالك وسنرسل لك رمز التحقق</p>
          </div>
          <TextField
            label="رقم الجوال"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="05XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.currentTarget.value)}
            className="text-right tracking-wider"
            required
          />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "جارٍ الإرسال…" : "أرسل رمز التحقق"}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <div className="flex flex-col gap-5">
          <button type="button" onClick={() => setStep("phone")} className="flex items-center gap-1 self-start text-sm text-slate-500 hover:text-brand-700">
            <ArrowRight className="size-4" aria-hidden /> تغيير الرقم
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">أدخل رمز التحقق</h1>
            <p className="mt-2 text-sm text-slate-500">
              أرسلنا الرمز إلى <span dir="ltr" className="font-semibold text-slate-800">{displayPhone(phone)}</span>
            </p>
          </div>
          <OTPField.Root
            length={otpLength}
            value={code}
            onValueChange={setCode}
            onValueComplete={verify}
            disabled={pending}
            aria-label="رمز التحقق"
            dir="ltr"
            className="flex justify-center gap-3"
          >
            {Array.from({ length: otpLength }, (_, i) => (
              <OTPField.Input
                key={i}
                aria-label={i === 0 ? undefined : `الخانة ${i + 1} من ${otpLength}`}
                className="size-14 rounded-xl border border-slate-300 bg-white text-center text-2xl font-bold focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/20"
              />
            ))}
          </OTPField.Root>
          {devCode && <Alert tone="info">نسخة تجريبية: رمز التحقق هو <b dir="ltr">{devCode}</b></Alert>}
          {error && <Alert>{error}</Alert>}
          <Button variant="ghost" onClick={send} disabled={pending}>إعادة إرسال الرمز</Button>
        </div>
      )}

      {step === "profile" && <ProfileForm next={next} />}
    </div>
  );
}

function ProfileForm({ next }: { next: string }) {
  const [state, action, pending] = useFormAction(completeProfile, undefined);
  const fe = state?.fieldErrors ?? {};
  return (
    <form onSubmit={action} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <div className="text-center">
        <h1 className="text-2xl font-bold">أكمل ملفك الشخصي</h1>
        <p className="mt-2 text-sm text-slate-500">خطوة واحدة وتصير جاهز للبيع والشراء</p>
      </div>
      <AvatarPicker name="avatar" error={fe.avatar} />
      <TextField label="الاسم الكامل *" name="name" autoComplete="name" required error={fe.name} />
      <div className="flex flex-col gap-1.5">
        <span id="gender-label" className="text-sm font-semibold text-slate-800">الجنس *</span>
        <RadioGroup name="gender" aria-labelledby="gender-label" className="grid grid-cols-2 gap-3" required>
          {[
            ["MALE", "ذكر"],
            ["FEMALE", "أنثى"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 has-data-checked:border-brand-500 has-data-checked:bg-brand-50"
            >
              <Radio.Root value={value} className="flex size-5 items-center justify-center rounded-full border border-slate-300 data-checked:border-brand-600 data-checked:bg-brand-600">
                <Radio.Indicator className="size-2 rounded-full bg-white data-unchecked:hidden" />
              </Radio.Root>
              {label}
            </label>
          ))}
        </RadioGroup>
        {fe.gender && <p className="text-sm text-red-600">{fe.gender}</p>}
      </div>
      <TextField label="البريد الإلكتروني (اختياري)" name="email" type="email" dir="ltr" className="text-right" autoComplete="email" error={fe.email} />
      {state?.error && <Alert>{state.error}</Alert>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? "جارٍ الحفظ…" : "إنشاء الحساب"}</Button>
    </form>
  );
}

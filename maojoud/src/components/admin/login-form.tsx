"use client";


import { adminLogin } from "@/actions/admin";
import { Alert, Button, TextField } from "@/components/ui";
import { useFormAction } from "@/components/use-form-action";

export function AdminLoginForm() {
  const [state, action, pending] = useFormAction(adminLogin, undefined);
  return (
    <form onSubmit={action} className="flex w-full max-w-sm flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl">
      <h1 className="text-center text-xl font-bold">دخول لوحة التحكم</h1>
      <TextField label="اسم المستخدم" name="username" autoComplete="username" dir="ltr" required />
      <TextField label="كلمة المرور" name="password" type="password" autoComplete="current-password" dir="ltr" required />
      {state?.error && <Alert>{state.error}</Alert>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? "جارٍ الدخول…" : "دخول"}</Button>
    </form>
  );
}

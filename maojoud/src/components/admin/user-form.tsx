"use client";


import type { AdminFormState } from "@/actions/admin";
import { Alert, Button, inputClass, TextField } from "@/components/ui";
import { useFormAction } from "@/components/use-form-action";

export function AdminUserForm({
  action,
  user,
}: {
  action: (s: AdminFormState, f: FormData) => Promise<AdminFormState>;
  user: { name: string; gender: string; email: string; phone: string; hasAvatar: boolean };
}) {
  const [state, formAction, pending] = useFormAction(action, undefined);
  return (
    <form onSubmit={formAction} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      <h2 className="font-bold sm:col-span-2">تعديل البيانات</h2>
      <TextField label="الاسم الكامل" name="name" defaultValue={user.name} required />
      <TextField label="الجوال" name="phone" defaultValue={user.phone} dir="ltr" className="text-right" required />
      <TextField label="البريد الإلكتروني" name="email" type="email" defaultValue={user.email} dir="ltr" className="text-right" />
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-800">
        الجنس
        <select name="gender" defaultValue={user.gender} className={inputClass}>
          <option value="MALE">ذكر</option>
          <option value="FEMALE">أنثى</option>
        </select>
      </label>
      {user.hasAvatar && (
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="removeAvatar" className="size-4" /> حذف الصورة الشخصية
        </label>
      )}
      {state?.error && <div className="sm:col-span-2"><Alert>{state.error}</Alert></div>}
      {state?.ok && <div className="sm:col-span-2"><Alert tone="success">تم الحفظ</Alert></div>}
      <Button type="submit" disabled={pending} className="sm:col-span-2 sm:justify-self-start">حفظ التعديلات</Button>
    </form>
  );
}

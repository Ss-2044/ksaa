"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Pencil } from "lucide-react";
import { updateProfile } from "@/actions/profile";
import { AvatarPicker } from "@/components/auth/avatar-picker";
import { Alert, Button, buttonClass, TextField } from "@/components/ui";
import { useFormAction } from "@/components/use-form-action";

export function EditProfileDialog({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useFormAction(updateProfile, undefined);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={buttonClass("secondary")}>
        <Pencil className="size-4" aria-hidden /> تعديل الملف
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-slate-950/40 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl transition data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <Dialog.Title className="mb-5 text-lg font-bold">تعديل المعلومات الشخصية</Dialog.Title>
          <form onSubmit={action} className="flex flex-col gap-5">
            <AvatarPicker name="avatar" current={avatarUrl} displayName={name} />
            <TextField label="الاسم الكامل" name="name" defaultValue={name} required />
            {state?.error && <Alert>{state.error}</Alert>}
            <div className="flex justify-end gap-2">
              <Dialog.Close className={buttonClass("ghost")}>إلغاء</Dialog.Close>
              <Button type="submit" disabled={pending}>{pending ? "جارٍ الحفظ…" : "حفظ"}</Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

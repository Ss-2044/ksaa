"use client";

import { startTransition, useActionState } from "react";

/**
 * مثل useActionState لكن دون إعادة ضبط الحقول تلقائيًا بعد الإرسال
 * (React 19 يمسح النموذج بعد كل action، فيضيع ما كتبه المستخدم عند ظهور خطأ).
 */
export function useFormAction<S>(
  fn: (state: Awaited<S>, form: FormData) => S | Promise<S>,
  initial: Awaited<S>,
  prepare?: (form: FormData) => void,
) {
  const [state, action, pending] = useActionState<S, FormData>(fn, initial);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    prepare?.(form);
    startTransition(() => action(form));
  };
  return [state, onSubmit, pending] as const;
}

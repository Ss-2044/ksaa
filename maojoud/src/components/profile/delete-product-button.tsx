"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/actions/products";
import { buttonClass } from "@/components/ui";

export function DeleteProductButton({ productId, title }: { productId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger
        aria-label={`حذف ${title}`}
        className="flex size-9 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm hover:bg-red-50"
      >
        <Trash2 className="size-4.5" aria-hidden />
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-slate-950/40 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl transition data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <AlertDialog.Title className="text-lg font-bold">حذف السلعة؟</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-slate-600">
            سيتم إزالة «{title}» من العرض نهائيًا.
          </AlertDialog.Description>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Close className={buttonClass("ghost", "sm")}>إلغاء</AlertDialog.Close>
            <button
              type="button"
              disabled={pending}
              className={buttonClass("danger", "sm")}
              onClick={() =>
                start(async () => {
                  const r = await deleteProduct(productId);
                  if (r.error) return setError(r.error);
                  setOpen(false);
                  router.refresh();
                })
              }
            >
              {pending ? "جارٍ الحذف…" : "حذف"}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

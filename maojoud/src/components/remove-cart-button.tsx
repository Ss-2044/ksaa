"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { removeFromCart } from "@/actions/cart";

export function RemoveCartButton({ productId }: { productId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => removeFromCart(productId))}
      aria-label="إزالة من السلة"
      className="flex size-10 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="size-5" aria-hidden />
    </button>
  );
}

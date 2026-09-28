"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/actions/profile";
import { useFormAction } from "@/components/use-form-action";
import { cn } from "@/lib/cn";
import { Alert, Button, inputClass } from "./ui";

export function ReviewForm({ orderId, sellerId, sellerName }: { orderId: string; sellerId: string; sellerName: string }) {
  const [rating, setRating] = useState(0);
  const [state, action, pending] = useFormAction(submitReview, undefined);
  if (state?.ok) return <Alert tone="success">شكرًا! تم نشر تقييمك للبائع {sellerName}.</Alert>;

  return (
    <form onSubmit={action} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="sellerId" value={sellerId} />
      <input type="hidden" name="rating" value={rating || ""} />
      <p className="font-semibold">قيّم البائع {sellerName}</p>
      <div className="flex gap-1" role="radiogroup" aria-label="التقييم">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} من 5`} onClick={() => setRating(i)}>
            <Star className={cn("size-8", i <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} aria-hidden />
          </button>
        ))}
      </div>
      <textarea name="comment" rows={3} maxLength={500} placeholder="اكتب تجربتك مع البائع (اختياري)" className={cn(inputClass, "h-auto py-3")} />
      {state?.error && <Alert>{state.error}</Alert>}
      <Button type="submit" disabled={pending || !rating} className="self-start">نشر التقييم</Button>
    </form>
  );
}

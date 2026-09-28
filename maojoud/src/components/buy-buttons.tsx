"use client";

import { useState, useTransition } from "react";
import { Check, ShoppingCart, Zap } from "lucide-react";
import { addToCart, buyNow } from "@/actions/cart";
import { Alert, Button } from "./ui";

export function BuyButtons({ productId, inCart }: { productId: string; inCart: boolean }) {
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(inCart);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
        <Button
          size="lg"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await buyNow(productId);
              if (r?.error) setError(r.error);
            })
          }
        >
          <Zap className="size-5" aria-hidden />
          اشترِ الآن
        </Button>
        <Button
          size="lg"
          variant="secondary"
          disabled={pending || added}
          onClick={() =>
            start(async () => {
              const r = await addToCart(productId);
              if (r?.error) setError(r.error);
              else setAdded(true);
            })
          }
        >
          {added ? <Check className="size-5" aria-hidden /> : <ShoppingCart className="size-5" aria-hidden />}
          {added ? "في السلة" : "أضف للسلة"}
        </Button>
      </div>
      {error && <Alert>{error}</Alert>}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import type { Vertical } from "@/config/site";
import { track } from "@/lib/analytics/track";

export function TrackCategoryView({ category, city }: { category: Vertical; city?: string }) {
  useEffect(() => {
    track("category_viewed", { category, city });
  }, [category, city]);
  return null;
}

import type { Stat } from "@/lib/cms/types";

/**
 * Verified impact numbers. Leave empty until Deliver Me can verify each figure —
 * the Impact section hides itself while this list has no published items.
 *
 * Example entry (do not publish unverified numbers):
 * {
 *   id: "orders", value: 25000, suffix: { en: "+", ar: "+" },
 *   label: { en: "orders delivered", ar: "طلب وصل لأصحابه" },
 *   source: "Ops dashboard export, 2026-09-01", order: 1, status: "published",
 * }
 */
export const stats: Stat[] = [];

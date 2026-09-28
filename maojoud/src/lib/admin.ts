import "server-only";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "./auth";
import { adminPath } from "./env";

export function adminBase() {
  return `/${adminPath()}`;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(`${adminBase()}/login`);
  return admin;
}

// التواريخ بتوقيت الرياض (UTC+3)
export function parseRange(from?: string, to?: string, defaultDays = 30) {
  const valid = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined);
  const today = new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);
  const toStr = valid(to) ?? today;
  const fromStr =
    valid(from) ?? new Date(new Date(`${toStr}T00:00:00+03:00`).getTime() - (defaultDays - 1) * 86400000 + 3 * 3600 * 1000).toISOString().slice(0, 10);
  return {
    fromStr,
    toStr,
    gte: new Date(`${fromStr}T00:00:00+03:00`),
    lte: new Date(`${toStr}T23:59:59.999+03:00`),
  };
}

export function riyadhDay(d: Date) {
  return new Date(d.getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10);
}

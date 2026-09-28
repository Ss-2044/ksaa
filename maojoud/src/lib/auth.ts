import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "./db";
import { readSession } from "./session";

export const getCurrentUser = cache(async () => {
  const id = await readSession("user");
  if (!id) return null;
  return db.user.findUnique({ where: { id } });
});

/** للصفحات: يحوّل الزائر لصفحة الدخول ثم يعيده لنفس الصفحة */
export async function requireUser(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export const getCurrentAdmin = cache(async () => {
  const id = await readSession("admin");
  if (!id) return null;
  return db.admin.findUnique({ where: { id }, select: { id: true, username: true } });
});

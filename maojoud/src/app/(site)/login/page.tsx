import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginFlow } from "@/components/auth/login-flow";
import { getCurrentUser } from "@/lib/auth";
import { otpLength } from "@/lib/env";
import { readSession } from "@/lib/session";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/" } = await searchParams;
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  if (await getCurrentUser()) redirect(safe);
  const pendingSignup = !!(await readSession("signup"));

  return (
    <div className="container-page flex justify-center py-10 sm:py-16">
      <LoginFlow next={safe} startAtProfile={pendingSignup} otpLength={otpLength()} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/login-form";
import { adminBase } from "@/lib/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect(adminBase());
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <AdminLoginForm />
    </div>
  );
}

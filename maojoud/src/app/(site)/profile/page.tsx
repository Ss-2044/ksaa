import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function MyProfile({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser("/profile");
  const { tab } = await searchParams;
  redirect(`/users/${user.id}${tab ? `?tab=${encodeURIComponent(tab)}` : ""}`);
}

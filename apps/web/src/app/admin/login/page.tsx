import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PROGRAM, messages } from "@career-craft/shared";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/server/auth-guards";

export const metadata: Metadata = {
  title: `${messages.admin.signInHeading} — ${PROGRAM.name}`,
};

function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next === "/admin/login") {
    return "/admin";
  }
  return next;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const admin = await getAdminSession();
  const next = safeNextPath(params.next);

  if (admin) {
    redirect(next);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <AdminLoginForm redirectTo={next} />
    </div>
  );
}

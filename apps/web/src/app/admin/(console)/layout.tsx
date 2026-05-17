import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/server/auth-guards";

export default async function AdminConsoleLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage();
  return <AdminShell adminName={admin.fullName}>{children}</AdminShell>;
}

import type { ReactNode } from "react";
import { AdminAccessProvider } from "@/components/admin/admin-access";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/server/auth-guards";

export default async function AdminConsoleLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage();
  const isFullAdmin = admin.userType === "admin";

  return (
    <AdminAccessProvider readOnly={admin.readOnly} isFullAdmin={isFullAdmin}>
      <AdminShell adminName={admin.fullName} isFullAdmin={isFullAdmin}>
        {children}
      </AdminShell>
    </AdminAccessProvider>
  );
}

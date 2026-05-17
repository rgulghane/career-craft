import type { ReactNode } from "react";
import { headers } from "next/headers";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { getSessionUser } from "@/lib/server-api";

export async function SiteShell({ children }: { children: ReactNode }) {
  const headerList = await headers();
  if (headerList.get("x-cc-admin-route") === "1") {
    return <>{children}</>;
  }

  const user = await getSessionUser();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

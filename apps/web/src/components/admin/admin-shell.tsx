import Link from "next/link";
import type { ReactNode } from "react";
import { AdminSignOutButton } from "./admin-sign-out-button";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/enrollments", label: "Enrollments" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({
  children,
  adminName,
}: {
  children: ReactNode;
  adminName: string;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Admin</p>
            <p className="text-sm text-slate-400">{adminName}</p>
          </div>
          <nav className="flex flex-wrap gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <AdminSignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

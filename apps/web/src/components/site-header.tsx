"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { messages } from "@career-craft/shared/content";
import { BrandLockup } from "./marketing";
import { ThemeToggle } from "./theme-toggle";
import type { SessionUser } from "./user-avatar";
import { UserMenu } from "./user-menu";

const authedAppLinks = [{ href: "/dashboard", label: messages.nav.dashboard }];

const marketingLinks = [{ href: "/curriculum", label: "Curriculum" }];

const enrollNowClass =
  "inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md transition hover:from-amber-400 hover:to-orange-500";

function linkClass(active: boolean): string {
  return [
    "rounded-lg px-3 py-2 text-sm font-medium transition",
    active
      ? "bg-slate-200 text-slate-900 dark:bg-white/15 dark:text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
  ].join(" ");
}

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinks = [...marketingLinks, ...(user ? authedAppLinks : [])];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 text-slate-900 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/90 dark:text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <BrandLockup />
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => {
            const active =
              l.href === "/curriculum" ? pathname === "/curriculum" : pathname === l.href;
            return (
              <Link key={l.href} className={linkClass(active)} href={l.href}>
                {l.label}
              </Link>
            );
          })}
          <ThemeToggle />
          <Link href={user ? "/enroll" : "/register"} className={`ml-2 ${enrollNowClass}`}>
            Enroll now
          </Link>
          {user ? (
            <div className="ml-2">
              <UserMenu user={user} />
            </div>
          ) : null}
        </nav>
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          {user ? <UserMenu user={user} /> : null}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 dark:border-white/20 dark:bg-white/5 dark:text-white"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => {
              setOpen((v) => !v);
            }}
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <div
          className="border-t border-slate-200 bg-white lg:hidden dark:border-white/10 dark:bg-slate-950"
          id="mobile-nav"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                href={l.href}
                onClick={() => {
                  setOpen(false);
                }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={user ? "/enroll" : "/register"}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-2.5 text-sm font-semibold text-slate-950"
              onClick={() => {
                setOpen(false);
              }}
            >
              Enroll now
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

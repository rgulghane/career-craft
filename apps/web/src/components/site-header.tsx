"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { messages } from "@career-craft/shared/content";
import { BrandLockup } from "./marketing";
import { ThemeToggle } from "./theme-toggle";
import type { SessionUser } from "./user-avatar";
import { UserMenu } from "./user-menu";

type NavLink = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

const marketingLinks: NavLink[] = [
  {
    href: "/curriculum",
    label: "Curriculum",
    isActive: (pathname) => pathname === "/curriculum",
  },
  {
    href: "/#pricing",
    label: "Pricing",
    isActive: (pathname) => pathname === "/",
  },
];

const authedAppLinks: NavLink[] = [
  {
    href: "/dashboard",
    label: messages.nav.dashboard,
    isActive: (pathname) => pathname.startsWith("/dashboard"),
  },
];

const enrollNowClass =
  "inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3.5 py-2 text-sm font-semibold text-slate-950 shadow-md transition hover:from-amber-400 hover:to-orange-500 sm:px-4";

const signInClass =
  "inline-flex shrink-0 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white";

function navLinkClass(active: boolean): string {
  return [
    "text-sm transition",
    active
      ? "font-semibold text-slate-900 dark:text-white"
      : "font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
  ].join(" ");
}

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navLinks = [...marketingLinks, ...(user ? authedAppLinks : [])];
  const enrollHref = user ? "/enroll" : "/register";

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 text-slate-900 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/90 dark:text-white">
      <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center gap-3 px-4 sm:px-6 lg:gap-4 lg:px-8">
        <BrandLockup />

        <nav className="ml-6 hidden items-center gap-6 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link key={link.href} className={navLinkClass(link.isActive(pathname))} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1.5 lg:flex">
            <ThemeToggle />
            {!user ? (
              <Link href="/login" className={signInClass}>
                {messages.nav.signIn}
              </Link>
            ) : null}
            <Link href={enrollHref} className={enrollNowClass}>
              Enroll now
            </Link>
            {user ? <UserMenu user={user} /> : null}
          </div>

          <div ref={menuRef} className="relative flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            {user ? <UserMenu user={user} /> : null}
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 dark:border-white/20 dark:bg-white/5 dark:text-white"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? "Close" : "Menu"}
            </button>

            {open ? (
              <div
                id="mobile-nav"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(calc(100vw-2rem),16rem)] overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl dark:border-white/10 dark:bg-slate-900"
                role="dialog"
                aria-label="Mobile navigation"
              >
                <nav className="flex flex-col gap-0.5 px-2" aria-label="Main">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      className={[
                        "rounded-lg px-3 py-2 text-sm font-medium transition",
                        link.isActive(pathname)
                          ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5",
                      ].join(" ")}
                      href={link.href}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-2 border-t border-slate-200 px-2 pt-2 dark:border-white/10">
                  {!user ? (
                    <Link
                      href="/login"
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                      onClick={() => setOpen(false)}
                    >
                      {messages.nav.signIn}
                    </Link>
                  ) : null}
                  <Link
                    href={enrollHref}
                    className="mt-1 flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-2.5 text-sm font-semibold text-slate-950"
                    onClick={() => setOpen(false)}
                  >
                    Enroll now
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

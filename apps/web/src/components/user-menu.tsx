"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { messages } from "@career-craft/shared/content";
import { UserAvatar, type SessionUser } from "./user-avatar";

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  const firstName = user.fullName.trim().split(/\s+/)[0] ?? user.email;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.fullName}`}
        onClick={() => {
          setOpen((v) => !v);
        }}
      >
        <UserAvatar user={user} size="sm" />
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-900 sm:inline dark:text-white">
          {firstName}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-slate-900/95 dark:backdrop-blur-md"
        >
          <div className="border-b border-slate-100 px-3 py-3 dark:border-white/10">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.fullName}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-white/10"
            disabled={signingOut}
            onClick={() => {
              void signOut();
            }}
          >
            {signingOut ? "…" : messages.nav.signOut}
          </button>
        </div>
      ) : null}
    </div>
  );
}

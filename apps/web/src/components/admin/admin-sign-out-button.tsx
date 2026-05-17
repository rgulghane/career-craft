"use client";

import { useState } from "react";
import { performSignOut } from "@/lib/sign-out-client";

export function AdminSignOutButton() {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      const redirectPath = await performSignOut("admin");
      window.location.assign(redirectPath);
    } catch {
      window.location.assign("/admin/login");
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void signOut()}
      className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
    >
      {pending ? "…" : "Sign out"}
    </button>
  );
}

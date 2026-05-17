"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function QualifyDueButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setMessage(null);
    try {
      const r = await fetch("/api/admin/referrals/qualify-due", { method: "POST" });
      const body = (await r.json()) as { updated?: number; error?: string };
      if (!r.ok) {
        setMessage(body.error ?? "Failed");
        return;
      }
      setMessage(`Qualified ${body.updated ?? 0} referral(s)`);
      router.refresh();
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={() => void run()}
        className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
      >
        {loading ? "Running…" : "Qualify due referrals"}
      </button>
      {message ? <p className="mt-2 text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}

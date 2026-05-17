"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCard } from "@/components/admin/admin-card";

export function ReferralActions({ referralId, status }: { referralId: string; status: string }) {
  const router = useRouter();
  const [voidReason, setVoidReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function qualify() {
    setLoading(true);
    setMessage(null);
    try {
      const r = await fetch(`/api/admin/referrals/${referralId}/qualify`, { method: "POST" });
      const body = (await r.json()) as { error?: string };
      if (!r.ok) {
        setMessage(body.error ?? "Failed");
        return;
      }
      setMessage("Qualified");
      router.refresh();
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function voidReferral() {
    if (!voidReason.trim()) {
      setMessage("Void reason required");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const r = await fetch(`/api/admin/referrals/${referralId}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voidReason: voidReason.trim() }),
      });
      const body = (await r.json()) as { error?: string };
      if (!r.ok) {
        setMessage(body.error ?? "Failed");
        return;
      }
      setMessage("Voided");
      router.refresh();
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminCard title="Actions">
      <div className="flex flex-wrap gap-3">
        {status !== "QUALIFIED" && status !== "VOIDED" ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void qualify()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Qualify now
          </button>
        ) : null}
      </div>
      {status !== "VOIDED" ? (
        <div className="mt-4 space-y-2">
          <input
            placeholder="Void reason"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => void voidReferral()}
            className="rounded-lg border border-rose-500/50 px-4 py-2 text-sm font-semibold text-rose-300"
          >
            Void referral
          </button>
        </div>
      ) : null}
      {message ? <p className="mt-3 text-sm text-slate-400">{message}</p> : null}
    </AdminCard>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCard } from "@/components/admin/admin-card";

export function EnrollmentEditor({
  enrollmentId,
  initial,
}: {
  enrollmentId: string;
  initial: {
    status: string;
    amountInPaise: number;
    referralCodeUsed: string;
    referrerId: string;
  };
}) {
  const router = useRouter();
  const [amountInPaise, setAmountInPaise] = useState(String(initial.amountInPaise));
  const [referralCodeUsed, setReferralCodeUsed] = useState(initial.referralCodeUsed);
  const [referrerId, setReferrerId] = useState(initial.referrerId);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    setMessage(null);
    try {
      const r = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const res = (await r.json()) as { error?: string };
      if (!r.ok) {
        setMessage(res.error ?? "Failed");
        return;
      }
      setMessage("Updated");
      router.refresh();
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminCard title="Edit enrollment">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void patch({
            amountInPaise: Number(amountInPaise),
            referralCodeUsed: referralCodeUsed.trim() || null,
            referrerId: referrerId.trim() || null,
          });
        }}
      >
        <label className="block text-sm">
          <span className="text-slate-400">Amount (paise)</span>
          <input
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            value={amountInPaise}
            onChange={(ev) => setAmountInPaise(ev.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">Referral code used</span>
          <input
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-mono text-white"
            value={referralCodeUsed}
            onChange={(ev) => setReferralCodeUsed(ev.target.value.toUpperCase())}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">Referrer user ID</span>
          <input
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-mono text-xs text-white"
            value={referrerId}
            onChange={(ev) => setReferrerId(ev.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Save changes
          </button>
          <button
            type="button"
            disabled={loading || initial.status === "PAID"}
            onClick={() => void patch({ markPaid: true })}
            className="rounded-lg border border-emerald-500/50 px-4 py-2 text-sm font-semibold text-emerald-300"
          >
            Mark as paid
          </button>
        </div>
        {message ? <p className="text-sm text-slate-400">{message}</p> : null}
      </form>
    </AdminCard>
  );
}

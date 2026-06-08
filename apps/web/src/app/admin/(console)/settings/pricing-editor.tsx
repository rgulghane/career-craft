"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MAX_COURSE_FEE_IN_RUPEES } from "@career-craft/shared";
import { AdminCard } from "@/components/admin/admin-card";
import { useAdminAccess } from "@/components/admin/admin-access";

export function PricingEditor({
  initial,
}: {
  initial: { standardInRupees: number; withReferralCodeInRupees: number };
}) {
  const { readOnly } = useAdminAccess();
  const router = useRouter();
  const [standard, setStandard] = useState(String(initial.standardInRupees));
  const [referral, setReferral] = useState(String(initial.withReferralCodeInRupees));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (readOnly) {
    return null;
  }

  async function save() {
    const standardInRupees = Number(standard);
    const withReferralCodeInRupees = Number(referral);

    if (!Number.isInteger(standardInRupees) || standardInRupees < 0) {
      setError(true);
      setMessage("Standard price must be a whole number of rupees.");
      return;
    }
    if (!Number.isInteger(withReferralCodeInRupees) || withReferralCodeInRupees < 0) {
      setError(true);
      setMessage("Referral price must be a whole number of rupees.");
      return;
    }
    if (withReferralCodeInRupees > standardInRupees) {
      setError(true);
      setMessage("Referral price cannot be higher than the standard price.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(false);
    try {
      const r = await fetch("/api/admin/settings/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ standardInRupees, withReferralCodeInRupees }),
      });
      const res = (await r.json()) as { error?: string };
      if (!r.ok) {
        setError(true);
        setMessage(res.error ?? "Failed to update course fees.");
        return;
      }
      setMessage("Course fees updated.");
      router.refresh();
    } catch {
      setError(true);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminCard title="Edit course fees">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className="block text-sm">
          <span className="text-slate-400">Standard price (₹)</span>
          <input
            type="number"
            min={0}
            max={MAX_COURSE_FEE_IN_RUPEES}
            step={1}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            value={standard}
            onChange={(ev) => setStandard(ev.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">Price with referral code (₹)</span>
          <input
            type="number"
            min={0}
            max={MAX_COURSE_FEE_IN_RUPEES}
            step={1}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            value={referral}
            onChange={(ev) => setReferral(ev.target.value)}
          />
        </label>
        <p className="text-xs text-slate-500">
          New fees apply to future enrollments only. Existing enrollment amounts are unchanged.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save course fees"}
          </button>
          {message ? (
            <p className={`text-sm ${error ? "text-red-400" : "text-emerald-400"}`}>{message}</p>
          ) : null}
        </div>
      </form>
    </AdminCard>
  );
}

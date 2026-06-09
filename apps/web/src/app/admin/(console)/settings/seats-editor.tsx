"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCard } from "@/components/admin/admin-card";
import { useAdminAccess } from "@/components/admin/admin-access";

export function SeatsEditor({
  initial,
}: {
  initial: { total: number; remaining: number };
}) {
  const { readOnly } = useAdminAccess();
  const router = useRouter();
  const [total, setTotal] = useState(String(initial.total));
  const [remaining, setRemaining] = useState(String(initial.remaining));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (readOnly) {
    return null;
  }

  async function save() {
    const totalSeats = Number(total);
    const remainingSeats = Number(remaining);

    if (!Number.isInteger(totalSeats) || totalSeats < 1) {
      setError(true);
      setMessage("Total seats must be a whole number of at least 1.");
      return;
    }
    if (!Number.isInteger(remainingSeats) || remainingSeats < 0) {
      setError(true);
      setMessage("Remaining seats must be a whole number of 0 or more.");
      return;
    }
    if (remainingSeats > totalSeats) {
      setError(true);
      setMessage("Remaining seats cannot exceed total capacity.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(false);
    try {
      const r = await fetch("/api/admin/settings/seats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: totalSeats, remaining: remainingSeats }),
      });
      const res = (await r.json()) as { error?: string };
      if (!r.ok) {
        setError(true);
        setMessage(res.error ?? "Failed to update seat counts.");
        return;
      }
      setMessage("Seat counts updated.");
      router.refresh();
    } catch {
      setError(true);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminCard title="Edit seat availability">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className="block text-sm">
          <span className="text-slate-400">Total seats in cohort</span>
          <input
            type="number"
            min={1}
            max={100000}
            step={1}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            value={total}
            onChange={(ev) => setTotal(ev.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">Seats remaining</span>
          <input
            type="number"
            min={0}
            max={100000}
            step={1}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            value={remaining}
            onChange={(ev) => setRemaining(ev.target.value)}
          />
        </label>
        <p className="text-xs text-slate-500">
          Shown on the enrollment widget and urgency banners across the site.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save seat counts"}
          </button>
          {message ? (
            <p className={`text-sm ${error ? "text-red-400" : "text-emerald-400"}`}>{message}</p>
          ) : null}
        </div>
      </form>
    </AdminCard>
  );
}

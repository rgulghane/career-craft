"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SeedMentorsButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSeed() {
    setBusy(true);
    setMessage(null);
    try {
      const r = await fetch("/api/admin/mentors/seed", { method: "POST" });
      const body = (await r.json()) as { count?: number; error?: string };
      if (!r.ok) {
        setMessage(body.error ?? "Seeding failed.");
        return;
      }
      setMessage(`Imported ${body.count ?? 0} mentors.`);
      router.refresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void onSeed()}
        disabled={busy}
        className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
      >
        {busy ? "Importing…" : "Import default mentors"}
      </button>
      {message ? <p className="text-sm text-slate-400">{message}</p> : null}
    </div>
  );
}

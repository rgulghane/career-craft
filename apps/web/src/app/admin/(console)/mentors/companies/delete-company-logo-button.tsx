"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteCompanyLogoButton({ id, company }: { id: string; company: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!window.confirm(`Delete the icon for “${company}”? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/company-logos/${id}`, { method: "DELETE" });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        window.alert(body.error ?? "Delete failed.");
        return;
      }
      router.refresh();
    } catch {
      window.alert("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onDelete()}
      disabled={busy}
      className="text-xs font-medium text-rose-400 transition hover:text-rose-300 disabled:opacity-60"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}

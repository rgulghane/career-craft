"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { messages } from "@career-craft/shared";

export function RevokeReadonlyButton({ adminId, email }: { adminId: string; email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function revoke() {
    if (!confirm(messages.admin.revokeTeamMemberConfirm(email))) {
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/team/${adminId}`, { method: "DELETE" });
      if (!r.ok) {
        const body = (await r.json()) as { error?: string };
        alert(body.error ?? "Failed");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void revoke()}
      className="text-xs font-semibold text-rose-400 hover:text-rose-300 disabled:opacity-50"
    >
      {loading ? "…" : "Revoke"}
    </button>
  );
}

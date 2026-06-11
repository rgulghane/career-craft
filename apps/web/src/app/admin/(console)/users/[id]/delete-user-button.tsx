"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { messages } from "@career-craft/shared";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { useAdminAccess } from "@/components/admin/admin-access";

export function DeleteUserButton({
  userId,
  fullName,
  email,
}: {
  userId: string;
  fullName: string;
  email: string;
}) {
  const { readOnly } = useAdminAccess();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (readOnly) {
    return null;
  }

  function openConfirm() {
    setError(null);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (!loading) {
      setConfirmOpen(false);
      setError(null);
    }
  }

  async function deleteUser() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const body = (await r.json()) as { error?: string };
      if (!r.ok) {
        setError(body.error ?? "Delete failed");
        return;
      }
      setConfirmOpen(false);
      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminCard title="Danger zone">
        <p className="text-sm text-slate-400">
          Permanently delete this user, their enrollments, and referral records linked to them.
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={openConfirm}
          className="mt-4 rounded-lg border border-rose-500/50 bg-rose-950/40 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-950/70 disabled:opacity-60"
        >
          {messages.admin.deleteUserCta}
        </button>
      </AdminCard>

      {confirmOpen ? (
        <AdminConfirmModal
          title={messages.admin.deleteUserCta}
          confirmLabel={messages.admin.deleteUserCta}
          loading={loading}
          onCancel={closeConfirm}
          onConfirm={() => void deleteUser()}
        >
          <p>{messages.admin.deleteUserConfirm(fullName, email)}</p>
          {error ? <p className="mt-3 text-rose-400">{error}</p> : null}
        </AdminConfirmModal>
      ) : null}
    </>
  );
}

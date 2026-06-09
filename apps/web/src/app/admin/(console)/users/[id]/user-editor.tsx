"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PORTAL_ADMIN_TYPES, USER_TYPES, type UserType } from "@career-craft/shared";
import { AdminCard } from "@/components/admin/admin-card";
import { useAdminAccess } from "@/components/admin/admin-access";

type UserRow = {
  id: string;
  email: string;
  fullName: string;
  userType: UserType | null;
};

export function UserEditor({ userId, initial }: { userId: string; initial: UserRow }) {
  const { readOnly } = useAdminAccess();
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.fullName);
  const [email, setEmail] = useState(initial.email);
  const [userType, setUserType] = useState(initial.userType ?? "student");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (readOnly) {
    return null;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const r = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          userType,
        }),
      });
      const body = (await r.json()) as { error?: string };
      if (!r.ok) {
        setMessage(body.error ?? "Save failed");
        return;
      }
      setMessage("Saved");
      router.refresh();
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminCard title="Edit user">
      <form onSubmit={save} className="space-y-4">
        <label className="block text-sm">
          <span className="text-slate-400">Full name</span>
          <input
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">Email</span>
          <input
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">User type</span>
          <select
            className="mt-1 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white"
            value={userType}
            onChange={(e) => setUserType(e.target.value as UserType)}
          >
            {USER_TYPES.filter((t) => !(PORTAL_ADMIN_TYPES as readonly string[]).includes(t)).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          Save
        </button>
        {message ? <p className="text-sm text-slate-400">{message}</p> : null}
      </form>
    </AdminCard>
  );
}

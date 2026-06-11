"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PORTAL_ADMIN_TYPES, USER_TYPES, type UserType } from "@career-craft/shared";
import { AdminCard } from "@/components/admin/admin-card";
import { useAdminAccess } from "@/components/admin/admin-access";
import { formatAdminUserDate } from "@/lib/admin/user-list-config";

type UserDetail = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  collegeName: string | null;
  userType: UserType | null;
  referralCode: string | null;
  hasPaidEnrollment: boolean;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
};

function DetailField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 text-white">{children}</dd>
    </div>
  );
}

function formatUserType(userType: UserType | null): string {
  if (!userType) {
    return "student";
  }
  return userType.replace(/-/g, " ");
}

export function UserDetailsSection({ userId, initial }: { userId: string; initial: UserDetail }) {
  const { readOnly } = useAdminAccess();
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.fullName);
  const [email, setEmail] = useState(initial.email);
  const [userType, setUserType] = useState(initial.userType ?? "student");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = readOnly ? { fullName } : { fullName, email, userType };
      const r = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <AdminCard title="User details">
      <form onSubmit={save} className="space-y-6">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <DetailField label="User ID">
            <span className="font-mono text-xs text-slate-300">{initial.id}</span>
          </DetailField>
          <DetailField label="Full name">
            <input
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </DetailField>
          <DetailField label="Email">
            {readOnly ? (
              <span className="font-mono text-sm text-slate-300">{initial.email}</span>
            ) : (
              <input
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}
          </DetailField>
          <DetailField label="Phone">
            <span className="text-slate-300">{initial.phone ?? "—"}</span>
          </DetailField>
          <DetailField label="College">
            <span className="text-slate-300">{initial.collegeName ?? "—"}</span>
          </DetailField>
          <DetailField label="User type">
            {readOnly ? (
              <span className="capitalize text-slate-300">{formatUserType(initial.userType)}</span>
            ) : (
              <select
                className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 capitalize text-white"
                value={userType}
                onChange={(e) => setUserType(e.target.value as UserType)}
              >
                {USER_TYPES.filter((t) => !(PORTAL_ADMIN_TYPES as readonly string[]).includes(t)).map(
                  (t) => (
                    <option key={t} value={t}>
                      {formatUserType(t)}
                    </option>
                  ),
                )}
              </select>
            )}
          </DetailField>
          <DetailField label="Referral code">
            <span className="font-mono text-slate-300">{initial.referralCode ?? "—"}</span>
          </DetailField>
          <DetailField label="Enrolled">
            <span className={initial.hasPaidEnrollment ? "text-emerald-300" : "text-slate-400"}>
              {initial.hasPaidEnrollment ? "Yes" : "No"}
            </span>
          </DetailField>
          <DetailField label="Google sign-in">
            <span className="text-slate-300">{initial.googleId ? "Linked" : "Not linked"}</span>
          </DetailField>
          <DetailField label="Created">
            <span className="text-slate-300">{formatAdminUserDate(initial.createdAt)}</span>
          </DetailField>
          <DetailField label="Last updated">
            <span className="text-slate-300">{formatAdminUserDate(initial.updatedAt)}</span>
          </DetailField>
        </dl>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Saving…" : readOnly ? "Save name" : "Save changes"}
          </button>
          {message ? <p className="mt-2 text-sm text-slate-400">{message}</p> : null}
        </div>
      </form>
    </AdminCard>
  );
}

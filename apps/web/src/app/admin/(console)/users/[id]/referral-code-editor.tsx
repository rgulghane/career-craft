"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  REFERRAL_CODE_INPUT,
  isValidReferralCodeInput,
  messages,
  normalizeReferralCode,
} from "@career-craft/shared";
import { AdminCard } from "@/components/admin/admin-card";
import { useAdminAccess } from "@/components/admin/admin-access";

export function ReferralCodeEditor({
  userId,
  initialCode,
  hasPaidEnrollment,
}: {
  userId: string;
  initialCode: string | null;
  hasPaidEnrollment: boolean;
}) {
  const { isFullAdmin } = useAdminAccess();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState(initialCode ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveCode(code: string | null) {
    setLoading(true);
    setMessage(null);
    try {
      const r = await fetch(`/api/admin/users/${userId}/referral-code`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: code }),
      });
      const body = (await r.json()) as { referralCode?: string | null; error?: string };
      if (!r.ok) {
        setMessage(body.error ?? messages.errors.generic);
        return;
      }
      setReferralCode(body.referralCode ?? "");
      setMessage(code ? messages.admin.referralCodeSaved : messages.admin.referralCodeCleared);
      router.refresh();
    } catch {
      setMessage(messages.errors.network);
    } finally {
      setLoading(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const code = normalizeReferralCode(referralCode);
    if (!code) {
      setMessage(`Enter a code (${REFERRAL_CODE_INPUT.minLength}–${REFERRAL_CODE_INPUT.maxLength} characters)`);
      return;
    }
    if (!isValidReferralCodeInput(code)) {
      setMessage(
        `Code must be ${REFERRAL_CODE_INPUT.minLength}–${REFERRAL_CODE_INPUT.maxLength} letters or numbers`,
      );
      return;
    }
    await saveCode(code);
  }

  async function onClear() {
    if (!referralCode.trim()) {
      return;
    }
    await saveCode(null);
  }

  async function onRegenerate() {
    setLoading(true);
    setMessage(null);
    try {
      const r = await fetch(`/api/admin/users/${userId}/regenerate-code`, { method: "POST" });
      const body = (await r.json()) as { referralCode?: string; error?: string };
      if (!r.ok) {
        setMessage(body.error ?? messages.errors.generic);
        return;
      }
      setReferralCode(body.referralCode ?? "");
      setMessage(messages.admin.referralCodeRegenerated);
      router.refresh();
    } catch {
      setMessage(messages.errors.network);
    } finally {
      setLoading(false);
    }
  }

  if (!hasPaidEnrollment) {
    return (
      <AdminCard title={messages.admin.referralCodeTitle}>
        <p className="text-sm text-slate-400">{messages.admin.referralCodeEnrolledOnly}</p>
        {initialCode ? (
          <p className="mt-3 font-mono text-sm text-slate-300">{initialCode}</p>
        ) : null}
      </AdminCard>
    );
  }

  return (
    <AdminCard title={messages.admin.referralCodeTitle}>
      <p className="text-sm text-slate-400">{messages.admin.referralCodeHint}</p>

      <form onSubmit={onSave} className="mt-4 space-y-4">
        <label className="block text-sm">
          <span className="text-slate-400">Custom code</span>
          <input
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-mono uppercase text-white placeholder:text-slate-600"
            value={referralCode}
            maxLength={REFERRAL_CODE_INPUT.maxLength}
            placeholder="e.g. SUMMER26"
            onChange={(e) =>
              setReferralCode(
                normalizeReferralCode(e.target.value).slice(0, REFERRAL_CODE_INPUT.maxLength),
              )
            }
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {messages.admin.referralCodeSave}
          </button>
          <button
            type="button"
            disabled={loading || !referralCode.trim()}
            onClick={() => void onClear()}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {messages.admin.referralCodeClear}
          </button>
          {isFullAdmin ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => void onRegenerate()}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {messages.admin.referralCodeRegenerate}
            </button>
          ) : null}
        </div>
        {message ? <p className="text-sm text-slate-400">{message}</p> : null}
      </form>
    </AdminCard>
  );
}

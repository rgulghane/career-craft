"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DIRECT_ENROLLMENT_CATEGORIES,
  DIRECT_ENROLLMENT_CATEGORY_LABELS,
  type DirectEnrollmentCategory,
  messages,
} from "@career-craft/shared";

type Student = {
  id: string;
  email: string;
  fullName: string;
  userType: string | null;
  referralCode: string | null;
  hasPaidEnrollment: boolean;
};

type GrantResult = {
  enrollmentId: string;
  status: string;
  referralCode: string;
  alreadyEnrolled: boolean;
};

const MIN_SEARCH_CHARS = 3;
const SEARCH_DEBOUNCE_MS = 350;

export function DirectEnrollmentTool() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [confirmStudent, setConfirmStudent] = useState<Student | null>(null);
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState<DirectEnrollmentCategory | "">("");
  const [granting, setGranting] = useState(false);

  const requestIdRef = useRef(0);

  const runSearch = useCallback(async (q: string) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setSearching(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&limit=25`);
      const body = (await r.json()) as { items?: Student[]; error?: string };
      if (requestId !== requestIdRef.current) {
        return;
      }
      if (!r.ok) {
        setError(body.error ?? "Search failed");
        setStudents([]);
        return;
      }
      setStudents(body.items ?? []);
      setSearched(true);
    } catch {
      if (requestId === requestIdRef.current) {
        setError(messages.errors.network);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setSearching(false);
      }
    }
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_SEARCH_CHARS) {
      requestIdRef.current += 1;
      setStudents([]);
      setSearched(false);
      setSearching(false);
      return;
    }
    const handle = setTimeout(() => {
      void runSearch(q);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query, runSearch]);

  function openConfirm(student: Student) {
    setReason("");
    setCategory("");
    setError(null);
    setNotice(null);
    setConfirmStudent(student);
  }

  function closeConfirm() {
    if (granting) {
      return;
    }
    setConfirmStudent(null);
  }

  async function confirmGrant() {
    if (!confirmStudent || !category) {
      return;
    }
    const student = confirmStudent;
    setGranting(true);
    setError(null);
    setNotice(null);
    try {
      const r = await fetch(`/api/admin/users/${student.id}/direct-enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, reason: reason.trim() || undefined }),
      });
      const body = (await r.json()) as Partial<GrantResult> & { error?: string };
      if (!r.ok) {
        setError(body.error ?? "Failed to enroll student");
        return;
      }
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id
            ? { ...s, hasPaidEnrollment: true, referralCode: body.referralCode ?? s.referralCode }
            : s,
        ),
      );
      setNotice(
        body.alreadyEnrolled
          ? messages.admin.directEnrollAlready
          : messages.admin.directEnrollSuccess(body.referralCode ?? "—"),
      );
      setConfirmStudent(null);
    } catch {
      setError(messages.errors.network);
    } finally {
      setGranting(false);
    }
  }

  const tooShort = query.trim().length > 0 && query.trim().length < MIN_SEARCH_CHARS;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email or name…"
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
        />
        <p className="text-xs text-slate-500">
          {searching
            ? "Searching…"
            : tooShort
              ? `Type at least ${MIN_SEARCH_CHARS} characters to search.`
              : "Search runs automatically as you type."}
        </p>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}

      {searched && students.length === 0 && !searching ? (
        <p className="text-sm text-slate-500">{messages.admin.directEnrollSearchEmpty}</p>
      ) : null}

      {students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Enrolled</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-medium text-white">{s.fullName}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-300">{s.email}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{s.referralCode ?? "—"}</td>
                  <td className="py-3 pr-4">
                    {s.hasPaidEnrollment ? (
                      <span className="text-emerald-400">Yes</span>
                    ) : (
                      <span className="text-slate-500">No</span>
                    )}
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      disabled={s.hasPaidEnrollment}
                      onClick={() => openConfirm(s)}
                      className="rounded-lg border border-emerald-500/50 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {s.hasPaidEnrollment ? "Enrolled" : messages.admin.directEnrollCta}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {confirmStudent ? (
        <ConfirmEnrollModal
          student={confirmStudent}
          reason={reason}
          onReasonChange={setReason}
          category={category}
          onCategoryChange={setCategory}
          granting={granting}
          onCancel={closeConfirm}
          onConfirm={() => void confirmGrant()}
        />
      ) : null}
    </div>
  );
}

function ConfirmEnrollModal({
  student,
  reason,
  onReasonChange,
  category,
  onCategoryChange,
  granting,
  onCancel,
  onConfirm,
}: {
  student: Student;
  reason: string;
  onReasonChange: (value: string) => void;
  category: DirectEnrollmentCategory | "";
  onCategoryChange: (value: DirectEnrollmentCategory | "") => void;
  granting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !granting) {
        onCancel();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [granting, onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="direct-enroll-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <h2 id="direct-enroll-title" className="text-lg font-semibold text-white">
          {messages.admin.directEnrollTitle}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {messages.admin.directEnrollConfirm(student.fullName, student.email)}
        </p>
        <label className="mt-4 block text-sm">
          <span className="text-slate-400">
            Category
            <span className="ml-0.5 text-rose-400" aria-hidden>
              *
            </span>
          </span>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as DirectEnrollmentCategory | "")}
            autoFocus
            aria-required
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark] focus:border-amber-400 focus:outline-none"
          >
            <option value="" disabled className="bg-slate-900 text-white">
              Select a category…
            </option>
            {DIRECT_ENROLLMENT_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-white">
                {DIRECT_ENROLLMENT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          {!category ? (
            <span className="mt-1 block text-xs text-slate-500">
              Select a category to enable enrollment.
            </span>
          ) : null}
        </label>
        <label className="mt-4 block text-sm">
          <span className="text-slate-400">{messages.admin.directEnrollReasonLabel}</span>
          <input
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            maxLength={500}
            placeholder="e.g. Scholarship / partner agreement"
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
          />
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={granting}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={granting || !category}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {granting ? "Enrolling…" : messages.admin.directEnrollCta}
          </button>
        </div>
      </div>
    </div>
  );
}

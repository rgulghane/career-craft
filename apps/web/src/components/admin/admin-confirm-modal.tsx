"use client";

import { useEffect, useId } from "react";

type AdminConfirmModalProps = {
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  confirmDisabled?: boolean;
  variant?: "danger" | "primary";
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdminConfirmModal({
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  loading = false,
  confirmDisabled = false,
  variant = "danger",
  onCancel,
  onConfirm,
}: AdminConfirmModalProps) {
  const titleId = useId();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [loading, onCancel]);

  const confirmClassName =
    variant === "primary"
      ? "rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      : "rounded-lg border border-rose-500/50 bg-rose-950/40 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-950/70 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <h2 id={titleId} className="text-lg font-semibold text-white">
          {title}
        </h2>
        <div className="mt-2 text-sm text-slate-300">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
            className={confirmClassName}
          >
            {loading ? `${confirmLabel}…` : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

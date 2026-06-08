"use client";

import { useEffect, useState } from "react";
import { ENROLLMENT_WIDGET } from "@career-craft/shared/content";

const { total, remaining } = ENROLLMENT_WIDGET.seats;
const filledPct = Math.round(((total - remaining) / total) * 100);

export function SeatsUrgencyNote({
  className = "",
  variant = "card",
}: {
  className?: string;
  variant?: "card" | "inline";
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 600);
    }, 5200);
    return () => window.clearInterval(id);
  }, []);

  if (variant === "inline") {
    return (
      <p
        className={["text-sm font-medium text-rose-600/90 dark:text-rose-400/90", className].join(" ")}
        role="status"
      >
        <span aria-hidden className="mr-1.5">
          🔥
        </span>
        Only{" "}
        <span
          className={[
            "font-bold tabular-nums transition-transform duration-300",
            pulse ? "scale-110" : "scale-100",
          ].join(" ")}
        >
          {remaining}
        </span>{" "}
        of {total} seats left · {filledPct}% filled
      </p>
    );
  }

  return (
    <div
      className={[
        "w-full max-w-md rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/90 via-amber-50/60 to-orange-50/40 px-5 py-4 text-center shadow-sm dark:border-rose-500/25 dark:from-rose-950/40 dark:via-amber-950/25 dark:to-orange-950/20",
        className,
      ].join(" ")}
      role="status"
    >
      <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">
        <span aria-hidden className="mr-1">
          🔥
        </span>
        Hurry — only{" "}
        <span
          className={[
            "inline-block font-bold tabular-nums text-rose-600 transition-transform duration-300 dark:text-rose-400",
            pulse ? "scale-110" : "scale-100",
          ].join(" ")}
        >
          {remaining}
        </span>{" "}
        of{" "}
        <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">{total}</span> seats
        left in {ENROLLMENT_WIDGET.cohortLabel}
      </p>
      <p className="mt-1.5 text-xs text-rose-800/80 dark:text-rose-200/70">
        {filledPct}% filled · enrollment closes when we hit capacity
      </p>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-rose-100 dark:bg-rose-950/60"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 transition-[width] duration-700"
          style={{ width: `${filledPct}%` }}
        />
      </div>
    </div>
  );
}

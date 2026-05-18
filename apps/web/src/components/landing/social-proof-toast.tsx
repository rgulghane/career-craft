"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialToastDelayMs,
  nextToastDelayMs,
  randomSocialProofToast,
  toastVisibleMs,
  type SocialProofToast,
} from "@/lib/social-proof-events";

const VARIANT_ICON: Record<SocialProofToast["variant"], string> = {
  purchase: "🎓",
  referral: "🏷️",
  earn: "💸",
  join: "✨",
};

export function SocialProofToast() {
  const [toast, setToast] = useState<SocialProofToast | null>(null);
  const [phase, setPhase] = useState<"hidden" | "enter" | "visible" | "exit">("hidden");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback(
    (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
    },
    [],
  );

  const showToast = useCallback(() => {
    const next = randomSocialProofToast();
    setToast(next);
    setPhase("enter");

    schedule(() => setPhase("visible"), 40);

    const visibleFor = toastVisibleMs();
    schedule(() => setPhase("exit"), visibleFor);
    schedule(() => {
      setPhase("hidden");
      setToast(null);
    }, visibleFor + 320);
    schedule(showToast, visibleFor + 320 + nextToastDelayMs());
  }, [schedule]);

  useEffect(() => {
    schedule(showToast, initialToastDelayMs());
    return clearTimers;
  }, [clearTimers, schedule, showToast]);

  if (!toast || phase === "hidden") {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 sm:bottom-6"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={[
          "social-proof-toast flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md",
          "border-slate-200/80 bg-white/95 text-slate-800",
          "dark:border-white/15 dark:bg-slate-900/95 dark:text-slate-100",
          "dark:shadow-black/40",
          phase === "enter" && "social-proof-toast--enter",
          phase === "visible" && "social-proof-toast--visible",
          phase === "exit" && "social-proof-toast--exit",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-base"
          aria-hidden
        >
          <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative">{VARIANT_ICON[toast.variant]}</span>
        </span>
        <p className="text-pretty text-sm leading-snug">{toast.text}</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ENROLLMENT_WIDGET } from "@career-craft/shared/content";

const STORAGE_KEY = "cc_viewing_count";
const { initial, min, max, updateEveryMs } = ENROLLMENT_WIDGET.viewingCount;

function randomBetween(low: number, high: number): number {
  return low + Math.floor(Math.random() * (high - low + 1));
}

/** Small, believable step — drifts within 20–80 like a live counter. */
function nextCount(current: number): number {
  const delta = Math.random() < 0.75 ? randomBetween(-1, 2) : randomBetween(-3, 4);
  let next = current + delta;

  if (next <= min + 1) next = randomBetween(min, min + 4);
  if (next >= max - 1) next = randomBetween(max - 4, max);

  return Math.min(max, Math.max(min, next));
}

function readStoredCount(): number | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const n = Number(stored);
  if (Number.isNaN(n) || n < min || n > max) return null;
  return n;
}

function resolveCount(): number {
  const stored = readStoredCount();
  if (stored !== null) return stored;
  const start = randomBetween(min, max);
  window.localStorage.setItem(STORAGE_KEY, String(start));
  return start;
}

export function ViewingNowBanner() {
  const [count, setCount] = useState<number>(initial);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setCount(resolveCount());

    let timeoutId = 0;
    let pulseTimeoutId = 0;

    function scheduleNext() {
      const delay = randomBetween(updateEveryMs.min, updateEveryMs.max);
      timeoutId = window.setTimeout(() => {
        setCount((prev) => {
          const next = nextCount(prev);
          window.localStorage.setItem(STORAGE_KEY, String(next));
          return next;
        });
        setPulse(true);
        pulseTimeoutId = window.setTimeout(() => {
          setPulse(false);
        }, 400);
        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(pulseTimeoutId);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/80 px-4 py-3.5 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40">
      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
        <span
          className={[
            "inline-block font-bold tabular-nums text-emerald-700 transition-all duration-300 dark:text-emerald-300",
            pulse ? "scale-110 text-emerald-600 dark:text-emerald-200" : "scale-100",
          ].join(" ")}
        >
          {count}
        </span>{" "}
        people viewing right now
      </p>
    </div>
  );
}

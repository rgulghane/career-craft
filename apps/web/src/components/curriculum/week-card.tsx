"use client";

import { useId, useState } from "react";
import type { CURRICULUM_WEEKS } from "@career-craft/shared";

type WeekItem = (typeof CURRICULUM_WEEKS)[number];

export function CurriculumWeekCard({ item }: { item: WeekItem }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/80">
      <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Week {item.week}
        </p>
        <h2 className="mt-2 text-lg font-bold leading-snug text-slate-900 dark:text-white">{item.title}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tools.map((tool) => (
            <span
              key={tool}
              className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800 dark:bg-sky-500/20 dark:text-sky-200"
            >
              {tool}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 transition hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:hover:bg-amber-500/30"
            aria-label={open ? "Collapse week details" : "Expand week details"}
          >
            <svg
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {open ? (
          <div
            id={panelId}
            className="mt-5 border-t border-slate-200 pt-5 text-sm dark:border-white/10"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              {item.details.liveSession}
            </p>
            <div className="mt-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Session topics</h3>
              <ul className="mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                {item.details.topics.map((topic) => (
                  <li key={topic} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <h3 className="font-semibold text-slate-900 dark:text-white">Hands-on lab</h3>
              <p className="mt-1 text-slate-600 dark:text-slate-400">{item.details.handsOn}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Weekly deliverable</h3>
              <p className="mt-1 text-slate-600 dark:text-slate-400">{item.details.deliverable}</p>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

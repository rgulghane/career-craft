import type { Metadata } from "next";
import Link from "next/link";
import { CURRICULUM_PAGE, LANDING, PROGRAM } from "@career-craft/shared";
import { AppPageShell } from "@/components/app-page-shell";
import { CurriculumWeekGrid } from "@/components/curriculum/week-grid";

export const metadata: Metadata = {
  title: `Curriculum — ${PROGRAM.name}`,
  description:
    "12-week industry AI accelerator: ChatGPT, Excel, SQL, Power BI, Canva, automation, case studies, and placement week.",
};

export default function CurriculumPage() {
  return (
    <AppPageShell>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          {CURRICULUM_PAGE.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {CURRICULUM_PAGE.title}
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{CURRICULUM_PAGE.subtitle}</p>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          {LANDING.schedule.live} · {LANDING.schedule.note}
        </p>
      </div>

      <div className="mt-12">
        <CurriculumWeekGrid />
      </div>

      <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">{LANDING.legal.placementNote}</p>

      <div className="mt-8 flex justify-center">
        <Link
          href="/#pricing"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/25 transition hover:from-amber-400 hover:to-orange-500"
        >
          View enrollment offer
        </Link>
      </div>
    </AppPageShell>
  );
}

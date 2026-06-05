import Link from "next/link";
import { CURRICULUM_PAGE, CURRICULUM_WEEKS, LANDING } from "@career-craft/shared";
import { Section } from "./section";

export function LandingCurriculum() {
  return (
    <Section id="curriculum" dark>
      <div className="max-w-2xl sm:hidden">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          {CURRICULUM_PAGE.eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">{CURRICULUM_PAGE.title}</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          {LANDING.schedule.live}. {LANDING.schedule.note}
        </p>
      </div>

      <div className="mt-8 space-y-2 sm:hidden">
        {CURRICULUM_WEEKS.map((item) => (
          <details
            key={item.week}
            className="group rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/90 dark:shadow-lg dark:shadow-black/20"
          >
            <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                {item.week}
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Week {item.week}
                </span>
                <span className="mt-0.5 block text-left text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                  {item.title}
                </span>
              </span>
              <span
                className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition group-open:rotate-180 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400"
                aria-hidden
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-white/10">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800 dark:bg-sky-500/20 dark:text-sky-200"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>

      <Link
        href="/curriculum"
        className="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 sm:hidden dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:border-amber-500/50 dark:hover:bg-amber-500/10"
      >
        View full curriculum
      </Link>

      <div className="hidden max-w-2xl sm:block">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          {CURRICULUM_PAGE.eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Industry-ready in three phases</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          {LANDING.schedule.live}. {LANDING.schedule.note}
        </p>
      </div>

      <div className="mt-12 hidden gap-6 sm:grid lg:grid-cols-3">
        {LANDING.phases.map((p, i) => (
          <article
            key={p.phase}
            className="relative rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm shadow-slate-200/50 dark:border-slate-700/60 dark:from-slate-800/90 dark:to-slate-900/95 dark:shadow-lg dark:shadow-black/30"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {p.phase}
            </span>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.weeks}</p>
            <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{p.theme}</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {p.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="shrink-0 text-amber-500 dark:text-amber-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <span className="absolute right-4 top-4 text-4xl font-bold text-slate-100 dark:text-white/[0.07]">
              {i + 1}
            </span>
          </article>
        ))}
      </div>
    </Section>
  );
}

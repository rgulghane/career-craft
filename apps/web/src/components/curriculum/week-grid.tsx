import { CURRICULUM_WEEKS } from "@career-craft/shared";

export function CurriculumWeekGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {CURRICULUM_WEEKS.map((item) => (
        <article
          key={item.week}
          className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/80"
        >
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
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                aria-hidden
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

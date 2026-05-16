import { LANDING } from "@career-craft/shared";
import { Section } from "./section";

export function LandingCurriculum() {
  return (
    <Section id="curriculum" dark>
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          12-week accelerator
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Industry-ready in three phases</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          {LANDING.schedule.live}. {LANDING.schedule.note}
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
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

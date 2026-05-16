import { LANDING } from "@career-craft/shared";
import { Section } from "./section";

export function LandingToolsMentors() {
  return (
    <Section id="tools" className="bg-slate-50 dark:bg-slate-100">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Tools you will master</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Employer-demand stack, not theory-only
          </h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {LANDING.tools.map((tool) => (
              <span
                key={tool}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-300"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Mentor network</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Learn from people at top companies
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LANDING.mentors.map((name) => (
              <div
                key={name}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-4 text-center text-xs font-semibold text-slate-800 shadow-sm sm:text-sm dark:border-slate-300"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

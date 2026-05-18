import { LANDING } from "@career-craft/shared";
import { Section } from "./section";

export function LandingFaq() {
  const { eyebrow, title, subtitle, items } = LANDING.faq;

  return (
    <Section id="faq" className="bg-white dark:bg-slate-950">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {title}
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>

      <div className="mt-10 grid max-w-6xl gap-4 lg:grid-cols-2 lg:gap-5">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-slate-200 bg-slate-50 px-5 py-1 sm:px-6 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-slate-900 marker:content-none sm:text-base dark:text-white [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition group-open:rotate-45 group-open:border-amber-500/40 group-open:text-amber-600 dark:border-white/15 dark:bg-slate-900 dark:text-slate-400 dark:group-open:text-amber-400"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="pb-4 pr-10 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

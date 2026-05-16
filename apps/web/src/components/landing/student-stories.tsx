import { LANDING } from "@career-craft/shared";
import { Section } from "./section";

function StarRating() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-amber-400" aria-hidden>
          ★
        </span>
      ))}
    </div>
  );
}

export function LandingStudentStories() {
  const { eyebrow, title, items } = LANDING.studentStories;

  return (
    <Section id="stories" className="bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {title}
        </h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {items.map((story) => (
          <article
            key={story.name}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/80 dark:shadow-none"
          >
            <StarRating />
            <blockquote className="mt-4 flex-1 text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">
              &ldquo;{story.quote}&rdquo;
            </blockquote>
            <footer className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-700/60">
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${story.avatarClass}`}
                aria-hidden
              >
                {story.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{story.name}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{story.role}</p>
              </div>
            </footer>
          </article>
        ))}
      </div>
    </Section>
  );
}

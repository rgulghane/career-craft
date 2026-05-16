import { LANDING } from "@career-craft/shared";

export function LandingCertifications() {
  const { title, subtitle, badges } = LANDING.certificationsSection;

  return (
    <section
      id="certifications"
      className="relative px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-24 bg-slate-950"
    >
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">{subtitle}</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {badges.map((badge) => (
            <span
              key={badge.name}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-100 shadow-sm"
            >
              <span className="text-base leading-none" aria-hidden>
                {badge.icon}
              </span>
              {badge.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

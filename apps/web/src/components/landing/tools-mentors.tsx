import { Section } from "./section";
import { MentorsProfiles } from "./mentors-profiles";
import { ToolsCarousel } from "./tools-carousel";

export function LandingToolsMentors() {
  return (
    <Section id="tools" dark>
      <div className="grid min-w-0 gap-12 lg:grid-cols-2 lg:items-start">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-700 dark:text-amber-400">
            Tools you will master
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Employer-demand stack, not theory-only</h2>
          <ToolsCarousel />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-700 dark:text-amber-400">
            Mentor network
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Learn from people at top companies
          </h2>
          <MentorsProfiles />
        </div>
      </div>
    </Section>
  );
}

import { LANDING } from "@career-craft/shared";
import { Section } from "./section";
import { MentorsProfiles } from "./mentors-profiles";
import type { MentorCardData } from "./mentor-spotlight-card";
import { ToolsCarousel } from "./tools-carousel";
import { listPublishedMentors } from "@/server/services/admin/mentors";

const STATIC_MENTORS: MentorCardData[] = LANDING.mentors.map((m) => ({
  name: m.name,
  designation: m.designation,
  company: m.company,
  previouslyAt: m.previouslyAt,
  linkedInUrl: m.linkedInUrl,
  photo: m.photo,
}));

/** Admin-managed mentors when present; falls back to the bundled defaults. */
async function resolveMentors(): Promise<MentorCardData[]> {
  try {
    const published = await listPublishedMentors();
    if (published.length > 0) {
      return published.map((m) => ({
        name: m.name,
        designation: m.designation,
        company: m.company,
        previouslyAt: m.previouslyAt,
        linkedInUrl: m.linkedInUrl,
        photo: m.photo,
      }));
    }
  } catch {
    // Fall back to static content if the database is unreachable.
  }
  return STATIC_MENTORS;
}

export async function LandingToolsMentors() {
  const mentors = await resolveMentors();

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
          <MentorsProfiles mentors={mentors} />
        </div>
      </div>
    </Section>
  );
}

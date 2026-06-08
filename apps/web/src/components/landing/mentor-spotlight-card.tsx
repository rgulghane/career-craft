import Image from "next/image";
import { LogoImage } from "./logo-image";
import { MentorCompanyLogo } from "./mentor-company-logo";
import { toolBrandIconUrl } from "./tool-brands";

/** A single company the mentor previously worked at, with an optional icon. */
export type MentorPreviousCompany = {
  name: string;
  logoUrl?: string | null;
};

export type MentorCardData = {
  name: string;
  designation: string;
  /** The company the mentor currently works at. */
  company: string;
  /** Preferred brand icon URL for the current company (optional). */
  companyLogoUrl?: string | null;
  /** Companies the mentor previously worked at (most recent first). */
  previouslyAt?: MentorPreviousCompany[];
  linkedInUrl: string;
  photo: string;
};

function LinkedInBadge() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#0A66C2] shadow-md shadow-[#0A66C2]/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={toolBrandIconUrl("linkedin")}
        alt=""
        width={15}
        height={15}
        className="h-[0.95rem] w-[0.95rem] brightness-0 invert"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}

export function MentorSpotlightCard({
  mentor,
  priority,
}: {
  mentor: MentorCardData;
  priority?: boolean;
}) {
  const hasLinkedIn = Boolean(mentor.linkedInUrl && mentor.linkedInUrl.trim() !== "" && mentor.linkedInUrl !== "#");
  return (
    <article className="group relative mx-auto w-full max-w-[23rem] sm:max-w-[25rem]">
      {/* Ambient glow behind card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-amber-400/25 via-orange-300/10 to-transparent opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.28)] ring-1 ring-slate-200/80 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_28px_60px_-14px_rgba(15,23,42,0.35)]">
        {/* Header band */}
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-white">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(251,191,36,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 0%, rgba(249,115,22,0.2) 0%, transparent 40%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,23,42,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.6) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          {hasLinkedIn ? (
            <a
              href={mentor.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-4 top-4 z-10 transition hover:scale-105 hover:opacity-90"
              aria-label={`${mentor.name} on LinkedIn`}
            >
              <LinkedInBadge />
            </a>
          ) : (
            <span
              aria-hidden
              className="absolute right-4 top-4 z-10 cursor-not-allowed opacity-40 grayscale"
            >
              <LinkedInBadge />
            </span>
          )}

          <span className="absolute left-4 top-4 rounded-full bg-white/80 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-amber-700 shadow-sm ring-1 ring-amber-200/60 backdrop-blur-sm">
            Mentor
          </span>
        </div>

        {/* Profile photo — overlaps header */}
        <div className="-mt-[4.5rem] flex justify-center px-6">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-2 rounded-full bg-gradient-to-br from-amber-300/60 via-orange-200/40 to-transparent blur-md"
            />
            <div className="relative h-[8.75rem] w-[8.75rem] overflow-hidden rounded-full bg-slate-100 ring-[5px] ring-white shadow-lg shadow-slate-900/15">
              <Image
                src={mentor.photo}
                alt=""
                fill
                sizes="140px"
                className="object-cover object-top transition duration-500 group-hover:scale-105"
                priority={priority}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-[11.5rem] flex-col items-center px-7 pb-7 pt-5 text-center">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[1.35rem]">
            {mentor.name}
          </h3>
          <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-slate-500 sm:text-[0.95rem]">
            {mentor.designation}
          </p>

          <div className="mt-6 w-full">
            <p className="mb-2 flex items-center justify-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Currently at
            </p>
            <div className="flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-[0_4px_14px_-8px_rgba(15,23,42,0.25)]">
              <MentorCompanyLogo company={mentor.company} logoUrl={mentor.companyLogoUrl} />
            </div>
          </div>

          {mentor.previouslyAt && mentor.previouslyAt.length > 0 ? (
            <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Previously
              </span>
              {mentor.previouslyAt.map((prev, index) => (
                <span
                  key={`${prev.name}-${index}`}
                  title={prev.name}
                  className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-slate-200/80 bg-white shadow-sm transition hover:scale-110 hover:border-slate-300"
                >
                  <LogoImage
                    src={prev.logoUrl}
                    alt={prev.name}
                    className="h-4 w-4 object-contain"
                    fallback={
                      <span className="text-[0.65rem] font-bold uppercase text-slate-500">
                        {prev.name.slice(0, 2)}
                      </span>
                    }
                  />
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 min-h-[1.5rem]" aria-hidden />
          )}
        </div>
      </div>
    </article>
  );
}

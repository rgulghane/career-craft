import Image from "next/image";
import { mentorCompanyLogoUrl } from "./company-logo-slugs";
import { LogoImage } from "./logo-image";
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

/** True when a photo source can actually be rendered (http(s) or local path). */
function hasRenderablePhoto(url: string | undefined | null): boolean {
  return Boolean(url && /^(https?:\/\/|\/)\S*/i.test(url.trim()));
}

/** Generic profile placeholder shown when a mentor has no usable photo. */
function DefaultMentorAvatar() {
  return (
    <div
      aria-hidden
      className="flex h-full w-full items-end justify-center bg-gradient-to-br from-slate-100 to-slate-200"
    >
      <svg viewBox="0 0 24 24" className="h-[7.75rem] w-[7.75rem] text-slate-300" fill="currentColor">
        <path d="M12 12.5a4.75 4.75 0 1 0 0-9.5 4.75 4.75 0 0 0 0 9.5Zm0 1.75c-4.7 0-8.5 2.86-8.5 6.39 0 .47.38.86.85.86h15.3c.47 0 .85-.39.85-.86 0-3.53-3.8-6.39-8.5-6.39Z" />
      </svg>
    </div>
  );
}

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

/** A square, consistently-sized brand logo with an initials fallback. */
function CompanyLogoTile({
  company,
  logoUrl,
  className,
  imgClassName,
  initialsClassName,
}: {
  company: string;
  logoUrl?: string | null;
  className: string;
  imgClassName: string;
  initialsClassName: string;
}) {
  return (
    <span className={className}>
      <LogoImage
        src={logoUrl}
        alt={company}
        className={imgClassName}
        fallback={
          <span className={initialsClassName}>{company.trim().slice(0, 2).toUpperCase()}</span>
        }
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
  const currentLogoUrl = mentor.companyLogoUrl?.trim() || mentorCompanyLogoUrl(mentor.company);
  const previousCompanies = mentor.previouslyAt ?? [];
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
              {hasRenderablePhoto(mentor.photo) ? (
                <Image
                  src={mentor.photo}
                  alt=""
                  fill
                  sizes="140px"
                  className="object-cover object-top transition duration-500 group-hover:scale-105"
                  priority={priority}
                />
              ) : (
                <DefaultMentorAvatar />
              )}
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

          {/* Career: current company (emphasized) + previous companies (muted) */}
          <div className="mt-6 w-full">
            <div className="flex justify-center">
              <span className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/70 py-1.5 pl-1.5 pr-4 shadow-[0_4px_14px_-8px_rgba(217,119,6,0.4)]">
                <CompanyLogoTile
                  company={mentor.company}
                  logoUrl={currentLogoUrl}
                  className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-amber-200/70"
                  imgClassName="h-5 w-5 object-contain"
                  initialsClassName="text-[0.7rem] font-bold uppercase text-amber-700"
                />
                <span className="min-w-0 text-left leading-tight">
                  <span className="block text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-amber-600">
                    Currently at
                  </span>
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {mentor.company}
                  </span>
                </span>
              </span>
            </div>

            {previousCompanies.length > 0 ? (
              <div className="mt-3.5">
                <p className="mb-2 text-center text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Previously at
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {previousCompanies.map((prev, index) => (
                    <span
                      key={`${prev.name}-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 py-1 pl-1 pr-2.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white"
                    >
                      <CompanyLogoTile
                        company={prev.name}
                        logoUrl={prev.logoUrl}
                        className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-slate-200/80"
                        imgClassName="h-3.5 w-3.5 object-contain"
                        initialsClassName="text-[0.55rem] font-bold uppercase text-slate-500"
                      />
                      <span className="max-w-[8rem] truncate">{prev.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-3.5 min-h-[1.75rem]" aria-hidden />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

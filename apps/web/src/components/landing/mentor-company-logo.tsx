"use client";

import { mentorCompanyLogoUrl } from "./company-logo-slugs";
import { LogoImage } from "./logo-image";

export { mentorCompanyLogoUrl };

export function MentorCompanyLogo({
  company,
  logoUrl,
}: {
  company: string;
  logoUrl?: string | null;
}) {
  const resolvedUrl = logoUrl?.trim() || mentorCompanyLogoUrl(company);

  return (
    <LogoImage
      src={resolvedUrl}
      alt={company}
      className="mx-auto h-8 w-auto max-w-[9rem] object-contain sm:h-9"
      fallback={
        <p className="text-base font-semibold tracking-tight text-slate-800">{company}</p>
      }
    />
  );
}

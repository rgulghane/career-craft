"use client";

import { resolveCompanyLogoUrls } from "./company-logo-slugs";
import { LogoImage } from "./logo-image";

export { mentorCompanyLogoUrl, resolveCompanyLogoUrls } from "./company-logo-slugs";

export function MentorCompanyLogo({
  company,
  logoUrl,
}: {
  company: string;
  logoUrl?: string | null;
}) {
  return (
    <LogoImage
      sources={resolveCompanyLogoUrls(company, logoUrl)}
      alt={company}
      className="mx-auto h-8 w-auto max-w-[9rem] object-contain sm:h-9"
      fallback={
        <p className="text-base font-semibold tracking-tight text-slate-800">{company}</p>
      }
    />
  );
}

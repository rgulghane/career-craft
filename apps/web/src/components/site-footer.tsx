import Link from "next/link";
import type { ReactNode } from "react";
import { LANDING, PROGRAM } from "@career-craft/shared";
import { FOOTER } from "@/lib/footer-content";
import { ThemeToggle } from "./theme-toggle";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16v12H4V6zm0 0 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-500">
      {children}
    </h2>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const className =
    "text-sm text-slate-600 transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{PROGRAM.name}</p>
            <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              {FOOTER.brandLine}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{FOOTER.about}</p>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
              {LANDING.schedule.live} · {LANDING.schedule.note}
            </p>
          </div>

          <div>
            <FooterHeading>Explore</FooterHeading>
            <ul className="mt-4 space-y-2.5">
              <li>
                <FooterLink href="/curriculum">Curriculum</FooterLink>
              </li>
              <li>
                <FooterLink href="/#pricing">Pricing</FooterLink>
              </li>
              <li>
                <FooterLink href="/enroll">Enroll</FooterLink>
              </li>
              <li>
                <FooterLink href="/dashboard">Referral dashboard</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <FooterHeading>Company</FooterHeading>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="font-medium text-slate-800 dark:text-slate-200">{FOOTER.company.name}</li>
              <li>{FOOTER.company.parent}</li>
              <li className="text-slate-500 dark:text-slate-500">{FOOTER.company.tagline}</li>
            </ul>
          </div>

          <div>
            <FooterHeading>Contact</FooterHeading>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href={`mailto:${FOOTER.contactEmail}`}
                  className="group flex items-start gap-3 text-sm transition hover:text-amber-600 dark:hover:text-amber-400"
                >
                  <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>
                    <span className="block text-xs text-slate-500 dark:text-slate-500">General enquiries</span>
                    <span className="font-medium text-slate-700 group-hover:text-inherit dark:text-slate-300">
                      {FOOTER.contactEmail}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${FOOTER.assignmentsEmail}`}
                  className="group flex items-start gap-3 text-sm transition hover:text-amber-600 dark:hover:text-amber-400"
                >
                  <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>
                    <span className="block text-xs text-slate-500 dark:text-slate-500">Assignments</span>
                    <span className="font-medium text-slate-700 group-hover:text-inherit dark:text-slate-300">
                      {FOOTER.assignmentsEmail}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={FOOTER.office.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 text-sm transition hover:text-amber-600 dark:hover:text-amber-400"
                >
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>
                    <span className="block text-xs text-slate-500 dark:text-slate-500">
                      {FOOTER.office.label}
                    </span>
                    <span className="font-medium text-slate-700 group-hover:text-inherit dark:text-slate-300">
                      {FOOTER.office.name}
                    </span>
                    <span className="mt-0.5 block text-slate-500 dark:text-slate-500">
                      {FOOTER.office.area}
                    </span>
                    <span className="mt-1 inline-block text-xs font-semibold text-amber-600 group-hover:underline dark:text-amber-400">
                      {FOOTER.office.directionsLabel} →
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © {year} {FOOTER.company.name} · {FOOTER.company.parent}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}

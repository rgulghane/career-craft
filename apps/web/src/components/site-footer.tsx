import Link from "next/link";
import { PROGRAM } from "@career-craft/shared";
import { ThemeToggle } from "./theme-toggle";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{PROGRAM.name}</p>
            <p className="mt-2 max-w-sm text-sm">
              12-week industry accelerator · UniConnect · TechnoSpectra EdTech, Nagpur
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <Link className="hover:text-slate-900 dark:hover:text-white" href="/#curriculum">
              Curriculum
            </Link>
            <Link className="hover:text-slate-900 dark:hover:text-white" href="/#pricing">
              Pricing
            </Link>
            <Link className="hover:text-slate-900 dark:hover:text-white" href="/enroll">
              Enroll
            </Link>
            <Link className="hover:text-slate-900 dark:hover:text-white" href="/dashboard">
              Referrals
            </Link>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <p className="text-xs">
            contact@uniconnect.app · Demo referral platform — payments are mocked in this build.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { messages } from "@career-craft/shared/content";

const ctaClass =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-orange-500/35 transition hover:from-amber-400 hover:via-orange-400 hover:to-orange-500 hover:shadow-orange-500/45";

export function EnrolledCongratulationsCard({
  firstName,
  referralCode = null,
}: {
  firstName?: string;
  referralCode?: string | null;
}) {
  const greeting = firstName
    ? `Congratulations, ${firstName}!`
    : messages.enroll.enrolledTitle;

  return (
    <aside
      className="enrollment-widget w-full max-w-none overflow-hidden rounded-2xl border border-emerald-200/70 bg-white text-slate-900 shadow-xl shadow-emerald-500/10 ring-1 ring-slate-900/5 dark:border-emerald-500/25 dark:bg-slate-900 dark:text-white dark:shadow-2xl dark:shadow-black/40 dark:ring-white/10"
      id="pricing"
    >
      <div className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50 via-amber-50 to-orange-50 px-5 py-6 dark:border-emerald-500/20 dark:from-emerald-950/50 dark:via-amber-950/40 dark:to-orange-950/30">
        <p className="text-4xl" aria-hidden>
          🎉
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          {greeting}
        </h2>
        <p className="mt-2 text-sm text-slate-600 sm:text-base dark:text-slate-300">
          {messages.enroll.enrolledSubtitle}
        </p>
        {referralCode ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Your referral code:{" "}
            <span className="font-mono font-semibold tracking-wide text-emerald-700 dark:text-emerald-400">
              {referralCode}
            </span>
          </p>
        ) : null}
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Your benefits
        </h3>
        <ul className="mt-4 space-y-3">
          {messages.enroll.enrolledBenefits.map((benefit) => (
            <li key={benefit} className="flex gap-3 text-sm text-slate-700 sm:text-base dark:text-slate-300">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                aria-hidden
              >
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <Link href="/dashboard" className={`${ctaClass} mt-6`}>
          {messages.enroll.enrolledDashboardCta}
        </Link>
      </div>
    </aside>
  );
}

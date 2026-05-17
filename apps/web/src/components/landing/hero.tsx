import Link from "next/link";
import { LANDING, PROGRAM } from "@career-craft/shared";
import { EnrolledCongratulationsCard } from "@/components/enrolled-congratulations-card";
import { EnrollmentPricingWidget } from "@/components/enrollment-pricing-widget";

export function LandingHero({
  isLoggedIn = false,
  isEnrolled = false,
  firstName,
  referralCode = null,
  defaultReferralCode = "",
}: {
  isLoggedIn?: boolean;
  isEnrolled?: boolean;
  firstName?: string;
  referralCode?: string | null;
  defaultReferralCode?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-600/30" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/20" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[120%] -translate-x-1/2 bg-gradient-to-t from-slate-100 to-transparent dark:from-slate-950" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="grid items-start gap-10 grid-cols-1 enroll:grid-cols-[1fr_minmax(0,28rem)] enroll:gap-12 xl:gap-16">
          <div className="order-2 min-w-0 enroll:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-amber-700 backdrop-blur-sm sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              {LANDING.hero.badge}
            </div>

            <p className="mt-6 text-sm font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {PROGRAM.name}
            </p>
            <h1 className="mt-3 max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {LANDING.hero.title}{" "}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-orange-400 dark:to-rose-400">
                {LANDING.hero.titleAccent}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base text-slate-600 sm:text-lg dark:text-slate-300">
              {LANDING.hero.subtitle}
            </p>
            <p className="mt-3 text-sm text-slate-500">{LANDING.hero.poweredBy}</p>

            <div className="mt-8 enroll:hidden">
              <Link
                href="/enroll"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/25 transition hover:from-amber-400 hover:to-orange-500"
              >
                View enrollment offer
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 enroll:grid-cols-2 xl:grid-cols-4">
              {LANDING.stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:backdrop-blur-sm"
                >
                  <dt className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{s.value}</dt>
                  <dd className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">{s.label}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{LANDING.legal.placementNote}</p>

            <Link
              href="/curriculum"
              className="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:border-amber-500/50 dark:hover:bg-amber-500/10"
            >
              View full curriculum
            </Link>
          </div>

          <div className="order-1 min-w-0 enroll:order-2 enroll:sticky enroll:top-24">
            {isEnrolled ? (
              <EnrolledCongratulationsCard firstName={firstName} referralCode={referralCode} />
            ) : (
              <EnrollmentPricingWidget
                mode="marketing"
                isLoggedIn={isLoggedIn}
                defaultReferralCode={defaultReferralCode}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

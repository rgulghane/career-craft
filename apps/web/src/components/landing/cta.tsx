import Link from "next/link";
import { PROGRAM } from "@career-craft/shared";

export function LandingCta({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-100 via-slate-100 to-white px-4 py-20 text-slate-900 sm:px-6 lg:px-8 dark:from-violet-950 dark:via-slate-950 dark:to-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent dark:from-amber-500/10" />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to craft your career with {PROGRAM.name}?
        </h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Join Cohort 4. Limited seats. Start with a referral code and unlock half-price enrollment.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex min-w-[200px] items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-sm font-semibold text-slate-950 shadow-lg transition hover:from-amber-400 hover:to-orange-500"
          >
            Reserve your seat
          </Link>
          {!isLoggedIn ? (
            <Link
              href="/login"
              className="inline-flex min-w-[200px] items-center justify-center rounded-xl border border-slate-300 px-8 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-white/25 dark:text-white dark:hover:bg-white/10"
            >
              Sign in to your account
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

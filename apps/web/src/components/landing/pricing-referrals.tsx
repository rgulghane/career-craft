import Link from "next/link";
import { LANDING, REFERRAL_POLICY } from "@career-craft/shared";
import { listPrices } from "@/lib/format";
import { Section } from "./section";

export function LandingPricingReferrals() {
  const prices = listPrices();

  return (
    <>
      <Section id="pricing-plans" className="bg-white">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Simple pricing</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Affordable for Tier II & III India
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-8">
            <p className="text-sm font-semibold text-slate-500">Standard</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{prices.standard}</p>
            <p className="mt-2 text-sm text-slate-600">Full 12-week program · Live classes · 5 certificates</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li>2× 1:1 mentor sessions / month</li>
              <li>6-month placement support</li>
              <li>WhatsApp alumni community</li>
            </ul>
            <Link
              href="/register"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Enroll at standard price
            </Link>
          </article>

          <article className="relative rounded-3xl border-2 border-amber-500 bg-gradient-to-b from-amber-50 to-orange-50 p-8 shadow-lg shadow-amber-500/10">
            <span className="absolute -top-3 right-6 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950">
              Best value
            </span>
            <p className="text-sm font-semibold text-amber-800">With referral code</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{prices.withReferral}</p>
            <p className="mt-1 text-sm text-amber-800 line-through opacity-70">{prices.standard}</p>
            <p className="mt-2 text-sm text-slate-700">50% off when a friend refers you</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li>Everything in standard</li>
              <li>Referral agent dashboard access</li>
              <li>Earn {LANDING.referral.perReferral} per qualified referral</li>
            </ul>
            <Link
              href="/register"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-semibold text-slate-950 shadow-md transition hover:from-amber-400 hover:to-orange-500"
            >
              Get started with a code
            </Link>
          </article>
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">{LANDING.legal.refund}</p>
      </Section>

      <Section id="referrals" dark className="border-t border-slate-200 dark:border-white/10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Student referral program
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Share. Enroll. Earn.</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Every successful referral pays {LANDING.referral.perReferral} after the{" "}
              {REFERRAL_POLICY.refundWindowDays}-day refund window. Track progress in your dashboard.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              Open referral dashboard
            </Link>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-300">{LANDING.referral.perReferral}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Per qualified referral · direct bank transfer
              </p>
            </div>
            {LANDING.referral.milestones.map((m) => (
              <div
                key={m.count}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-white/5"
              >
                <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">{m.count}+ referrals</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{m.reward}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

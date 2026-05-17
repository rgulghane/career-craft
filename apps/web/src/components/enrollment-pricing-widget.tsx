"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { ENROLLMENT_WIDGET, PRICING } from "@career-craft/shared/content";
import { createEnrollmentAction, type EnrollState } from "@/app/enroll/actions";
import { RazorpayPayButton } from "@/components/razorpay-pay-button";
import { messages } from "@career-craft/shared/content";
import { discountPercentOff, formatINRFromPaise, listPrices } from "@/lib/format";
import { buildEnrollPath, buildLoginPath, buildRegisterPath } from "@/lib/referral-url";
import { ViewingNowBanner } from "@/components/viewing-now-banner";

type Mode = "marketing" | "enroll";

const initialEnroll: EnrollState = { status: "idle" };

const ctaClass =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-orange-500/35 transition hover:from-amber-400 hover:via-orange-400 hover:to-orange-500 hover:shadow-orange-500/45 disabled:opacity-60";

const COUNTDOWN_PLACEHOLDER = "--:--:--";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatCountdown(targetMs: number, now: number): string {
  const diff = Math.max(0, targetMs - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Client-only: reads/writes localStorage for a stable deadline per browser. */
function getDeadlineMs(): number {
  const key = "cc_price_deadline";
  const stored = window.localStorage.getItem(key);
  if (stored) {
    const n = Number(stored);
    if (!Number.isNaN(n) && n > Date.now()) {
      return n;
    }
  }
  const deadline = Date.now() + 9 * 3_600_000 + 31 * 60_000 + 8_000;
  window.localStorage.setItem(key, String(deadline));
  return deadline;
}

function useCountdown(targetMs: number | null): string {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (targetMs === null || now === null) {
    return COUNTDOWN_PLACEHOLDER;
  }
  return formatCountdown(targetMs, now);
}

export function EnrollmentPricingWidget({
  mode = "marketing",
  defaultReferralCode = "",
  isLoggedIn = false,
  autoContinue = false,
}: {
  mode?: Mode;
  defaultReferralCode?: string;
  isLoggedIn?: boolean;
  /** When true (enroll page + ?continue=1), auto-create enrollment and show payment step. */
  autoContinue?: boolean;
}) {
  const router = useRouter();
  const prices = listPrices();
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  const countdown = useCountdown(deadlineMs);

  useEffect(() => {
    setDeadlineMs(getDeadlineMs());
  }, []);

  const [referralInput, setReferralInput] = useState(defaultReferralCode);
  const [appliedCode, setAppliedCode] = useState("");
  const [referrerFirstName, setReferrerFirstName] = useState<string | null>(null);
  const [referralLookupError, setReferralLookupError] = useState<string | null>(null);
  const [referralChecking, setReferralChecking] = useState(false);

  const lookupReferral = async (rawCode: string): Promise<boolean> => {
    const code = rawCode.trim().toUpperCase();
    if (code.length < 4) {
      setAppliedCode("");
      setReferrerFirstName(null);
      setReferralLookupError(null);
      return false;
    }

    setReferralChecking(true);
    setReferralLookupError(null);
    try {
      const res = await fetch(`/api/referral/lookup?code=${encodeURIComponent(code)}`);
      const data = (await res.json()) as {
        valid: boolean;
        referrerFirstName?: string;
      };
      if (!data.valid || !data.referrerFirstName) {
        setAppliedCode("");
        setReferrerFirstName(null);
        setReferralLookupError(messages.enroll.referralInvalid);
        return false;
      }
      setAppliedCode(code);
      setReferrerFirstName(data.referrerFirstName);
      setReferralInput(code);
      return true;
    } catch {
      setReferralLookupError(messages.errors.network);
      return false;
    } finally {
      setReferralChecking(false);
    }
  };

  useEffect(() => {
    if (!defaultReferralCode.trim()) {
      return;
    }
    const code = defaultReferralCode.trim().toUpperCase();
    setReferralInput(code);
    void lookupReferral(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when URL/default code changes
  }, [defaultReferralCode]);

  const [enrollState, enrollAction, enrollPending] = useActionState(createEnrollmentAction, initialEnroll);
  const enrollFormRef = useRef<HTMLFormElement>(null);
  const autoSubmittedRef = useRef(false);

  const hasValidReferral = appliedCode.length >= 4 && referrerFirstName !== null;
  const displayPaise = hasValidReferral ? PRICING.withReferralCodeInPaise : PRICING.standardInPaise;
  const displayPrice = formatINRFromPaise(displayPaise);
  const badgePercent = hasValidReferral
    ? discountPercentOff(PRICING.standardInPaise, PRICING.withReferralCodeInPaise)
    : discountPercentOff(ENROLLMENT_WIDGET.listPriceInPaise, PRICING.standardInPaise);
  const referralEmi = formatINRFromPaise(
    Math.round(PRICING.withReferralCodeInPaise / ENROLLMENT_WIDGET.emiMonths),
  );
  const seatsPct = Math.round(
    ((ENROLLMENT_WIDGET.seats.total - ENROLLMENT_WIDGET.seats.remaining) / ENROLLMENT_WIDGET.seats.total) * 100,
  );

  const created = enrollState.status === "created" ? enrollState : null;
  const enrollHref = useMemo(() => buildEnrollPath(appliedCode, true), [appliedCode]);
  const registerHref = useMemo(() => buildRegisterPath(appliedCode), [appliedCode]);
  const signInHref = useMemo(() => buildLoginPath(appliedCode), [appliedCode]);

  useEffect(() => {
    if (!autoContinue || mode !== "enroll" || autoSubmittedRef.current || created) {
      return;
    }
    if (enrollState.status !== "idle" || enrollPending) {
      return;
    }
    const waitingOnRefLookup =
      defaultReferralCode.trim().length >= 4 &&
      !hasValidReferral &&
      !referralLookupError &&
      (referralChecking || referrerFirstName === null);
    if (waitingOnRefLookup) {
      return;
    }
    autoSubmittedRef.current = true;
    enrollFormRef.current?.requestSubmit();
  }, [
    autoContinue,
    mode,
    created,
    enrollState.status,
    enrollPending,
    defaultReferralCode,
    hasValidReferral,
    referralLookupError,
    referralChecking,
    referrerFirstName,
  ]);

  useEffect(() => {
    if (!autoContinue || mode !== "enroll" || !created) {
      return;
    }
    router.replace(buildEnrollPath(appliedCode, false));
  }, [autoContinue, mode, created, appliedCode, router]);

  return (
    <aside
      className="enrollment-widget w-full max-w-none overflow-hidden rounded-2xl border border-amber-200/60 bg-white text-slate-900 shadow-xl shadow-amber-500/10 ring-1 ring-slate-900/5 dark:border-amber-500/20 dark:bg-slate-900 dark:text-white dark:shadow-2xl dark:shadow-black/40 dark:ring-white/10"
      id="pricing"
    >
      <ViewingNowBanner />

      <div className="flex items-center justify-between gap-4 border-b border-rose-100/80 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 px-4 py-3.5 dark:border-rose-500/20 dark:from-rose-950/50 dark:via-amber-950/40 dark:to-orange-950/30">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600/80 dark:text-rose-300/80">
            Price hike in
          </p>
          <p className="font-mono text-2xl font-bold tracking-tight text-rose-600 tabular-nums dark:text-rose-400">
            {countdown}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            After deadline
          </p>
          <p className="text-lg font-semibold text-slate-400 line-through decoration-rose-300/60 dark:text-slate-500">
            {prices.list}
          </p>
        </div>
      </div>

      <div className="enrollment-widget-body">
        <section className="flex min-w-0 flex-col p-5 sm:p-6">
          <div>
            <p className="text-lg text-slate-400 line-through decoration-slate-300 dark:text-slate-500">{prices.list}</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                {displayPrice}
              </p>
              {badgePercent > 0 ? (
                <span className="rounded-md bg-gradient-to-r from-amber-500 to-orange-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm shadow-orange-500/30">
                  {badgePercent}% OFF
                </span>
              ) : null}
            </div>
          </div>
          {hasValidReferral && referrerFirstName ? (
            <p className="mt-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
              {messages.enroll.referredBy(referrerFirstName)}
              <span className="font-normal text-slate-600 dark:text-slate-400"> · EMI from {referralEmi}/mo</span>
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Use referral code →{" "}
                <span className="font-semibold text-amber-700 dark:text-amber-400">{prices.withReferral}</span>
                <span className="text-slate-400 dark:text-slate-500"> · EMI from {prices.emi}/mo</span>
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Have a referral code? Save{" "}
                {discountPercentOff(PRICING.standardInPaise, PRICING.withReferralCodeInPaise)}% more
              </p>
            </>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={referralInput}
              onChange={(e) => {
                setReferralInput(e.target.value.toUpperCase());
                if (referralLookupError) {
                  setReferralLookupError(null);
                }
              }}
              placeholder={ENROLLMENT_WIDGET.referralPlaceholder}
              readOnly={hasValidReferral}
              disabled={hasValidReferral || referralChecking}
              className="min-w-0 flex-1 rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2.5 text-sm uppercase tracking-wide text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/25 disabled:cursor-not-allowed disabled:opacity-70 dark:border-amber-500/30 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-500/60 dark:focus:bg-slate-800"
            />
            <button
              type="button"
              disabled={hasValidReferral || referralChecking}
              onClick={() => void lookupReferral(referralInput)}
              className="shrink-0 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-slate-700 hover:to-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:self-stretch dark:from-amber-600 dark:to-orange-600 dark:hover:from-amber-500 dark:hover:to-orange-500"
            >
              {referralChecking ? "Checking…" : "Apply"}
            </button>
          </div>

          {referralLookupError ? (
            <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">{referralLookupError}</p>
          ) : null}

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Seats available</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {ENROLLMENT_WIDGET.seats.remaining} of {ENROLLMENT_WIDGET.seats.total} remaining
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 shadow-sm"
                style={{ width: `${seatsPct}%` }}
              />
            </div>
          </div>

          {mode === "marketing" ? (
            <div className="mt-5 space-y-2">
              <Link href={isLoggedIn ? enrollHref : registerHref} className={ctaClass}>
                <span aria-hidden>🚀</span>
                Enroll Now at {displayPrice}
              </Link>
              {!isLoggedIn ? (
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link href={signInHref} className="font-semibold text-amber-600 hover:underline dark:text-amber-400">
                    Sign in
                  </Link>
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {!created ? (
                <form ref={enrollFormRef} action={enrollAction}>
                  <input type="hidden" name="referralCode" value={appliedCode} />
                  {enrollState.status === "error" ? (
                    <p className="mb-2 text-sm text-rose-600 dark:text-rose-400">{enrollState.message}</p>
                  ) : null}
                  <button type="submit" disabled={enrollPending} className={ctaClass}>
                    <span aria-hidden>🚀</span>
                    {enrollPending ? "Processing…" : `Enroll Now at ${displayPrice}`}
                  </button>
                </form>
              ) : (
                <>
                  <p className="mb-2 text-center text-sm text-slate-600 dark:text-slate-300">
                    Enrollment created · pay {formatINRFromPaise(created.amountInPaise)}
                  </p>
                  <RazorpayPayButton
                    enrollmentId={created.enrollmentId}
                    amountLabel={formatINRFromPaise(created.amountInPaise)}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 py-3.5 text-base font-bold text-white shadow-lg transition hover:from-slate-700 hover:to-slate-800 disabled:opacity-60 dark:from-amber-600 dark:to-orange-600"
                  >
                    {({ pending }) => (pending ? "Processing…" : "Complete secure payment")}
                  </RazorpayPayButton>
                </>
              )}
            </div>
          )}

          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">🔒 {ENROLLMENT_WIDGET.trust}</p>
        </section>

        <section className="enrollment-widget-features flex min-w-0 flex-col border-t border-amber-100/80 bg-amber-50/30 p-5 sm:p-6 dark:border-slate-700/60 dark:bg-slate-800/30">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            What&apos;s included
          </h3>
          <ul className="mt-3 flex-1 divide-y divide-amber-100/80 dark:divide-slate-700/60">
            {ENROLLMENT_WIDGET.features.map((feature) => (
              <li key={feature} className="flex gap-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                  aria-hidden
                >
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}

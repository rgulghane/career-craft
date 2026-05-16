"use client";

import { useActionState } from "react";
import { messages } from "@career-craft/shared/content";
import { formatINRFromPaise } from "@/lib/format";
import { theme } from "@/lib/theme";
import { createEnrollmentAction, mockPayEnrollmentAction, type EnrollState, type PayState } from "./actions";

const initialEnroll: EnrollState = { status: "idle" };
const initialPay: PayState = { status: "idle" };

export function EnrollFlow({ defaultReferralCode = "" }: { defaultReferralCode?: string }) {
  const [enrollState, enrollAction, enrollPending] = useActionState(createEnrollmentAction, initialEnroll);
  const [payState, payAction, payPending] = useActionState(mockPayEnrollmentAction, initialPay);

  const created = enrollState.status === "created" ? enrollState : null;
  const enrollmentId = created?.enrollmentId;

  return (
    <div className="space-y-8">
      <form action={enrollAction} className={theme.card}>
        <p className={theme.eyebrow}>Enrollment</p>
        <h1 className={`mt-2 ${theme.title}`}>{messages.enroll.heading}</h1>
        <p className={`mt-2 ${theme.body}`}>{messages.enroll.referralHint}</p>
        <label className="mt-6 block">
          <span className={theme.label}>{messages.enroll.referralLabel}</span>
          <input
            name="referralCode"
            defaultValue={defaultReferralCode}
            className={`${theme.input} uppercase tracking-wide`}
            placeholder="E.g. ABCD12EFGH"
            autoCapitalize="characters"
          />
        </label>
        {enrollState.status === "error" ? <p className={`mt-4 ${theme.error}`}>{enrollState.message}</p> : null}
        <button className={`mt-6 w-full sm:w-auto ${theme.btnPrimary}`} type="submit" disabled={enrollPending}>
          {enrollPending ? "Creating…" : messages.enroll.payCta}
        </button>
      </form>

      {created ? (
        <div className={theme.cardHighlight}>
          <p className={theme.label}>Amount due</p>
          <p className="mt-2 text-4xl font-bold text-white">{formatINRFromPaise(created.amountInPaise)}</p>
          <p className={`mt-2 ${theme.body}`}>
            Currency: {created.currency} · Enrollment ID:{" "}
            <span className="font-mono text-amber-200">{created.enrollmentId}</span>
          </p>
          <p className={`mt-4 ${theme.body}`}>{messages.enroll.success}</p>
          <form action={payAction} className="mt-6">
            <input type="hidden" name="enrollmentId" value={enrollmentId ?? ""} />
            {payState.status === "error" ? <p className={`mb-3 ${theme.error}`}>{payState.message}</p> : null}
            {payState.status === "paid" ? (
              <p className={`mb-3 ${theme.success}`}>
                Mock payment captured. Your referral code is available on the dashboard.
              </p>
            ) : null}
            <button className={`w-full sm:w-auto ${theme.btnSecondary}`} type="submit" disabled={payPending}>
              {payPending ? "Processing…" : "Complete mock payment"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

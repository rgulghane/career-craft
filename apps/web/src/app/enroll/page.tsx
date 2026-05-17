import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { messages } from "@career-craft/shared";
import { AppPageShell } from "@/components/app-page-shell";
import { EnrollCurriculumShowcase } from "@/components/enroll-curriculum-showcase";
import { EnrolledCongratulationsCard } from "@/components/enrolled-congratulations-card";
import { EnrollmentPricingWidget } from "@/components/enrollment-pricing-widget";
import { getSessionUser, userHasPaidEnrollment } from "@/lib/server-api";
import { buildRegisterPath } from "@/lib/referral-url";

export const metadata: Metadata = {
  title: `${messages.nav.enroll} — CareerCraft`,
};

export default async function EnrollPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; continue?: string }>;
}) {
  const user = await getSessionUser();
  const params = await searchParams;
  const ref = params.ref?.trim().toUpperCase() ?? "";
  const continueFlow = params.continue === "1";

  if (!user) {
    redirect(buildRegisterPath(ref));
  }

  const firstName = user.fullName.split(/\s+/)[0] ?? user.fullName;
  const isEnrolled = await userHasPaidEnrollment(user.id);

  return (
    <AppPageShell>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {messages.enroll.pageEyebrow}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isEnrolled
              ? `Welcome back, ${firstName} — you're all set for Cohort 4.`
              : messages.enroll.welcome(firstName)}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-10 grid-cols-1 enroll:grid-cols-[1fr_minmax(0,28rem)] enroll:gap-12 xl:gap-16">
        <div className="order-2 min-w-0 enroll:order-1">
          <EnrollCurriculumShowcase />
        </div>
        <div className="order-1 min-w-0 enroll:order-2 enroll:sticky enroll:top-24">
          {isEnrolled && user.referralCode ? (
            <EnrolledCongratulationsCard firstName={firstName} referralCode={user.referralCode} />
          ) : !isEnrolled ? (
            <EnrollmentPricingWidget mode="enroll" defaultReferralCode={ref} autoContinue={continueFlow} />
          ) : null}
        </div>
      </div>
    </AppPageShell>
  );
}

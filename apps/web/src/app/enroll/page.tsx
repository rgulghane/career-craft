import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { messages } from "@career-craft/shared";
import { AppPageShell } from "@/components/app-page-shell";
import { EnrollCurriculumShowcase } from "@/components/enroll-curriculum-showcase";
import { EnrollmentPricingWidget } from "@/components/enrollment-pricing-widget";
import { getSessionUser } from "@/lib/server-api";

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
    const next = continueFlow
      ? `/enroll?${ref ? `ref=${encodeURIComponent(ref)}&` : ""}continue=1`
      : ref
        ? `/enroll?ref=${encodeURIComponent(ref)}`
        : "/enroll";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <AppPageShell>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {messages.enroll.pageEyebrow}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {messages.enroll.welcome(user.fullName.split(/\s+/)[0] ?? user.fullName)}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-12 xl:gap-16">
        <EnrollCurriculumShowcase />
        <div className="min-w-0 lg:sticky lg:top-24">
          <EnrollmentPricingWidget mode="enroll" defaultReferralCode={ref} autoContinue={continueFlow} />
        </div>
      </div>
    </AppPageShell>
  );
}

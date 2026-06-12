import Link from "next/link";
import { PROGRAM, buildReferralShareMessage, messages } from "@career-craft/shared";
import { AppPageShell } from "@/components/app-page-shell";
import { CopyShareLinkButton } from "@/components/copy-share-link-button";
import { SignOutButton } from "@/components/sign-out-button";
import { serverConfig } from "@/lib/config";
import { fetchDashboard, getSessionUser } from "@/lib/server-api";
import { getEnrollmentPricingRupees } from "@/lib/pricing.server";
import { discountPercentOff, formatINR } from "@/lib/format";
import { theme } from "@/lib/theme";
import { createPageMetadata } from "@/lib/seo";
import { buildHomeReferralPath } from "@/lib/referral-url";

export const metadata = createPageMetadata({
  title: messages.nav.dashboard,
  description: "Your AI Career Launchpad referral dashboard and enrollment status.",
  noIndex: true,
});

function MilestoneBar({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-mono text-slate-700 dark:text-slate-300">
          {value}/{target}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  let data;
  try {
    data = await fetchDashboard();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <AppPageShell narrow>
        <div className={theme.card}>
          <p className={theme.eyebrow}>Referrals</p>
          <h1 className={`mt-2 ${theme.title}`}>{messages.errors.unauthorized}</h1>
          <p className={`mt-4 ${theme.body}`}>
            <Link className={theme.link} href="/login">
              {messages.nav.signIn}
            </Link>{" "}
            to view your referral hub.
          </p>
        </div>
      </AppPageShell>
    );
  }

  const origin = serverConfig.appOrigin;
  const sharePath = data.user.referralCode ? buildHomeReferralPath(data.user.referralCode) : "";
  const shareUrl = sharePath ? `${origin}${sharePath}` : "";
  const reward = formatINR(serverConfig.referral.cashPerReferralRupees);
  const enrollmentPricing = await getEnrollmentPricingRupees();
  const referralDiscountPercent = discountPercentOff(
    enrollmentPricing.standardInRupees,
    enrollmentPricing.withReferralCodeInRupees,
  );
  const shareMessage =
    shareUrl && data.user.referralCode
      ? buildReferralShareMessage({
          programName: PROGRAM.name,
          shareUrl,
          referralCode: data.user.referralCode,
          referralDiscountPercent,
          referralPriceLabel: formatINR(enrollmentPricing.withReferralCodeInRupees),
          standardPriceLabel: formatINR(enrollmentPricing.standardInRupees),
        })
      : "";

  return (
    <AppPageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={theme.eyebrow}>Referral hub</p>
          <h1 className={`mt-2 ${theme.pageTitle}`}>{messages.dashboard.heading}</h1>
          <p className={`mt-2 ${theme.body}`}>
            {data.user.fullName} ·{" "}
            <span className="font-mono text-slate-600 dark:text-slate-300">{data.user.email}</span>
          </p>
          <p className={`mt-1 ${theme.body}`}>{data.pricing.label}</p>
        </div>
        <SignOutButton userType={sessionUser?.userType} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <section className={`${theme.card} lg:col-span-2`}>
          <h2 className={theme.label}>{messages.dashboard.yourCode}</h2>
          {data.user.referralCode ? (
            <>
              <p className="mt-3 break-all font-mono text-2xl font-bold text-amber-600 dark:text-amber-300">
                {data.user.referralCode}
              </p>
              <p className={`mt-3 ${theme.body}`}>{messages.dashboard.shareLink}</p>
              <p className="mt-1 break-all font-mono text-xs text-slate-600 dark:text-slate-300">{shareUrl}</p>
              {shareMessage ? (
                <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {shareMessage}
                </pre>
              ) : null}
              <p className={`mt-3 text-xs ${theme.body}`}>
                Qualify after {serverConfig.referral.refundWindowDays}-day refund window · {reward} per qualified referral
              </p>
            </>
          ) : (
            <p className={`mt-3 ${theme.body}`}>{messages.dashboard.notEnrolled}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {shareMessage ? (
              <>
                <CopyShareLinkButton shareMessage={shareMessage} />
                <a
                  className={theme.btnSecondary}
                  href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Share on WhatsApp
                </a>
              </>
            ) : (
              <Link href="/enroll" className={theme.btnPrimary}>
                {messages.nav.enroll}
              </Link>
            )}
          </div>
        </section>

        <section className={theme.cardHighlight}>
          <h2 className={theme.label}>{messages.dashboard.stats}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 dark:text-slate-400">{messages.dashboard.totalReferrals}</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">{data.stats.totalAttributed}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 dark:text-slate-400">{messages.dashboard.qualified}</dt>
              <dd className="font-semibold text-emerald-600 dark:text-emerald-400">{data.stats.qualified}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 dark:text-slate-400">{messages.dashboard.pending}</dt>
              <dd className="font-semibold text-amber-600 dark:text-amber-400">{data.stats.pending}</dd>
            </div>
          </dl>
          <div className="mt-6 space-y-4">
            <h3 className={theme.label}>{messages.dashboard.milestones}</h3>
            <MilestoneBar
              label="Silver internship cert"
              value={data.stats.qualified}
              target={data.milestones.silverAt}
            />
            <MilestoneBar label="Gold — iPhone" value={data.stats.qualified} target={data.milestones.goldAt} />
            <MilestoneBar
              label="Diamond — ₹5L bonus"
              value={data.stats.qualified}
              target={data.milestones.diamondAt}
            />
          </div>
          <p className={`mt-4 text-xs ${theme.body}`}>{messages.dashboard.nextSteps}</p>
        </section>
      </div>

      <section className={`mt-8 ${theme.card}`}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Attributed enrollments</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10">
                <th className="py-2 pr-4">Referee</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2">Qualified</th>
              </tr>
            </thead>
            <tbody>
              {data.referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className={`py-6 ${theme.body}`}>
                    No referrals yet. Share your link after you enroll.
                  </td>
                </tr>
              ) : (
                data.referrals.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-3 pr-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {r.refereeEmailMasked}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          r.status === "QUALIFIED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : r.status === "IN_REFUND_WINDOW"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                              : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
                        ].join(" ")}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-400">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="py-3 text-xs text-slate-400">
                      {r.qualifiedAt ? new Date(r.qualifiedAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppPageShell>
  );
}

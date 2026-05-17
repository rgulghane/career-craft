import Link from "next/link";
import { REFERRAL_POLICY } from "@career-craft/shared";
import { AdminCard } from "@/components/admin/admin-card";
import { formatINRFromPaise } from "@/lib/format";
import { getAdminOverviewStats } from "@/server/services/admin/stats";
import { QualifyDueButton } from "./qualify-due-button";

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats();
  const reward = formatINRFromPaise(stats.cashPerReferralPaise);
  const estimatedPayout = formatINRFromPaise(stats.qualifiedReferrals * stats.cashPerReferralPaise);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Overview</h1>
        <p className="mt-2 text-sm text-slate-400">Program metrics and quick actions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: stats.totalUsers },
          { label: "Paid enrollments", value: stats.paidEnrollments },
          { label: "Pending enrollments", value: stats.pendingEnrollments },
          { label: "Total referrals", value: stats.totalReferrals },
        ].map((s) => (
          <AdminCard key={s.label}>
            <p className="text-xs uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{s.value}</p>
          </AdminCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard title="Referral pipeline">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">In refund window</dt>
              <dd className="font-mono text-amber-300">{stats.inRefundWindowReferrals}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Qualified</dt>
              <dd className="font-mono text-emerald-300">{stats.qualifiedReferrals}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Voided</dt>
              <dd className="font-mono text-slate-300">{stats.voidedReferrals}</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2">
              <dt className="text-slate-400">Est. payout ({reward}/ref)</dt>
              <dd className="font-mono text-white">{estimatedPayout}</dd>
            </div>
          </dl>
        </AdminCard>

        <AdminCard title="Actions">
          <p className="text-sm text-slate-400">
            Refund window: {stats.refundWindowDays} days · Milestones: {REFERRAL_POLICY.milestones.silverReferrals} /{" "}
            {REFERRAL_POLICY.milestones.goldReferrals} / {REFERRAL_POLICY.milestones.diamondReferrals} qualified
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <QualifyDueButton />
            <Link
              href="/api/admin/export?type=referrals"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Export referrals CSV
            </Link>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

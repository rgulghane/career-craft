import { REFERRAL_POLICY } from "@career-craft/shared";
import { AdminCard } from "@/components/admin/admin-card";
import { serverConfig } from "@/lib/config";
import { formatINR } from "@/lib/format";
import { getPricingSettings } from "@/server/services/admin/pricing";
import { PricingEditor } from "./pricing-editor";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const pricing = await getPricingSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>
      <p className="text-sm text-slate-400">
        Course fees are managed here by admins. Other policy values are configured via environment
        variables.
      </p>
      <AdminCard title="Course fees">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Standard price</dt>
            <dd>{formatINR(pricing.standardInRupees)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Referral price</dt>
            <dd>{formatINR(pricing.withReferralCodeInRupees)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Source</dt>
            <dd className="text-slate-400">
              {pricing.isCustom ? "Admin-managed" : "Environment defaults"}
            </dd>
          </div>
        </dl>
      </AdminCard>
      <PricingEditor
        initial={{
          standardInRupees: pricing.standardInRupees,
          withReferralCodeInRupees: pricing.withReferralCodeInRupees,
        }}
      />
      <AdminCard title="Referral policy (override via environment variables)">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Cash per qualified referral</dt>
            <dd>{formatINR(serverConfig.referral.cashPerReferralRupees)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Refund window</dt>
            <dd>{serverConfig.referral.refundWindowDays} days</dd>
          </div>
        </dl>
      </AdminCard>
      <AdminCard title="Milestones (qualified referrals)">
        <ul className="text-sm text-slate-300">
          <li>Silver: {REFERRAL_POLICY.milestones.silverReferrals}</li>
          <li>Gold: {REFERRAL_POLICY.milestones.goldReferrals}</li>
          <li>Diamond: {REFERRAL_POLICY.milestones.diamondReferrals}</li>
        </ul>
      </AdminCard>
    </div>
  );
}

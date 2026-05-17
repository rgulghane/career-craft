import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import { getAdminReferral } from "@/server/services/admin/referrals";
import { ReferralActions } from "./referral-actions";

type Params = { params: Promise<{ id: string }> };

export default async function AdminReferralDetailPage({ params }: Params) {
  const { id } = await params;
  const data = await getAdminReferral(id);
  if (!data) {
    notFound();
  }

  const r = data.referral;

  return (
    <div className="space-y-6">
      <Link href="/admin/referrals" className="text-sm text-amber-400 hover:underline">
        ← Referrals
      </Link>
      <h1 className="text-3xl font-bold text-white">Referral {id.slice(-8)}</h1>
      <AdminCard title="Details">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Status</dt>
            <dd className="font-semibold text-white">{r.status}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Referrer</dt>
            <dd className="text-white">{data.referrer?.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Referee</dt>
            <dd className="text-white">{data.referee?.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Void reason</dt>
            <dd className="text-slate-300">{r.voidReason ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Qualified at</dt>
            <dd className="text-slate-300">{r.qualifiedAt ? new Date(r.qualifiedAt).toLocaleString() : "—"}</dd>
          </div>
        </dl>
        {data.enrollment ? (
          <p className="mt-4 text-sm">
            <Link href={`/admin/enrollments/${data.enrollment.id}`} className="text-amber-400 hover:underline">
              View enrollment ({data.enrollment.status})
            </Link>
          </p>
        ) : null}
      </AdminCard>
      <ReferralActions referralId={id} status={r.status} />
    </div>
  );
}

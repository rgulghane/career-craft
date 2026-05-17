import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import { listAdminReferrals } from "@/server/services/admin/referrals";

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { items } = await listAdminReferrals({
    status: params.status,
    page,
    limit: 25,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Referrals</h1>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/referrals" className="text-amber-400">
          All
        </Link>
        {["IN_REFUND_WINDOW", "QUALIFIED", "VOIDED"].map((s) => (
          <Link key={s} href={`/admin/referrals?status=${s}`} className="text-slate-400 hover:text-white">
            {s}
          </Link>
        ))}
      </div>
      <AdminCard>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
              <th className="py-2 pr-4">Referrer</th>
              <th className="py-2 pr-4">Referee</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-white/5">
                <td className="py-3 pr-4 text-slate-300">{r.referrerEmail}</td>
                <td className="py-3 pr-4">
                  <Link href={`/admin/referrals/${r.id}`} className="text-amber-400 hover:underline">
                    {r.refereeEmail}
                  </Link>
                </td>
                <td className="py-3 pr-4">{r.status}</td>
                <td className="py-3 text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import { formatINRFromPaise } from "@/lib/format";
import { listAdminEnrollments } from "@/server/services/admin/enrollments";

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status === "PENDING" || params.status === "PAID" ? params.status : undefined;

  const { items, total, limit } = await listAdminEnrollments({ status, page, limit: 25 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Enrollments</h1>
        <p className="mt-2 text-sm text-slate-400">{total} records</p>
      </div>
      <div className="flex gap-2 text-sm">
        <Link href="/admin/enrollments" className="text-amber-400 hover:underline">
          All
        </Link>
        <Link href="/admin/enrollments?status=PAID" className="text-slate-400 hover:text-white">
          Paid
        </Link>
        <Link href="/admin/enrollments?status=PENDING" className="text-slate-400 hover:text-white">
          Pending
        </Link>
      </div>
      <AdminCard>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
              <th className="py-2 pr-4">Student</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Referrer</th>
              <th className="py-2">Paid</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id} className="border-b border-white/5">
                <td className="py-3 pr-4">
                  <Link href={`/admin/enrollments/${e.id}`} className="text-amber-400 hover:underline">
                    {e.userFullName}
                  </Link>
                  <p className="font-mono text-xs text-slate-500">{e.userEmail}</p>
                </td>
                <td className="py-3 pr-4">{e.status}</td>
                <td className="py-3 pr-4">{formatINRFromPaise(e.amountInPaise)}</td>
                <td className="py-3 pr-4 text-xs text-slate-400">{e.referrerEmail ?? "—"}</td>
                <td className="py-3 text-xs text-slate-400">
                  {e.paidAt ? new Date(e.paidAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {total > limit ? (
          <p className="mt-4 text-xs text-slate-500">
            <Link href={`/admin/enrollments?page=${page + 1}${status ? `&status=${status}` : ""}`}>
              Next page
            </Link>
          </p>
        ) : null}
      </AdminCard>
      <Link href="/api/admin/export?type=enrollments" className="text-sm text-amber-400 hover:underline">
        Export enrollments CSV
      </Link>
    </div>
  );
}

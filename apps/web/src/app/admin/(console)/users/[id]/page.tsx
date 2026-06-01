import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import { getAdminUser } from "@/server/services/admin/users";
import { DeleteUserButton } from "./delete-user-button";
import { UserEditor } from "./user-editor";

type Params = { params: Promise<{ id: string }> };

export default async function AdminUserDetailPage({ params }: Params) {
  const { id } = await params;
  const data = await getAdminUser(id);
  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-sm text-amber-400 hover:underline">
        ← Users
      </Link>
      <h1 className="text-3xl font-bold text-white">{data.user.fullName}</h1>
      <UserEditor userId={id} initial={data.user} />
      <AdminCard title="Enrollments">
        <ul className="space-y-2 text-sm">
          {data.enrollments.map((e) => (
            <li key={e.id} className="flex flex-wrap gap-2 text-slate-300">
              <Link href={`/admin/enrollments/${e.id}`} className="text-amber-400 hover:underline">
                {e.id.slice(-8)}
              </Link>
              <span>{e.status}</span>
              <span className="font-mono text-xs">₹{e.amountInRupees.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
      </AdminCard>
      <AdminCard title="Referrals as referrer">
        <ul className="space-y-2 text-sm text-slate-300">
          {data.referralsAsReferrer.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/referrals/${r.id}`} className="text-amber-400 hover:underline">
                {r.refereeEmail}
              </Link>{" "}
              · {r.status}
            </li>
          ))}
        </ul>
      </AdminCard>
      <DeleteUserButton userId={id} fullName={data.user.fullName} email={data.user.email} />
    </div>
  );
}

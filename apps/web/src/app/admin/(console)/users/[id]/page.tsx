import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import { formatINR } from "@/lib/format";
import { formatAdminUserDate } from "@/lib/admin/user-list-config";
import { getAdminUser } from "@/server/services/admin/users";
import { DeleteUserButton } from "./delete-user-button";
import { ReferralCodeEditor } from "./referral-code-editor";
import { UserDetailsSection } from "./user-details-section";

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
      <UserDetailsSection userId={id} initial={data.user} />
      <ReferralCodeEditor
        userId={id}
        initialCode={data.user.referralCode}
        hasPaidEnrollment={data.user.hasPaidEnrollment}
      />
      <AdminCard title="Enrollments">
        {data.enrollments.length === 0 ? (
          <p className="text-sm text-slate-400">No enrollments.</p>
        ) : (
          <ul className="space-y-4">
            {data.enrollments.map((e) => (
              <li key={e.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Enrollment ID</dt>
                    <dd>
                      <Link
                        href={`/admin/enrollments/${e.id}`}
                        className="font-mono text-xs text-amber-400 hover:underline"
                      >
                        {e.id}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Status</dt>
                    <dd className="text-slate-300">
                      {e.status}
                      {e.directEnrollment ? (
                        <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300">
                          Direct
                        </span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Amount</dt>
                    <dd className="text-slate-300">{formatINR(e.amountInRupees)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Referral code used</dt>
                    <dd className="font-mono text-slate-300">{e.referralCodeUsed ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Paid at</dt>
                    <dd className="text-slate-300">
                      {e.paidAt ? formatAdminUserDate(e.paidAt) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Created</dt>
                    <dd className="text-slate-300">{formatAdminUserDate(e.createdAt)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
      <AdminCard title="Referrals as referrer">
        {data.referralsAsReferrer.length === 0 ? (
          <p className="text-sm text-slate-400">None.</p>
        ) : (
          <ul className="space-y-2 text-sm text-slate-300">
            {data.referralsAsReferrer.map((r) => (
              <li key={r.id} className="flex flex-wrap gap-2">
                <Link href={`/admin/referrals/${r.id}`} className="text-amber-400 hover:underline">
                  {r.id.slice(-8)}
                </Link>
                <span>{r.refereeEmail}</span>
                <span>· {r.status}</span>
                <span className="text-xs text-slate-500">
                  · {formatAdminUserDate(r.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
      <AdminCard title="Referrals as referee">
        {data.referralsAsReferee.length === 0 ? (
          <p className="text-sm text-slate-400">None.</p>
        ) : (
          <ul className="space-y-2 text-sm text-slate-300">
            {data.referralsAsReferee.map((r) => (
              <li key={r.id} className="flex flex-wrap gap-2">
                <Link href={`/admin/referrals/${r.id}`} className="text-amber-400 hover:underline">
                  {r.id.slice(-8)}
                </Link>
                <span>{r.referrerEmail}</span>
                <span>· {r.status}</span>
                <span className="text-xs text-slate-500">
                  · {formatAdminUserDate(r.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
      <DeleteUserButton userId={id} fullName={data.user.fullName} email={data.user.email} />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import { formatINR } from "@/lib/format";
import { getAdminEnrollment } from "@/server/services/admin/enrollments";
import { EnrollmentEditor } from "./enrollment-editor";

type Params = { params: Promise<{ id: string }> };

export default async function AdminEnrollmentDetailPage({ params }: Params) {
  const { id } = await params;
  const data = await getAdminEnrollment(id);
  if (!data) {
    notFound();
  }

  const e = data.enrollment;

  return (
    <div className="space-y-6">
      <Link href="/admin/enrollments" className="text-sm text-amber-400 hover:underline">
        ← Enrollments
      </Link>
      <h1 className="text-3xl font-bold text-white">Enrollment {id.slice(-8)}</h1>
      <AdminCard title="Summary">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Student</dt>
            <dd className="text-white">
              {data.student?.fullName} ({data.student?.email})
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="text-white">
              {e.status}
              {e.directEnrollment ? (
                <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300">
                  Direct enrollment
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Amount</dt>
            <dd className="text-white">{formatINR(e.amountInRupees)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Referrer</dt>
            <dd className="text-white">{data.referrer?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Referral code used</dt>
            <dd className="font-mono text-white">{e.referralCodeUsed ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Payment ID</dt>
            <dd className="font-mono text-xs text-slate-300">{e.paymentId ?? "—"}</dd>
          </div>
          {e.directEnrollment ? (
            <div>
              <dt className="text-slate-500">Direct enrollment reason</dt>
              <dd className="text-white">{e.directEnrollmentReason ?? "—"}</dd>
            </div>
          ) : null}
        </dl>
        {data.referral ? (
          <p className="mt-4 text-sm">
            Referral:{" "}
            <Link href={`/admin/referrals/${data.referral.id}`} className="text-amber-400 hover:underline">
              {data.referral.status}
            </Link>
          </p>
        ) : null}
      </AdminCard>
      <EnrollmentEditor
        enrollmentId={id}
        initial={{
          status: e.status,
          amountInRupees: e.amountInRupees,
          referralCodeUsed: e.referralCodeUsed ?? "",
          referrerId: e.referrerId ?? "",
        }}
      />
    </div>
  );
}

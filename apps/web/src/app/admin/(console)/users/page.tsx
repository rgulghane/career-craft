import Link from "next/link";
import { Suspense } from "react";
import { USER_TYPES } from "@career-craft/shared";
import { AdminCard } from "@/components/admin/admin-card";
import { listAdminUsers } from "@/server/services/admin/users";
import { UserListFilters } from "./user-list-filters";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; userType?: string; enrolled?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const enrolled =
    params.enrolled === "true" ? true : params.enrolled === "false" ? false : undefined;
  const userType = USER_TYPES.includes(params.userType as (typeof USER_TYPES)[number])
    ? (params.userType as (typeof USER_TYPES)[number])
    : undefined;

  const { items, total, limit } = await listAdminUsers({
    q: params.q,
    userType:
      userType && userType !== "admin" && userType !== "admin-readonly" ? userType : undefined,
    enrolled,
    page,
    limit: 25,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <p className="mt-2 text-sm text-slate-400">{total} accounts</p>
      </div>
      <Suspense fallback={<p className="text-sm text-slate-500">Loading filters…</p>}>
        <UserListFilters />
      </Suspense>
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/users/${u.id}`} className="font-medium text-amber-400 hover:underline">
                      {u.fullName}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-300">{u.email}</td>
                  <td className="py-3 pr-4 text-slate-300">{u.userType ?? "student"}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{u.referralCode ?? "—"}</td>
                  <td className="py-3 pr-4">{u.hasPaidEnrollment ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > limit ? (
          <p className="mt-4 text-xs text-slate-500">
            Page {page} ·{" "}
            <Link href={`/admin/users?page=${page + 1}`} className="text-amber-400 hover:underline">
              Next
            </Link>
          </p>
        ) : null}
      </AdminCard>
      <Link href="/api/admin/export?type=users" className="text-sm text-amber-400 hover:underline">
        Export users CSV
      </Link>
    </div>
  );
}

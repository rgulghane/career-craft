import Link from "next/link";
import { Suspense } from "react";
import { USER_TYPES } from "@career-craft/shared";
import { AdminCard } from "@/components/admin/admin-card";
import { listAdminUsers } from "@/server/services/admin/users";
import { requireAdminPage } from "@/server/auth-guards";
import { UserListColumnPicker } from "./user-list-column-picker";
import { UserListFilters } from "./user-list-filters";
import { UserListTable } from "./user-list-table";
import { buildUsersListHref, parseSortDir, parseSortField } from "@/lib/admin/user-list-config";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    userType?: string;
    enrolled?: string;
    page?: string;
    sort?: string;
    dir?: string;
    cols?: string;
  }>;
}) {
  const params = await searchParams;
  const admin = await requireAdminPage();
  const isFullAdmin = admin.userType === "admin";

  const page = Math.max(1, Number(params.page) || 1);
  const enrolled =
    params.enrolled === "true" ? true : params.enrolled === "false" ? false : undefined;
  const userType = USER_TYPES.includes(params.userType as (typeof USER_TYPES)[number])
    ? (params.userType as (typeof USER_TYPES)[number])
    : undefined;

  const sortBy = parseSortField(params.sort, isFullAdmin);
  const sortDir = parseSortDir(params.dir, isFullAdmin);

  const { items, total, limit } = await listAdminUsers({
    q: params.q,
    userType:
      userType && userType !== "admin" && userType !== "admin-readonly" ? userType : undefined,
    enrolled,
    page,
    limit: 25,
    sortBy,
    sortDir,
  });

  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.userType) query.set("userType", params.userType);
  if (params.enrolled) query.set("enrolled", params.enrolled);
  if (isFullAdmin && params.cols) query.set("cols", params.cols);
  if (isFullAdmin && params.sort) query.set("sort", params.sort);
  if (isFullAdmin && params.dir) query.set("dir", params.dir);

  const hasNextPage = page * limit < total;
  const hasPrevPage = page > 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <p className="mt-2 text-sm text-slate-400">{total} accounts</p>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Suspense fallback={<p className="text-sm text-slate-500">Loading filters…</p>}>
          <UserListFilters />
        </Suspense>
        <Suspense fallback={null}>
          <UserListColumnPicker />
        </Suspense>
      </div>
      <AdminCard>
        <Suspense fallback={<p className="text-sm text-slate-500">Loading users…</p>}>
          <UserListTable items={items} />
        </Suspense>
        {total > limit ? (
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span>Page {page}</span>
            {hasPrevPage ? (
              <Link
                href={buildUsersListHref(query, { page: page - 1 })}
                className="text-amber-400 hover:underline"
              >
                Previous
              </Link>
            ) : null}
            {hasNextPage ? (
              <Link
                href={buildUsersListHref(query, { page: page + 1 })}
                className="text-amber-400 hover:underline"
              >
                Next
              </Link>
            ) : null}
          </div>
        ) : null}
      </AdminCard>
      <Link href="/api/admin/export?type=users" className="text-sm text-amber-400 hover:underline">
        Export users CSV
      </Link>
    </div>
  );
}

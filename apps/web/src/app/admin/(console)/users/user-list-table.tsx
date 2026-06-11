"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { AdminUserListRow } from "@/lib/admin/user-list-config";
import { useAdminAccess } from "@/components/admin/admin-access";
import {
  USER_LIST_OPTIONAL_COLUMNS,
  USER_LIST_SORT_FIELDS,
  type UserListOptionalColumn,
  type UserListSortDir,
  type UserListSortField,
  buildUsersListHref,
  formatAdminUserDate,
  nextSortDir,
  parseSortDir,
  parseSortField,
  parseVisibleColumns,
} from "@/lib/admin/user-list-config";

function SortableHeader({
  label,
  field,
  activeField,
  activeDir,
  href,
}: {
  label: string;
  field: UserListSortField;
  activeField: UserListSortField;
  activeDir: UserListSortDir;
  href: string;
}) {
  const isActive = activeField === field;
  const indicator = isActive ? (activeDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <th className="py-2 pr-4">
      <Link href={href} className="inline-flex items-center gap-1 uppercase hover:text-amber-400">
        {label}
        <span className="font-mono text-[10px] text-amber-400">{indicator}</span>
      </Link>
    </th>
  );
}

function renderCell(column: UserListOptionalColumn, user: AdminUserListRow) {
  switch (column) {
    case "email":
      return <td className="py-3 pr-4 font-mono text-xs text-slate-300">{user.email}</td>;
    case "phone":
      return <td className="py-3 pr-4 font-mono text-xs text-slate-300">{user.phone ?? "—"}</td>;
    case "type":
      return <td className="py-3 pr-4 text-slate-300">{user.userType ?? "student"}</td>;
    case "code":
      return <td className="py-3 pr-4 font-mono text-xs">{user.referralCode ?? "—"}</td>;
    case "enrolled":
      return <td className="py-3 pr-4">{user.hasPaidEnrollment ? "Yes" : "No"}</td>;
    case "createdAt":
      return (
        <td className="py-3 pr-4 whitespace-nowrap text-xs text-slate-400">
          {formatAdminUserDate(user.createdAt)}
        </td>
      );
    case "updatedAt":
      return (
        <td className="py-3 pr-4 whitespace-nowrap text-xs text-slate-400">
          {formatAdminUserDate(user.updatedAt)}
        </td>
      );
    default:
      return null;
  }
}

function renderHeader(
  column: UserListOptionalColumn,
  isFullAdmin: boolean,
  sortField: UserListSortField,
  sortDir: UserListSortDir,
  searchParams: URLSearchParams,
) {
  const meta = USER_LIST_OPTIONAL_COLUMNS.find((c) => c.id === column);
  if (!meta) {
    return null;
  }

  const isSortable =
    isFullAdmin && (USER_LIST_SORT_FIELDS as readonly string[]).includes(column);

  if (isSortable) {
    const field = column as UserListSortField;
    return (
      <SortableHeader
        key={column}
        label={meta.label}
        field={field}
        activeField={sortField}
        activeDir={sortDir}
        href={buildUsersListHref(searchParams, {
          sort: field,
          dir: nextSortDir(sortField, field, sortDir),
          page: undefined,
        })}
      />
    );
  }

  return (
    <th key={column} className="py-2 pr-4">
      {meta.label}
    </th>
  );
}

export function UserListTable({ items }: { items: AdminUserListRow[] }) {
  const searchParams = useSearchParams();
  const { isFullAdmin } = useAdminAccess();
  const visibleColumns = parseVisibleColumns(searchParams.get("cols") ?? undefined, isFullAdmin);
  const sortField = parseSortField(searchParams.get("sort") ?? undefined, isFullAdmin);
  const sortDir = parseSortDir(searchParams.get("dir") ?? undefined, isFullAdmin);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
            <th className="py-2 pr-4">Name</th>
            {visibleColumns.map((column) =>
              renderHeader(column, isFullAdmin, sortField, sortDir, searchParams),
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((user) => (
            <tr key={user.id} className="border-b border-white/5">
              <td className="py-3 pr-4">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="font-medium text-amber-400 hover:underline"
                >
                  {user.fullName}
                </Link>
              </td>
              {visibleColumns.map((column) => renderCell(column, user))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

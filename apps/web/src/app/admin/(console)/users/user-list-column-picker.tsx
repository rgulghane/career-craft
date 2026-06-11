"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAccess } from "@/components/admin/admin-access";
import {
  FULL_ADMIN_DEFAULT_COLUMNS,
  USER_LIST_OPTIONAL_COLUMNS,
  type UserListOptionalColumn,
  buildUsersListHref,
  parseVisibleColumns,
} from "@/lib/admin/user-list-config";

export function UserListColumnPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isFullAdmin } = useAdminAccess();

  if (!isFullAdmin) {
    return null;
  }

  const visible = new Set(parseVisibleColumns(searchParams.get("cols") ?? undefined, true));

  function applyColumns(nextVisible: Set<UserListOptionalColumn>) {
    const cols = USER_LIST_OPTIONAL_COLUMNS.map((c) => c.id).filter((id) => nextVisible.has(id));
    router.push(
      buildUsersListHref(searchParams, {
        cols: cols.length > 0 ? cols.join(",") : FULL_ADMIN_DEFAULT_COLUMNS.join(","),
        page: undefined,
      }),
    );
  }

  function toggleColumn(id: UserListOptionalColumn) {
    const next = new Set(visible);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    if (next.size === 0) {
      return;
    }
    applyColumns(next);
  }

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 [&::-webkit-details-marker]:hidden">
        Columns
      </summary>
      <div className="absolute right-0 z-10 mt-2 min-w-[220px] rounded-xl border border-white/10 bg-slate-900 p-4 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Show columns</p>
        <ul className="mt-3 space-y-2">
          {USER_LIST_OPTIONAL_COLUMNS.map((column) => (
            <li key={column.id}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={visible.has(column.id)}
                  onChange={() => toggleColumn(column.id)}
                  className="rounded border-white/20 bg-white/5"
                />
                {column.label}
              </label>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => applyColumns(new Set(FULL_ADMIN_DEFAULT_COLUMNS))}
          className="mt-4 text-xs font-medium text-amber-400 hover:underline"
        >
          Reset to defaults
        </button>
      </div>
    </details>
  );
}

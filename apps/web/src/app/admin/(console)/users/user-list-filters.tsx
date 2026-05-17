"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { USER_TYPES } from "@career-craft/shared";

export function UserListFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page");
    router.push(`/admin/users?${next.toString()}`);
  }

  return (
    <form
      className="flex flex-wrap gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        update("q", fd.get("q")?.toString() ?? "");
      }}
    >
      <input
        name="q"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder="Search email, name, code…"
        className="min-w-[200px] flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
      />
      <select
        defaultValue={searchParams.get("userType") ?? ""}
        onChange={(e) => update("userType", e.target.value)}
        className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white"
      >
        <option value="">All types</option>
        {USER_TYPES.filter((t) => t !== "admin").map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("enrolled") ?? ""}
        onChange={(e) => update("enrolled", e.target.value)}
        className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white"
      >
        <option value="">All enrollment</option>
        <option value="true">Enrolled (paid)</option>
        <option value="false">Not enrolled</option>
      </select>
      <button
        type="submit"
        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
      >
        Search
      </button>
    </form>
  );
}

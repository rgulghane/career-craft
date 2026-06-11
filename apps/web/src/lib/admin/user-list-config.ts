export const USER_LIST_OPTIONAL_COLUMNS = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "type", label: "Type" },
  { id: "code", label: "Code" },
  { id: "enrolled", label: "Enrolled" },
  { id: "createdAt", label: "Created at" },
  { id: "updatedAt", label: "Updated at" },
] as const;

export type UserListOptionalColumn = (typeof USER_LIST_OPTIONAL_COLUMNS)[number]["id"];

export const USER_LIST_SORT_FIELDS = ["createdAt", "updatedAt"] as const;
export type UserListSortField = (typeof USER_LIST_SORT_FIELDS)[number];
export type UserListSortDir = "asc" | "desc";

export type AdminUserListRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  userType: string | null;
  referralCode: string | null;
  hasPaidEnrollment: boolean;
  createdAt: string;
  updatedAt: string;
};

export const READONLY_VISIBLE_COLUMNS: UserListOptionalColumn[] = [
  "email",
  "phone",
  "type",
  "code",
  "enrolled",
];

/** Default visible columns for full admins (date columns are opt-in via the column picker). */
export const FULL_ADMIN_DEFAULT_COLUMNS: UserListOptionalColumn[] = [
  ...READONLY_VISIBLE_COLUMNS,
];

const OPTIONAL_COLUMN_IDS = new Set<string>(USER_LIST_OPTIONAL_COLUMNS.map((c) => c.id));

export function parseVisibleColumns(
  raw: string | undefined,
  isFullAdmin: boolean,
): UserListOptionalColumn[] {
  if (!isFullAdmin) {
    return [...READONLY_VISIBLE_COLUMNS];
  }
  if (!raw?.trim()) {
    return [...FULL_ADMIN_DEFAULT_COLUMNS];
  }
  const picked = raw
    .split(",")
    .map((part) => part.trim())
    .filter((id): id is UserListOptionalColumn => OPTIONAL_COLUMN_IDS.has(id));
  return picked.length > 0 ? picked : [...FULL_ADMIN_DEFAULT_COLUMNS];
}

export function parseSortField(
  raw: string | undefined,
  isFullAdmin: boolean,
): UserListSortField {
  if (!isFullAdmin) {
    return "createdAt";
  }
  if (raw && (USER_LIST_SORT_FIELDS as readonly string[]).includes(raw)) {
    return raw as UserListSortField;
  }
  return "createdAt";
}

export function parseSortDir(raw: string | undefined, isFullAdmin: boolean): UserListSortDir {
  if (!isFullAdmin) {
    return "desc";
  }
  return raw === "asc" ? "asc" : "desc";
}

export function formatAdminUserDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function buildUsersListHref(
  current: URLSearchParams,
  patch: Record<string, string | number | undefined | null>,
): string {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null || value === "") {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  }
  const qs = next.toString();
  return qs ? `/admin/users?${qs}` : "/admin/users";
}

export function nextSortDir(
  activeField: UserListSortField,
  field: UserListSortField,
  currentDir: UserListSortDir,
): UserListSortDir {
  if (activeField === field) {
    return currentDir === "asc" ? "desc" : "asc";
  }
  return "desc";
}

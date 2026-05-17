/** Account roles stored on User.userType. */
export const USER_TYPES = [
  "student",
  "influencer",
  "partner",
  "college-ambassador",
  "admin",
  "admin-readonly",
] as const;

export type UserType = (typeof USER_TYPES)[number];

export const PORTAL_ADMIN_TYPES = ["admin", "admin-readonly"] as const;

export type PortalAdminType = (typeof PORTAL_ADMIN_TYPES)[number];

export function isPortalAdminUserType(
  userType: string | null | undefined,
): userType is PortalAdminType {
  return userType === "admin" || userType === "admin-readonly";
}

/** Full admin — can mutate data and manage other admins. */
export function isFullAdminUserType(userType: string | null | undefined): userType is "admin" {
  return userType === "admin";
}

export function isReadOnlyAdminUserType(
  userType: string | null | undefined,
): userType is "admin-readonly" {
  return userType === "admin-readonly";
}

/** @deprecated Use isPortalAdminUserType */
export function isAdminUserType(userType: string | null | undefined): userType is "admin" {
  return userType === "admin";
}

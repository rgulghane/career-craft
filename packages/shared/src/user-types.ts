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

/**
 * Non-student, non-admin roles an admin assigns when granting a direct
 * enrollment. The admin must pick one of these before the enrollment is allowed.
 */
export const DIRECT_ENROLLMENT_CATEGORIES = [
  "influencer",
  "partner",
  "college-ambassador",
] as const;

export type DirectEnrollmentCategory = (typeof DIRECT_ENROLLMENT_CATEGORIES)[number];

/** Human-readable labels for the direct-enrollment categories. */
export const DIRECT_ENROLLMENT_CATEGORY_LABELS: Record<DirectEnrollmentCategory, string> = {
  influencer: "Influencer",
  partner: "Partner",
  "college-ambassador": "College Ambassador",
};

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

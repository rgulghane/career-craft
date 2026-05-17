/** Account roles stored on User.userType. */
export const USER_TYPES = [
  "student",
  "influencer",
  "partner",
  "college-ambassador",
  "admin",
] as const;

export type UserType = (typeof USER_TYPES)[number];

export function isAdminUserType(userType: string | null | undefined): userType is "admin" {
  return userType === "admin";
}

import { isPortalAdminUserType } from "@career-craft/shared";

export function getSignOutConfig(userType?: string | null) {
  const portalAdmin = isPortalAdminUserType(userType);
  return {
    logoutPath: portalAdmin ? "/api/admin/auth/logout" : "/api/auth/logout",
    redirectPath: portalAdmin ? "/admin/login" : "/",
  } as const;
}

export async function performSignOut(userType?: string | null): Promise<string> {
  const { logoutPath, redirectPath } = getSignOutConfig(userType);
  await fetch(logoutPath, { method: "POST", credentials: "same-origin" });
  return redirectPath;
}

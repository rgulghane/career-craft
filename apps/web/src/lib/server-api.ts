import "server-only";

import type { DashboardResponse } from "@career-craft/shared";
import { getSession, type SessionUser } from "@/server/auth-session";
import { buildDashboardForUser } from "@/server/services/dashboard";

/**
 * Server-side data access for RSC pages. Direct in-process calls — no HTTP hop.
 */

export async function getSessionUser(): Promise<SessionUser | null> {
  return getSession();
}

export async function fetchDashboard(): Promise<DashboardResponse | null> {
  const user = await getSession();
  if (!user) {
    return null;
  }
  return buildDashboardForUser(user.id);
}

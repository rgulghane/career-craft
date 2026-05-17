import "server-only";

import type { DashboardResponse } from "@career-craft/shared";
import { getSession, type SessionUser } from "@/server/auth-session";
import { toDbId } from "@/server/db/helpers";
import { enrollmentsCollection } from "@/server/db/mongo-client";
import { buildDashboardForUser } from "@/server/services/dashboard";

/**
 * Server-side data access for RSC pages. Direct in-process calls — no HTTP hop.
 */

export async function getSessionUser(): Promise<SessionUser | null> {
  return getSession();
}

/** True when the user has at least one paid enrollment. */
export async function userHasPaidEnrollment(userId: string): Promise<boolean> {
  const enrollments = await enrollmentsCollection();
  const paidDoc = await enrollments.findOne(
    { userId: toDbId(userId), status: "PAID" },
    { projection: { _id: 1 } },
  );
  return paidDoc !== null;
}

export async function fetchDashboard(): Promise<DashboardResponse | null> {
  const user = await getSession();
  if (!user) {
    return null;
  }
  return buildDashboardForUser(user.id);
}

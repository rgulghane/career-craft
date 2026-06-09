import "server-only";

import type { EnrollmentSeats } from "@/lib/seats-types";
import { getSeatsSettings } from "@/server/services/admin/seats";

/** Active cohort seat counts for SSR/props (admin-managed with built-in fallback). */
export async function getEnrollmentSeats(): Promise<EnrollmentSeats> {
  const seats = await getSeatsSettings();
  return {
    total: seats.total,
    remaining: seats.remaining,
  };
}

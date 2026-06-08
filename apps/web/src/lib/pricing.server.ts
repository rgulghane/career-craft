import "server-only";

import type { EnrollmentPricingRupees } from "@/lib/pricing-types";
import { getPricingSettings } from "@/server/services/admin/pricing";

/**
 * Active enrollment pricing for SSR/props. Reads the admin-managed course fees
 * (falling back to env defaults when none are set).
 */
export async function getEnrollmentPricingRupees(): Promise<EnrollmentPricingRupees> {
  const pricing = await getPricingSettings();
  return {
    standardInRupees: pricing.standardInRupees,
    withReferralCodeInRupees: pricing.withReferralCodeInRupees,
  };
}

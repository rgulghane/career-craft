import "server-only";

import { serverConfig } from "@/lib/config";
import type { EnrollmentPricingRupees } from "@/lib/pricing-types";

export function getEnrollmentPricingRupees(): EnrollmentPricingRupees {
  return {
    standardInRupees: serverConfig.pricing.standardInRupees,
    withReferralCodeInRupees: serverConfig.pricing.withReferralInRupees,
  };
}

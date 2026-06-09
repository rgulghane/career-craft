import { ENROLLMENT_WIDGET, STANDARD_PRICE_PLACEHOLDER } from "@career-craft/shared/content";
import type { EnrollmentPricingRupees } from "@/lib/pricing-types";

/** Format a whole-rupee amount as INR (e.g. 5000 → ₹5,000). */
export function formatINR(rupees: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

/** Inject the live enrollment standard fee into static marketing copy. */
export function applyStandardPriceLabel(text: string, standardPriceLabel: string): string {
  return text.replaceAll(STANDARD_PRICE_PLACEHOLDER, standardPriceLabel);
}

/** Rounded percent discount from `fromRupees` down to `toRupees`. */
export function discountPercentOff(fromRupees: number, toRupees: number): number {
  if (fromRupees <= 0 || toRupees >= fromRupees) {
    return 0;
  }
  return Math.round((1 - toRupees / fromRupees) * 100);
}

export function listPrices(pricing: EnrollmentPricingRupees) {
  const standardRupees = pricing.standardInRupees;
  const emiRupees = Math.round(standardRupees / ENROLLMENT_WIDGET.emiMonths);
  return {
    standard: formatINR(standardRupees),
    withReferral: formatINR(pricing.withReferralCodeInRupees),
    list: formatINR(ENROLLMENT_WIDGET.listPriceInRupees),
    emi: formatINR(emiRupees),
  };
}

import { ENROLLMENT_WIDGET, PRICING } from "@career-craft/shared/content";

export function formatINRFromPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export const listPrices = () => {
  const standardPaise = PRICING.standardInPaise;
  const emiPaise = Math.round(standardPaise / ENROLLMENT_WIDGET.emiMonths);
  return {
    standard: formatINRFromPaise(standardPaise),
    withReferral: formatINRFromPaise(PRICING.withReferralCodeInPaise),
    list: formatINRFromPaise(ENROLLMENT_WIDGET.listPriceInPaise),
    emi: formatINRFromPaise(emiPaise),
  };
};

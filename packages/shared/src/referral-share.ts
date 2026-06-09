/** WhatsApp / clipboard copy for enrolled users sharing their referral link. */
export function buildReferralShareMessage(params: {
  programName: string;
  shareUrl: string;
  referralCode: string;
  referralDiscountPercent: number;
  referralPriceLabel?: string;
  standardPriceLabel?: string;
}): string {
  const {
    programName,
    shareUrl,
    referralCode,
    referralDiscountPercent,
    referralPriceLabel,
    standardPriceLabel,
  } = params;

  const discountLine =
    referralPriceLabel && standardPriceLabel
      ? `Use referral code ${referralCode} for ${referralDiscountPercent}% off (pay ${referralPriceLabel} instead of ${standardPriceLabel}).`
      : `Use referral code ${referralCode} for ${referralDiscountPercent}% off your enrollment.`;

  return [
    `Join me on ${programName}:`,
    shareUrl,
    "",
    discountLine,
    "",
    "12-week AI job accelerator · live Saturday classes · industry tools, projects & placement support.",
    "The code applies automatically when you enroll via the link above.",
  ].join("\n");
}

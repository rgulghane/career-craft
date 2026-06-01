import { EnrolledCongratulationsCard } from "@/components/enrolled-congratulations-card";
import { EnrollmentPricingWidget } from "@/components/enrollment-pricing-widget";
import type { EnrollmentPricingRupees } from "@/lib/pricing-types";
import { Section } from "./section";

export function LandingMobileEnrollment({
  pricing,
  isLoggedIn = false,
  isEnrolled = false,
  firstName,
  referralCode = null,
  defaultReferralCode = "",
}: {
  pricing: EnrollmentPricingRupees;
  isLoggedIn?: boolean;
  isEnrolled?: boolean;
  firstName?: string;
  referralCode?: string | null;
  defaultReferralCode?: string;
}) {
  const showEnrolled = isEnrolled && referralCode;
  const showWidget = !isEnrolled;

  if (!showEnrolled && !showWidget) {
    return null;
  }

  return (
    <Section id="pricing" dark className="scroll-mt-24 enroll:hidden">
      {showEnrolled ? (
        <EnrolledCongratulationsCard firstName={firstName} referralCode={referralCode} />
      ) : (
        <EnrollmentPricingWidget
          pricing={pricing}
          mode="marketing"
          isLoggedIn={isLoggedIn}
          defaultReferralCode={defaultReferralCode}
        />
      )}
    </Section>
  );
}

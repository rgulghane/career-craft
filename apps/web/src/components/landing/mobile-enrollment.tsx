import { EnrolledCongratulationsCard } from "@/components/enrolled-congratulations-card";
import { EnrollmentPricingWidget } from "@/components/enrollment-pricing-widget";
import type { EnrollmentPricingRupees } from "@/lib/pricing-types";
import type { EnrollmentSeats } from "@/lib/seats-types";
import { Section } from "./section";

export function LandingMobileEnrollment({
  pricing,
  seats,
  isLoggedIn = false,
  isEnrolled = false,
  firstName,
  referralCode = null,
  defaultReferralCode = "",
}: {
  pricing: EnrollmentPricingRupees;
  seats: EnrollmentSeats;
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
          seats={seats}
          mode="marketing"
          isLoggedIn={isLoggedIn}
          defaultReferralCode={defaultReferralCode}
        />
      )}
    </Section>
  );
}

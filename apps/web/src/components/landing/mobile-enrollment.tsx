import { EnrolledCongratulationsCard } from "@/components/enrolled-congratulations-card";
import { EnrollmentPricingWidget } from "@/components/enrollment-pricing-widget";
import { Section } from "./section";

export function LandingMobileEnrollment({
  isLoggedIn = false,
  isEnrolled = false,
  firstName,
  referralCode = null,
  defaultReferralCode = "",
}: {
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
          mode="marketing"
          isLoggedIn={isLoggedIn}
          defaultReferralCode={defaultReferralCode}
        />
      )}
    </Section>
  );
}

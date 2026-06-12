import type { Metadata } from "next";
import { LandingCertifications } from "@/components/landing/certifications";
import { LandingFaq } from "@/components/landing/faq";
import { LandingCurriculum } from "@/components/landing/curriculum";
import { LandingHero } from "@/components/landing/hero";
import { ReferralLandingHandler } from "@/components/landing/referral-landing-handler";
import { SocialProofToast } from "@/components/landing/social-proof-toast";
import { LandingMobileEnrollment } from "@/components/landing/mobile-enrollment";
import { LandingStudentStories } from "@/components/landing/student-stories";
import { LandingToolsMentors } from "@/components/landing/tools-mentors";
import { JsonLd } from "@/components/json-ld";
import { getEnrollmentPricingRupees } from "@/lib/pricing.server";
import { getEnrollmentSeats } from "@/lib/seats.server";
import { formatINR } from "@/lib/format";
import { getSessionUser, userHasPaidEnrollment } from "@/lib/server-api";
import { getCourseJsonLd, getOrganizationJsonLd, getWebSiteJsonLd, getMetadataBase } from "@/lib/seo";
import { getSiteOrigin } from "@career-craft/shared";

export const metadata: Metadata = {
  alternates: getMetadataBase() ? { canonical: "/" } : undefined,
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const user = await getSessionUser();
  const ref = (await searchParams).ref?.trim().toUpperCase() ?? "";
  const isEnrolled = user ? await userHasPaidEnrollment(user.id) : false;
  const firstName = user ? (user.fullName.split(/\s+/)[0] ?? user.fullName) : undefined;
  const [pricing, seats] = await Promise.all([getEnrollmentPricingRupees(), getEnrollmentSeats()]);
  const standardPriceLabel = formatINR(pricing.standardInRupees);
  const origin = getSiteOrigin();

  return (
    <div className="-mt-px">
      {origin ? (
        <JsonLd
          data={[
            getWebSiteJsonLd(origin),
            getOrganizationJsonLd(origin),
            getCourseJsonLd(origin),
          ]}
        />
      ) : null}
      <SocialProofToast />
      <ReferralLandingHandler referralCode={ref} />
      <LandingHero
        pricing={pricing}
        seats={seats}
        isLoggedIn={user !== null}
        isEnrolled={isEnrolled}
        firstName={firstName}
        referralCode={user?.referralCode ?? null}
        defaultReferralCode={ref}
      />
      <LandingCurriculum />
      <LandingToolsMentors />
      <LandingStudentStories standardPriceLabel={standardPriceLabel} />
      <LandingCertifications />
      <LandingFaq standardPriceLabel={standardPriceLabel} />
      <LandingMobileEnrollment
        pricing={pricing}
        seats={seats}
        isLoggedIn={user !== null}
        isEnrolled={isEnrolled}
        firstName={firstName}
        referralCode={user?.referralCode ?? null}
        defaultReferralCode={ref}
      />
    </div>
  );
}

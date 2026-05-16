import { LandingCertifications } from "@/components/landing/certifications";
import { LandingCta } from "@/components/landing/cta";
import { LandingCurriculum } from "@/components/landing/curriculum";
import { LandingHero } from "@/components/landing/hero";
import { LandingPricingReferrals } from "@/components/landing/pricing-referrals";
import { LandingStudentStories } from "@/components/landing/student-stories";
import { LandingToolsMentors } from "@/components/landing/tools-mentors";
import { getSessionUser } from "@/lib/server-api";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const user = await getSessionUser();
  const ref = (await searchParams).ref?.trim().toUpperCase() ?? "";

  return (
    <div className="-mt-px">
      <LandingHero isLoggedIn={user !== null} defaultReferralCode={ref} />
      <LandingCurriculum />
      <LandingToolsMentors />
      <LandingStudentStories />
      <LandingCertifications />
      <LandingPricingReferrals />
      <LandingCta isLoggedIn={user !== null} />
    </div>
  );
}

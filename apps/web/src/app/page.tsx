import { LandingCertifications } from "@/components/landing/certifications";
import { LandingFaq } from "@/components/landing/faq";
import { LandingCurriculum } from "@/components/landing/curriculum";
import { LandingHero } from "@/components/landing/hero";
import { SocialProofToast } from "@/components/landing/social-proof-toast";
import { LandingMobileEnrollment } from "@/components/landing/mobile-enrollment";
import { LandingStudentStories } from "@/components/landing/student-stories";
import { LandingToolsMentors } from "@/components/landing/tools-mentors";
import { getSessionUser, userHasPaidEnrollment } from "@/lib/server-api";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const user = await getSessionUser();
  const ref = (await searchParams).ref?.trim().toUpperCase() ?? "";
  const isEnrolled = user ? await userHasPaidEnrollment(user.id) : false;
  const firstName = user ? (user.fullName.split(/\s+/)[0] ?? user.fullName) : undefined;

  return (
    <div className="-mt-px">
      <SocialProofToast />
      <LandingHero
        isLoggedIn={user !== null}
        isEnrolled={isEnrolled}
        firstName={firstName}
        referralCode={user?.referralCode ?? null}
        defaultReferralCode={ref}
      />
      <LandingCurriculum />
      <LandingToolsMentors />
      <LandingStudentStories />
      <LandingCertifications />
      <LandingFaq />
      <LandingMobileEnrollment
        isLoggedIn={user !== null}
        isEnrolled={isEnrolled}
        firstName={firstName}
        referralCode={user?.referralCode ?? null}
        defaultReferralCode={ref}
      />
    </div>
  );
}

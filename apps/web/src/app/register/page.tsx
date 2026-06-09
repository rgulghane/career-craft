import { redirect } from "next/navigation";
import { messages } from "@career-craft/shared";
import { AppPageShell } from "@/components/app-page-shell";
import { getSessionUser } from "@/lib/server-api";
import { buildEnrollPath, buildLoginPath } from "@/lib/referral-url";
import { googleAuthErrorMessage } from "@/lib/google-auth-error-message";
import { isGoogleAuthConfigured } from "@/server/services/google-auth";
import { createPageMetadata } from "@/lib/seo";
import { AuthCard } from "../login/ui";

export const metadata = createPageMetadata({
  title: messages.nav.register,
  description: "Create your AI Career Launchpad account to enroll in the program.",
  noIndex: true,
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await getSessionUser();
  const ref = params.ref?.trim().toUpperCase() ?? "";
  const enrollAfterAuth = buildEnrollPath(ref, true);

  if (user && ref) {
    redirect(enrollAfterAuth);
  }

  return (
    <AppPageShell narrow>
      <AuthCard
        mode="register"
        heading={user ? messages.enroll.heading : messages.auth.registerHeading}
        sessionUser={user}
        redirectTo={ref || user ? enrollAfterAuth : "/dashboard"}
        alternateAuthHref={buildLoginPath(ref)}
        referralCode={ref}
        googleAuthEnabled={isGoogleAuthConfigured() && !user}
        initialError={googleAuthErrorMessage(params.error)}
      />
    </AppPageShell>
  );
}

import { redirect } from "next/navigation";
import { messages } from "@career-craft/shared";
import { AppPageShell } from "@/components/app-page-shell";
import { getSessionUser } from "@/lib/server-api";
import { buildRegisterPath } from "@/lib/referral-url";
import { googleAuthErrorMessage } from "@/lib/google-auth-error-message";
import { isGoogleAuthConfigured } from "@/server/services/google-auth";
import { createPageMetadata } from "@/lib/seo";
import { AuthCard } from "./ui";

export const metadata = createPageMetadata({
  title: messages.nav.signIn,
  description: "Sign in to your AI Career Launchpad account.",
  noIndex: true,
});

function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

function refFromNext(next: string): string {
  try {
    const url = new URL(next, "http://localhost");
    return url.searchParams.get("ref")?.trim().toUpperCase() ?? "";
  } catch {
    return "";
  }
}


export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await getSessionUser();
  const next = safeNextPath(params.next);
  const ref = refFromNext(next);

  if (user) {
    redirect(next);
  }

  return (
    <AppPageShell narrow>
      <AuthCard
        mode="login"
        heading={messages.auth.signInHeading}
        redirectTo={next}
        alternateAuthHref={buildRegisterPath(ref)}
        referralCode={ref}
        googleAuthEnabled={isGoogleAuthConfigured()}
        initialError={googleAuthErrorMessage(params.error)}
      />
    </AppPageShell>
  );
}

import { messages } from "@career-craft/shared";

/** Map `?error=google_*` query values from OAuth redirects to user-facing copy. */
export function googleAuthErrorMessage(error: string | undefined): string | null {
  if (!error?.startsWith("google_")) {
    return null;
  }

  const code = error.slice("google_".length);

  switch (code) {
    case "not_registered":
      return messages.auth.googleNotRegistered;
    case "profile_required":
      return messages.auth.googleProfileRequired;
    case "not_configured":
    case "failed":
      return messages.auth.googleSignInFailed;
    default:
      return messages.auth.googleSignInFailed;
  }
}

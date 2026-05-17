import { NextResponse } from "next/server";
import { absoluteAppUrl } from "@/lib/app-url";
import { verifyOAuthState } from "@/server/oauth-state";
import { exchangeGoogleCode, isGoogleAuthConfigured, signInWithGoogle } from "@/server/services/google-auth";
import { setSessionCookie } from "@/server/session-cookie";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(absoluteAppUrl("/login?error=google_not_configured"));
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(
      absoluteAppUrl(`/login?error=google_${encodeURIComponent(error)}`),
    );
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const redirectTo = state ? verifyOAuthState(state) : null;

  if (!code || !redirectTo) {
    return NextResponse.redirect(absoluteAppUrl("/login?error=google_failed"));
  }

  try {
    const profile = await exchangeGoogleCode(code);
    const result = await signInWithGoogle(profile);
    const res = NextResponse.redirect(absoluteAppUrl(redirectTo));
    setSessionCookie(res, result.token);
    return res;
  } catch {
    return NextResponse.redirect(absoluteAppUrl("/login?error=google_failed"));
  }
}

import { NextResponse } from "next/server";
import { verifyOAuthState } from "@/server/oauth-state";
import { exchangeGoogleCode, isGoogleAuthConfigured, signInWithGoogle } from "@/server/services/google-auth";
import { setSessionCookie } from "@/server/session-cookie";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", request.url));
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=google_${encodeURIComponent(error)}`, request.url),
    );
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const redirectTo = state ? verifyOAuthState(state) : null;

  if (!code || !redirectTo) {
    return NextResponse.redirect(new URL("/login?error=google_failed", request.url));
  }

  try {
    const profile = await exchangeGoogleCode(code);
    const result = await signInWithGoogle(profile);
    const res = NextResponse.redirect(new URL(redirectTo, request.url));
    setSessionCookie(res, result.token);
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_failed", request.url));
  }
}

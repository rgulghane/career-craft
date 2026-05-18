import { NextResponse } from "next/server";
import { absoluteAppUrl } from "@/lib/app-url";
import { verifyOAuthState } from "@/server/oauth-state";
import {
  exchangeGoogleCode,
  GoogleAuthError,
  isGoogleAuthConfigured,
  loginWithGoogle,
  registerWithGoogle,
} from "@/server/services/google-auth";
import { setSessionCookie } from "@/server/session-cookie";

export const dynamic = "force-dynamic";

function authErrorRedirect(intent: "login" | "register", code: string, next?: string): string {
  const base = intent === "register" ? "/register" : "/login";
  const params = new URLSearchParams({ error: `google_${code}` });
  if (next && next !== "/dashboard") {
    params.set("next", next);
  }
  return absoluteAppUrl(`${base}?${params.toString()}`);
}

export async function GET(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(absoluteAppUrl("/login?error=google_not_configured"));
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(absoluteAppUrl(`/login?error=google_${encodeURIComponent(error)}`));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const verified = state ? verifyOAuthState(state) : null;

  if (!code || !verified) {
    return NextResponse.redirect(absoluteAppUrl("/login?error=google_failed"));
  }

  if (verified.intent === "register" && !verified.profile) {
    return NextResponse.redirect(authErrorRedirect("register", "profile_required", verified.redirectTo));
  }

  try {
    const googleProfile = await exchangeGoogleCode(code);
    const result =
      verified.intent === "login"
        ? await loginWithGoogle(googleProfile)
        : await registerWithGoogle(googleProfile, verified.profile!);

    const res = NextResponse.redirect(absoluteAppUrl(verified.redirectTo));
    setSessionCookie(res, result.token);
    return res;
  } catch (err) {
    if (err instanceof GoogleAuthError) {
      return NextResponse.redirect(authErrorRedirect("login", err.code, verified.redirectTo));
    }
    return NextResponse.redirect(authErrorRedirect(verified.intent, "failed", verified.redirectTo));
  }
}

import { NextResponse } from "next/server";
import { authSignupProfileSchema } from "@career-craft/shared";
import { absoluteAppUrl } from "@/lib/app-url";
import { createOAuthState, type OAuthIntent } from "@/server/oauth-state";
import {
  buildGoogleAuthorizationUrl,
  isGoogleAuthConfigured,
} from "@/server/services/google-auth";

export const dynamic = "force-dynamic";

function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

function parseIntent(value: string | null): OAuthIntent {
  return value === "register" ? "register" : "login";
}

function authErrorPath(intent: OAuthIntent, next: string, code: string): string {
  const base = intent === "register" ? "/register" : "/login";
  const params = new URLSearchParams({ error: `google_${code}` });
  if (next && next !== "/dashboard") {
    params.set("next", next);
  }
  return `${base}?${params.toString()}`;
}

function parseProfileFromForm(formData: FormData) {
  return authSignupProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    collegeName: formData.get("collegeName"),
  });
}

async function startGoogleAuth(
  redirectTo: string,
  intent: OAuthIntent,
  profile: ReturnType<typeof parseProfileFromForm> | null,
) {
  if (intent === "register") {
    if (!profile?.success) {
      return NextResponse.redirect(absoluteAppUrl(authErrorPath(intent, redirectTo, "profile_required")));
    }
    const state = createOAuthState(redirectTo, { intent, profile: profile.data });
    return NextResponse.redirect(buildGoogleAuthorizationUrl(state));
  }

  const state = createOAuthState(redirectTo, { intent: "login" });
  return NextResponse.redirect(buildGoogleAuthorizationUrl(state));
}

export async function GET(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const intent = parseIntent(url.searchParams.get("intent"));

  if (intent === "login") {
    return startGoogleAuth(next, "login", null);
  }

  const profile = authSignupProfileSchema.safeParse({
    fullName: url.searchParams.get("fullName"),
    phone: url.searchParams.get("phone"),
    collegeName: url.searchParams.get("collegeName") ?? undefined,
  });

  return startGoogleAuth(next, "register", profile);
}

export async function POST(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
  }

  const formData = await request.formData();
  const next = safeNext(formData.get("next")?.toString() ?? null);
  const intent = parseIntent(formData.get("intent")?.toString() ?? null);

  if (intent === "login") {
    return startGoogleAuth(next, "login", null);
  }

  return startGoogleAuth(next, "register", parseProfileFromForm(formData));
}

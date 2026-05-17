import { NextResponse } from "next/server";
import { createOAuthState } from "@/server/oauth-state";
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

export async function GET(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
  }

  const next = safeNext(new URL(request.url).searchParams.get("next"));
  const state = createOAuthState(next);
  const url = buildGoogleAuthorizationUrl(state);

  return NextResponse.redirect(url);
}

import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { authSignupProfileSchema, type AuthSignupProfile } from "@career-craft/shared";
import { serverConfig } from "@/lib/config";

export type OAuthIntent = "login" | "register";

function sign(payload: string): string {
  return createHmac("sha256", serverConfig.jwtSecret).update(payload).digest("base64url");
}

type OAuthStatePayload = {
  r: string;
  n: string;
  i: OAuthIntent;
  fn?: string;
  ph?: string;
  cn?: string;
};

function safeRedirect(redirectTo: string): string {
  return redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard";
}

export function createOAuthState(
  redirectTo: string,
  options: { intent: OAuthIntent; profile?: AuthSignupProfile },
): string {
  const payload: OAuthStatePayload = {
    r: safeRedirect(redirectTo),
    n: randomBytes(16).toString("hex"),
    i: options.intent,
  };

  if (options.profile) {
    payload.fn = options.profile.fullName;
    payload.ph = options.profile.phone;
    if (options.profile.collegeName) {
      payload.cn = options.profile.collegeName;
    }
  }

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export type VerifiedOAuthState = {
  redirectTo: string;
  intent: OAuthIntent;
  profile: AuthSignupProfile | null;
};

export function verifyOAuthState(state: string): VerifiedOAuthState | null {
  const dot = state.indexOf(".");
  if (dot <= 0) {
    return null;
  }
  const payload = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length) {
    return null;
  }
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OAuthStatePayload;
    const redirectTo = safeRedirect(data.r ?? "/dashboard");
    const intent: OAuthIntent = data.i === "register" ? "register" : "login";

    if (intent === "login") {
      return { redirectTo, intent, profile: null };
    }

    if (!data.fn || !data.ph) {
      return null;
    }

    const parsed = authSignupProfileSchema.safeParse({
      fullName: data.fn,
      phone: data.ph,
      collegeName: data.cn,
    });
    if (!parsed.success) {
      return null;
    }

    return { redirectTo, intent, profile: parsed.data };
  } catch {
    return null;
  }
}

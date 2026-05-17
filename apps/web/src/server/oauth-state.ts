import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { serverConfig } from "@/lib/config";

function sign(payload: string): string {
  return createHmac("sha256", serverConfig.jwtSecret).update(payload).digest("base64url");
}

export function createOAuthState(redirectTo: string): string {
  const safeRedirect =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard";
  const payload = Buffer.from(
    JSON.stringify({ r: safeRedirect, n: randomBytes(16).toString("hex") }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyOAuthState(state: string): string | null {
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
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { r?: string };
    const redirect = data.r ?? "/dashboard";
    if (!redirect.startsWith("/") || redirect.startsWith("//")) {
      return "/dashboard";
    }
    return redirect;
  } catch {
    return null;
  }
}

import "server-only";

import type { NextResponse } from "next/server";
import { COOKIE_NAMES } from "@career-craft/shared";

/** Clear the auth session cookie on an API response. */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAMES.authToken, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

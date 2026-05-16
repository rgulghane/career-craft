import "server-only";

import type { NextResponse } from "next/server";
import { AUTH, COOKIE_NAMES } from "@career-craft/shared";

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(COOKIE_NAMES.authToken, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH.sessionCookieMaxAgeSeconds,
  });
}

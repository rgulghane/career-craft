import { NextResponse } from "next/server";
import { COOKIE_NAMES } from "@career-craft/shared";
import { withAdminApi } from "@/server/admin-api";

export async function POST() {
  return withAdminApi(async () => {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAMES.authToken, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return res;
  });
}

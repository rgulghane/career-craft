import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/server/clear-session-cookie";

/** Always clears session — no auth required so sign-out works even if the token expired. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}

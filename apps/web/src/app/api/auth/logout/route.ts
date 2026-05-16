import { COOKIE_NAMES } from "@career-craft/shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const jar = await cookies();
  jar.delete(COOKIE_NAMES.authToken);
  return NextResponse.json({ ok: true });
}

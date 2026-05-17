import { NextResponse } from "next/server";
import { getSession } from "@/server/auth-session";
import { lookupReferrerByCode } from "@/server/services/referral-lookup";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  const session = await getSession();
  const result = await lookupReferrerByCode(code, session?.id);

  if (!result) {
    return NextResponse.json({ valid: false as const });
  }

  return NextResponse.json({
    valid: true as const,
    referrerName: result.referrerName,
    referrerFirstName: result.referrerFirstName,
  });
}

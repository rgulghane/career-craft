import { NextResponse } from "next/server";
import { INTERNAL } from "@career-craft/shared";
import { serverConfig } from "@/lib/config";
import { qualifyDueReferrals } from "@/server/services/referral-qualification";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const provided = req.headers.get(INTERNAL.cronSecretHeader);
  if (!provided || provided !== serverConfig.cronSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const result = await qualifyDueReferrals();
  return NextResponse.json(result);
}

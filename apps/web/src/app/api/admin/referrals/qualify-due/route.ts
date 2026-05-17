import { NextResponse } from "next/server";
import { withFullAdminApi } from "@/server/admin-api";
import { runAdminQualifyDueReferrals } from "@/server/services/admin/referrals";

export const dynamic = "force-dynamic";

export async function POST() {
  return withFullAdminApi(async () => {
    const result = await runAdminQualifyDueReferrals();
    return NextResponse.json(result);
  });
}

import { NextResponse } from "next/server";
import { withAdminApi } from "@/server/admin-api";
import { runAdminQualifyDueReferrals } from "@/server/services/admin/referrals";

export const dynamic = "force-dynamic";

export async function POST() {
  return withAdminApi(async () => {
    const result = await runAdminQualifyDueReferrals();
    return NextResponse.json(result);
  });
}

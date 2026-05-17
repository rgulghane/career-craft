import { NextResponse } from "next/server";
import { adminReferralListQuerySchema } from "@career-craft/shared";
import { withAdminApi } from "@/server/admin-api";
import { listAdminReferrals } from "@/server/services/admin/referrals";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withAdminApi(async () => {
    const url = new URL(req.url);
    const parsed = adminReferralListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
    }
    const result = await listAdminReferrals({
      status: parsed.data.status,
      referrerId: parsed.data.referrerId,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });
    return NextResponse.json(result);
  });
}

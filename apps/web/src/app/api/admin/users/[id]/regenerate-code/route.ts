import { NextResponse } from "next/server";
import { withFullAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { regenerateAdminUserReferralCode } from "@/server/services/admin/users";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  return withFullAdminApi(async () => {
    const { id } = await params;
    try {
      const referralCode = await regenerateAdminUserReferralCode(id);
      return NextResponse.json({ referralCode });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

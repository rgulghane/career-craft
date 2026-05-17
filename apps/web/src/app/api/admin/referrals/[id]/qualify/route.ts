import { NextResponse } from "next/server";
import { withAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { qualifyAdminReferral } from "@/server/services/admin/referrals";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const { id } = await params;
    try {
      await qualifyAdminReferral(id);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

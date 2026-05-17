import { NextResponse } from "next/server";
import { withAdminApi } from "@/server/admin-api";
import { getAdminReferral } from "@/server/services/admin/referrals";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const { id } = await params;
    const data = await getAdminReferral(id);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  });
}

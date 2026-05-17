import { NextResponse } from "next/server";
import { withAdminApi } from "@/server/admin-api";
import { getAdminOverviewStats } from "@/server/services/admin/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAdminApi(async () => {
    const stats = await getAdminOverviewStats();
    return NextResponse.json(stats);
  });
}

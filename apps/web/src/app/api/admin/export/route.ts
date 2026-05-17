import { NextResponse } from "next/server";
import { adminExportQuerySchema } from "@career-craft/shared";
import { withAdminApi } from "@/server/admin-api";
import { exportAdminCsv } from "@/server/services/admin/export";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withAdminApi(async () => {
    const url = new URL(req.url);
    const parsed = adminExportQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }
    const csv = await exportAdminCsv(parsed.data.type);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${parsed.data.type}-export.csv"`,
      },
    });
  });
}

import { NextResponse } from "next/server";
import { adminEnrollmentListQuerySchema } from "@career-craft/shared";
import { withAdminApi } from "@/server/admin-api";
import { listAdminEnrollments } from "@/server/services/admin/enrollments";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withAdminApi(async () => {
    const url = new URL(req.url);
    const parsed = adminEnrollmentListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
    }
    const result = await listAdminEnrollments({
      status: parsed.data.status,
      userId: parsed.data.userId,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });
    return NextResponse.json(result);
  });
}

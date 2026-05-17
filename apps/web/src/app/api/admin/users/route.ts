import { NextResponse } from "next/server";
import { adminUserListQuerySchema } from "@career-craft/shared";
import { withAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { listAdminUsers } from "@/server/services/admin/users";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withAdminApi(async () => {
    const url = new URL(req.url);
    const parsed = adminUserListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
    }
    try {
      const enrolled =
        parsed.data.enrolled === "true" ? true : parsed.data.enrolled === "false" ? false : undefined;
      const result = await listAdminUsers({
        q: parsed.data.q,
        userType: parsed.data.userType,
        enrolled,
        page: parsed.data.page,
        limit: parsed.data.limit,
      });
      return NextResponse.json(result);
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

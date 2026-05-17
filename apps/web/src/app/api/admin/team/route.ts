import { NextResponse } from "next/server";
import { adminCreateReadonlyAdminBodySchema } from "@career-craft/shared";
import { withAdminApi, withFullAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { createReadonlyPortalAdmin, listPortalAdmins } from "@/server/services/admin/team";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAdminApi(async () => {
    const admins = await listPortalAdmins();
    return NextResponse.json({ admins });
  });
}

export async function POST(req: Request) {
  return withFullAdminApi(async () => {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = adminCreateReadonlyAdminBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    try {
      const admin = await createReadonlyPortalAdmin(parsed.data);
      return NextResponse.json({ admin }, { status: 201 });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

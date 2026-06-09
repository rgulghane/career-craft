import { NextResponse } from "next/server";
import { adminUpdateSeatsBodySchema } from "@career-craft/shared";
import { withAdminApi, withFullAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { getAdminSession } from "@/server/auth-guards";
import { getSeatsSettings, updateSeatsSettings } from "@/server/services/admin/seats";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAdminApi(async () => {
    const seats = await getSeatsSettings();
    return NextResponse.json({ seats });
  });
}

export async function PATCH(req: Request) {
  return withFullAdminApi(async () => {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = adminUpdateSeatsBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    try {
      const admin = await getAdminSession();
      const seats = await updateSeatsSettings(parsed.data, admin?.id);
      return NextResponse.json({ seats });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

import { NextResponse } from "next/server";
import { adminUpdatePricingBodySchema } from "@career-craft/shared";
import { withAdminApi, withFullAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { getAdminSession } from "@/server/auth-guards";
import { getPricingSettings, updatePricingSettings } from "@/server/services/admin/pricing";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAdminApi(async () => {
    const pricing = await getPricingSettings();
    return NextResponse.json({ pricing });
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
    const parsed = adminUpdatePricingBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    try {
      const admin = await getAdminSession();
      const pricing = await updatePricingSettings(parsed.data, admin?.id);
      return NextResponse.json({ pricing });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

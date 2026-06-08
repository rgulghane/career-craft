import { NextResponse } from "next/server";
import { adminCompanyLogoBodySchema } from "@career-craft/shared";
import { withAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { listCompanyLogos, upsertCompanyLogo } from "@/server/services/admin/company-logos";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAdminApi(async () => {
    const companyLogos = await listCompanyLogos();
    return NextResponse.json({ companyLogos });
  });
}

export async function POST(req: Request) {
  return withAdminApi(async () => {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = adminCompanyLogoBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    try {
      const companyLogo = await upsertCompanyLogo(parsed.data);
      return NextResponse.json({ companyLogo }, { status: 201 });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

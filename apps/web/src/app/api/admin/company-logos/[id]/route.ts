import { NextResponse } from "next/server";
import { withAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { deleteCompanyLogo } from "@/server/services/admin/company-logos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const { id } = await params;
    try {
      await deleteCompanyLogo(id);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

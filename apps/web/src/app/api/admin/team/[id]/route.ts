import { NextResponse } from "next/server";
import { withFullAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { revokeReadonlyPortalAdmin } from "@/server/services/admin/team";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  return withFullAdminApi(async () => {
    const { id } = await params;
    try {
      await revokeReadonlyPortalAdmin(id);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

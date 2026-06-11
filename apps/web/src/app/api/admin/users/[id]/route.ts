import { NextResponse } from "next/server";
import { adminUpdateUserBodySchema } from "@career-craft/shared";
import { withAdminApi, withFullAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { requireAdminApi, requireFullAdminApi } from "@/server/auth-guards";
import { deleteAdminUser, getAdminUser, updateAdminUser } from "@/server/services/admin/users";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const { id } = await params;
    const user = await getAdminUser(id);
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const admin = await requireAdminApi();
    const { id } = await params;
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = adminUpdateUserBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const body = parsed.data;
    if (admin.readOnly) {
      if (body.email !== undefined || body.userType !== undefined || body.referralCode !== undefined) {
        return NextResponse.json(
          { error: "Viewer admins may only update the user's name." },
          { status: 403 },
        );
      }
      if (body.fullName === undefined) {
        return NextResponse.json({ error: "fullName is required" }, { status: 400 });
      }
    }

    try {
      const user = await updateAdminUser(id, admin.readOnly ? { fullName: body.fullName } : body);
      return NextResponse.json({ user });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withFullAdminApi(async () => {
    const admin = await requireFullAdminApi();
    const { id } = await params;
    try {
      await deleteAdminUser(id, admin.id);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

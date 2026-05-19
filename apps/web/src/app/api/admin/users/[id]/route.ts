import { NextResponse } from "next/server";
import { adminUpdateUserBodySchema } from "@career-craft/shared";
import { withAdminApi, withFullAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { requireFullAdminApi } from "@/server/auth-guards";
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
  return withFullAdminApi(async () => {
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
    try {
      const user = await updateAdminUser(id, parsed.data);
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

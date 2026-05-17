import { NextResponse } from "next/server";
import { adminUpdateEnrollmentBodySchema } from "@career-craft/shared";
import { withAdminApi, withFullAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { getAdminEnrollment, updateAdminEnrollment } from "@/server/services/admin/enrollments";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const { id } = await params;
    const data = await getAdminEnrollment(id);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(data);
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
    const parsed = adminUpdateEnrollmentBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    try {
      const enrollment = await updateAdminEnrollment(id, parsed.data);
      return NextResponse.json({ enrollment });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

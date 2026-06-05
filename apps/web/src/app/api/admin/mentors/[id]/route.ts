import { NextResponse } from "next/server";
import { adminUpdateMentorBodySchema } from "@career-craft/shared";
import { withAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { deleteMentor, getMentor, updateMentorDraft } from "@/server/services/admin/mentors";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const { id } = await params;
    const mentor = await getMentor(id);
    if (!mentor) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ mentor });
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const { id } = await params;
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = adminUpdateMentorBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    try {
      const mentor = await updateMentorDraft(id, parsed.data);
      return NextResponse.json({ mentor });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const { id } = await params;
    try {
      await deleteMentor(id);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

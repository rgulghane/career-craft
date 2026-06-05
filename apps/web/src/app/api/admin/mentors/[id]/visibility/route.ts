import { NextResponse } from "next/server";
import { adminMentorVisibilityBodySchema } from "@career-craft/shared";
import { withAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { setMentorVisibility } from "@/server/services/admin/mentors";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const { id } = await params;
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = adminMentorVisibilityBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    try {
      const mentor = await setMentorVisibility(id, parsed.data.isPublished);
      return NextResponse.json({ mentor });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

import { NextResponse } from "next/server";
import { adminCreateMentorBodySchema } from "@career-craft/shared";
import { withAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { createMentor, listMentors } from "@/server/services/admin/mentors";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAdminApi(async () => {
    const mentors = await listMentors();
    return NextResponse.json({ mentors });
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
    const parsed = adminCreateMentorBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    try {
      const mentor = await createMentor(parsed.data);
      return NextResponse.json({ mentor }, { status: 201 });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

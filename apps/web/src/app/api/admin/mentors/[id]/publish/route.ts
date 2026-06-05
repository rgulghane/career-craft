import { NextResponse } from "next/server";
import { adminUpdateMentorBodySchema } from "@career-craft/shared";
import { withAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { publishMentor } from "@/server/services/admin/mentors";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * "Live the changes" — optionally accepts the latest edits in the body, saves
 * them as the draft, copies the draft into the live content, and publishes.
 */
export async function POST(req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const { id } = await params;

    let body: ReturnType<typeof adminUpdateMentorBodySchema.parse> | undefined;
    const raw = await req.text();
    if (raw.trim().length > 0) {
      let json: unknown;
      try {
        json = JSON.parse(raw);
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
      body = parsed.data;
    }

    try {
      const mentor = await publishMentor(id, body);
      return NextResponse.json({ mentor });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

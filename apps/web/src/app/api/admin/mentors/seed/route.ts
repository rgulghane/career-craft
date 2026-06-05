import { NextResponse } from "next/server";
import { withAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { seedMentorsFromLanding } from "@/server/services/admin/mentors";

export const dynamic = "force-dynamic";

export async function POST() {
  return withAdminApi(async () => {
    try {
      const count = await seedMentorsFromLanding();
      return NextResponse.json({ ok: true, count });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

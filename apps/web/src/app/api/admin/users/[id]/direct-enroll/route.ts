import { NextResponse } from "next/server";
import { adminGrantDirectEnrollmentBodySchema } from "@career-craft/shared";
import { withAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { requireAdminApi } from "@/server/auth-guards";
import { grantDirectEnrollment } from "@/server/services/admin/direct-enrollment";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * Grant a student direct enrollment (no payment) and issue their referral code.
 * Intentionally available to any portal admin, including read-only admins.
 */
export async function POST(req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const admin = await requireAdminApi();
    const { id } = await params;

    const raw = await req.json().catch(() => ({}));
    const parsed = adminGrantDirectEnrollmentBodySchema.safeParse(raw ?? {});
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
      const result = await grantDirectEnrollment(
        id,
        admin.id,
        parsed.data.category,
        parsed.data.reason,
      );
      return NextResponse.json(result);
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

import { NextResponse } from "next/server";
import { adminSetReferralCodeBodySchema, messages } from "@career-craft/shared";
import { withAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { setAdminUserReferralCode } from "@/server/services/admin/users";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Full and read-only portal admins may assign custom referral codes. */
export async function PATCH(req: Request, { params }: Params) {
  return withAdminApi(async () => {
    const { id } = await params;
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = adminSetReferralCodeBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: messages.errors.validation, details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    try {
      const referralCode = await setAdminUserReferralCode(id, parsed.data);
      return NextResponse.json({ referralCode });
    } catch (err) {
      return adminServiceErrorResponse(err);
    }
  });
}

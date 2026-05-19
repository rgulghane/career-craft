import { NextResponse } from "next/server";
import { adminRefundEnrollmentBodySchema, messages } from "@career-craft/shared";
import { withFullAdminApi, adminServiceErrorResponse } from "@/server/admin-api";
import { EnrollmentError } from "@/server/errors";
import { adminRefundEnrollmentPayment } from "@/server/services/razorpay";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  return withFullAdminApi(async () => {
    const { id } = await params;
    let json: unknown = {};
    try {
      const text = await req.text();
      if (text) {
        json = JSON.parse(text) as unknown;
      }
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = adminRefundEnrollmentBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: messages.errors.validation, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    try {
      const result = await adminRefundEnrollmentPayment(id);
      return NextResponse.json({
        ok: true,
        alreadyRefunded: result.alreadyRefunded,
        refundId: result.refundId,
        reason: parsed.data.reason ?? null,
      });
    } catch (err) {
      if (err instanceof EnrollmentError) {
        return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
      }
      return adminServiceErrorResponse(err);
    }
  });
}

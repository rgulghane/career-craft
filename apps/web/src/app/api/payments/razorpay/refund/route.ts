import { NextResponse } from "next/server";
import {
  razorpayRefundBodySchema,
  messages,
} from "@career-craft/shared";
import { paymentRouteErrorResponse, requirePaymentSession } from "@/server/payments-api";
import { refundEnrollmentPayment } from "@/server/services/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requirePaymentSession(req);
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: messages.errors.validation }, { status: 400 });
    }
    const parsed = razorpayRefundBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: messages.errors.validation, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await refundEnrollmentPayment(user.id, parsed.data.enrollmentId);
    return NextResponse.json({
      ok: true,
      alreadyRefunded: result.alreadyRefunded,
      refundId: result.refundId,
    });
  } catch (err) {
    return paymentRouteErrorResponse(err);
  }
}

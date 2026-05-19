import { NextResponse } from "next/server";
import {
  razorpayCreateOrderBodySchema,
  messages,
} from "@career-craft/shared";
import { paymentRouteErrorResponse, requirePaymentSession } from "@/server/payments-api";
import { createRazorpayCheckoutSession } from "@/server/services/razorpay";

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
    const parsed = razorpayCreateOrderBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: messages.errors.validation, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const session = await createRazorpayCheckoutSession(user.id, parsed.data.enrollmentId);
    return NextResponse.json({
      ok: true,
      orderId: session.orderId,
      amount: session.amount,
      currency: session.currency,
      keyId: session.keyId,
      prefill: session.prefill,
    });
  } catch (err) {
    return paymentRouteErrorResponse(err);
  }
}

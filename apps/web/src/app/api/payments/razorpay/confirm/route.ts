import { NextResponse } from "next/server";
import {
  razorpayConfirmBodySchema,
  messages,
} from "@career-craft/shared";
import { paymentRouteErrorResponse, requirePaymentSession } from "@/server/payments-api";
import { confirmRazorpayCheckoutPayment } from "@/server/services/razorpay";

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
    const parsed = razorpayConfirmBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: messages.errors.validation, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { enrollmentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;
    const result = await confirmRazorpayCheckoutPayment(
      user.id,
      enrollmentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );
    return NextResponse.json({ ok: true, alreadyPaid: result.alreadyPaid });
  } catch (err) {
    return paymentRouteErrorResponse(err);
  }
}

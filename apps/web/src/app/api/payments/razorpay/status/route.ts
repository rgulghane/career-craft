import { NextResponse } from "next/server";
import { messages } from "@career-craft/shared";
import { EnrollmentError } from "@/server/errors";
import { paymentRouteErrorResponse, requirePaymentSession } from "@/server/payments-api";
import { getEnrollmentPaymentStatus } from "@/server/services/razorpay";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requirePaymentSession(req);
    const enrollmentId = new URL(req.url).searchParams.get("enrollmentId") ?? "";
    if (!enrollmentId) {
      throw new EnrollmentError(400, "validation", "Missing enrollmentId.");
    }

    const status = await getEnrollmentPaymentStatus(user.id, enrollmentId);
    return NextResponse.json({ ok: true, status });
  } catch (err) {
    return paymentRouteErrorResponse(err);
  }
}

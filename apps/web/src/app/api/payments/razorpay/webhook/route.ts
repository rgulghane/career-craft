import { NextResponse } from "next/server";
import { EnrollmentError } from "@/server/errors";
import { processRazorpayWebhook } from "@/server/services/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  try {
    const result = await processRazorpayWebhook(rawBody, signature);
    return NextResponse.json({ received: true, ...result });
  } catch (err) {
    if (err instanceof EnrollmentError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}

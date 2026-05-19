"use server";

import { messages } from "@career-craft/shared";
import { getSession } from "@/server/auth-session";
import { EnrollmentError } from "@/server/errors";
import {
  confirmRazorpayCheckoutPayment,
  createRazorpayCheckoutSession,
  getEnrollmentPaymentStatus,
} from "@/server/services/razorpay";

export type RazorpayOrderResult =
  | { ok: false; error: string }
  | {
      ok: true;
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      prefill: { name: string; email: string };
    };

export async function createRazorpayOrderAction(enrollmentId: string): Promise<RazorpayOrderResult> {
  const user = await getSession();
  if (!user) {
    return { ok: false, error: messages.errors.unauthorized };
  }
  if (!enrollmentId) {
    return { ok: false, error: "Missing enrollment." };
  }

  try {
    const session = await createRazorpayCheckoutSession(user.id, enrollmentId);
    return { ok: true, ...session };
  } catch (err) {
    if (err instanceof EnrollmentError) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: messages.errors.generic };
  }
}

export type ConfirmPaymentResult = { ok: false; error: string } | { ok: true };

export async function confirmRazorpayPaymentAction(
  enrollmentId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<ConfirmPaymentResult> {
  const user = await getSession();
  if (!user) {
    return { ok: false, error: messages.errors.unauthorized };
  }
  if (!enrollmentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return { ok: false, error: messages.errors.validation };
  }

  try {
    await confirmRazorpayCheckoutPayment(
      user.id,
      enrollmentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );
    return { ok: true };
  } catch (err) {
    if (err instanceof EnrollmentError) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: messages.errors.generic };
  }
}

export type PaymentStatusResult =
  | { ok: false; error: string }
  | { ok: true; status: "PENDING" | "PAID" | "REFUNDED" };

export async function getEnrollmentPaymentStatusAction(
  enrollmentId: string,
): Promise<PaymentStatusResult> {
  const user = await getSession();
  if (!user) {
    return { ok: false, error: messages.errors.unauthorized };
  }
  if (!enrollmentId) {
    return { ok: false, error: "Missing enrollment." };
  }

  try {
    const status = await getEnrollmentPaymentStatus(user.id, enrollmentId);
    return { ok: true, status };
  } catch (err) {
    if (err instanceof EnrollmentError) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: messages.errors.generic };
  }
}

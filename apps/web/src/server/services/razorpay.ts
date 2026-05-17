import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { revalidatePath } from "next/cache";
import { serverConfig } from "@/lib/config";
import { mapEnrollment, mapUser, toDbId } from "../db/helpers";
import { enrollmentsCollection, usersCollection } from "../db/mongo-client";
import { completeEnrollmentPayment, EnrollmentError } from "./enrollment";

function getClient(): Razorpay {
  if (!serverConfig.razorpay.configured) {
    throw new EnrollmentError(503, "payments_unavailable", "Payment gateway is not configured.");
  }
  return new Razorpay({
    key_id: serverConfig.razorpay.keyId,
    key_secret: serverConfig.razorpay.keySecret,
  });
}

export interface RazorpayCheckoutSession {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export async function createRazorpayCheckoutSession(
  userId: string,
  enrollmentId: string,
): Promise<RazorpayCheckoutSession & { prefill: { name: string; email: string } }> {
  const enrollments = await enrollmentsCollection();
  const doc = await enrollments.findOne({
    _id: toDbId(enrollmentId),
    userId: toDbId(userId),
  });
  if (!doc) {
    throw new EnrollmentError(404, "not_found", "Enrollment not found");
  }

  const enrollment = mapEnrollment(doc);
  if (enrollment.status === "PAID") {
    throw new EnrollmentError(409, "already_paid", "Enrollment is already paid.");
  }

  const client = getClient();
  const order = await client.orders.create({
    amount: enrollment.amountInPaise,
    currency: enrollment.currency,
    receipt: enrollment.id.slice(0, 40),
    notes: { enrollmentId: enrollment.id, userId },
  });

  await enrollments.updateOne(
    { _id: toDbId(enrollment.id) },
    { $set: { razorpayOrderId: order.id } },
  );

  const users = await usersCollection();
  const userDoc = await users.findOne({ _id: toDbId(userId) });
  const user = userDoc ? mapUser(userDoc) : null;

  return {
    orderId: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    keyId: serverConfig.razorpay.keyId,
    prefill: {
      name: user?.fullName ?? "",
      email: user?.email ?? "",
    },
  };
}

export function verifyRazorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  if (!serverConfig.razorpay.configured) {
    return false;
  }
  const expected = createHmac("sha256", serverConfig.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqual(expected, signature);
}

function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  if (!serverConfig.razorpay.webhookConfigured) {
    return false;
  }
  const expected = createHmac("sha256", serverConfig.razorpay.webhookSecret)
    .update(rawBody)
    .digest("hex");
  return safeEqual(expected, signature);
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

async function assertRazorpayPaymentCaptured(
  orderId: string,
  paymentId: string,
  expectedAmountInPaise: number,
  enrollmentId: string,
): Promise<void> {
  const client = getClient();
  const [order, payment] = await Promise.all([
    client.orders.fetch(orderId),
    client.payments.fetch(paymentId),
  ]);

  if (payment.status !== "captured") {
    throw new EnrollmentError(402, "payment_incomplete", "Payment was not captured.");
  }
  if (payment.order_id !== orderId) {
    throw new EnrollmentError(400, "order_mismatch", "Payment does not belong to this order.");
  }
  if (Number(payment.amount) !== expectedAmountInPaise) {
    throw new EnrollmentError(400, "amount_mismatch", "Payment amount does not match enrollment.");
  }
  if (order.status !== "paid") {
    throw new EnrollmentError(402, "payment_incomplete", "Order is not paid.");
  }
  if (Number(order.amount) !== expectedAmountInPaise) {
    throw new EnrollmentError(400, "amount_mismatch", "Order amount does not match enrollment.");
  }

  const notes = order.notes as Record<string, string> | undefined;
  if (notes?.enrollmentId && notes.enrollmentId !== enrollmentId) {
    throw new EnrollmentError(400, "order_mismatch", "Order does not match this enrollment.");
  }
}

/**
 * Confirm a checkout payment on the server: signature check + Razorpay API verification + enrollment fulfillment.
 */
export async function confirmRazorpayCheckoutPayment(
  userId: string,
  enrollmentId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<{ alreadyPaid: boolean }> {
  if (!verifyRazorpayPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    throw new EnrollmentError(400, "invalid_signature", "Invalid payment signature.");
  }

  const enrollments = await enrollmentsCollection();
  const doc = await enrollments.findOne({
    _id: toDbId(enrollmentId),
    userId: toDbId(userId),
  });
  if (!doc) {
    throw new EnrollmentError(404, "not_found", "Enrollment not found");
  }

  const enrollment = mapEnrollment(doc);
  if (enrollment.status === "PAID") {
    return { alreadyPaid: true };
  }

  if (enrollment.razorpayOrderId && enrollment.razorpayOrderId !== razorpayOrderId) {
    throw new EnrollmentError(400, "order_mismatch", "Payment order does not match this enrollment.");
  }

  await assertRazorpayPaymentCaptured(
    razorpayOrderId,
    razorpayPaymentId,
    enrollment.amountInPaise,
    enrollment.id,
  );

  const result = await completeEnrollmentPayment(
    userId,
    enrollment.id,
    `rzp_${razorpayPaymentId}`,
  );

  revalidatePath("/dashboard");
  revalidatePath("/enroll");
  revalidatePath("/");

  return result;
}

async function fulfillEnrollmentByRazorpayOrder(
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<{ fulfilled: boolean }> {
  const enrollments = await enrollmentsCollection();
  const doc = await enrollments.findOne({ razorpayOrderId });
  if (!doc) {
    return { fulfilled: false };
  }

  const enrollment = mapEnrollment(doc);
  if (enrollment.status === "PAID") {
    return { fulfilled: true };
  }

  await assertRazorpayPaymentCaptured(
    razorpayOrderId,
    razorpayPaymentId,
    enrollment.amountInPaise,
    enrollment.id,
  );

  await completeEnrollmentPayment(
    enrollment.userId,
    enrollment.id,
    `rzp_${razorpayPaymentId}`,
  );

  revalidatePath("/dashboard");
  revalidatePath("/enroll");
  revalidatePath("/");

  return { fulfilled: true };
}

interface RazorpayWebhookEvent {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
  };
}

/**
 * Process Razorpay webhook events (authoritative server-side path).
 */
export async function processRazorpayWebhook(rawBody: string, signature: string): Promise<void> {
  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    throw new EnrollmentError(401, "invalid_webhook", "Invalid webhook signature.");
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    throw new EnrollmentError(400, "invalid_payload", "Invalid webhook payload.");
  }

  if (event.event !== "payment.captured") {
    return;
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;
  const paymentId = payment?.id;

  if (!orderId || !paymentId || payment.status !== "captured") {
    return;
  }

  await fulfillEnrollmentByRazorpayOrder(orderId, paymentId);
}

export async function getEnrollmentPaymentStatus(
  userId: string,
  enrollmentId: string,
): Promise<"PENDING" | "PAID"> {
  const enrollments = await enrollmentsCollection();
  const doc = await enrollments.findOne({
    _id: toDbId(enrollmentId),
    userId: toDbId(userId),
  });
  if (!doc) {
    throw new EnrollmentError(404, "not_found", "Enrollment not found");
  }
  const enrollment = mapEnrollment(doc);
  return enrollment.status === "PAID" ? "PAID" : "PENDING";
}

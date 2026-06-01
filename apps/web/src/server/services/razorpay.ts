import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { revalidatePath } from "next/cache";
import { serverConfig } from "@/lib/config";
import { rupeesToPaise } from "@/lib/money";
import { mapEnrollment, mapUser, toDbId } from "../db/helpers";
import {
  enrollmentsCollection,
  razorpayWebhookEventsCollection,
  usersCollection,
} from "../db/mongo-client";
import type { Enrollment, EnrollmentDocument } from "../db/types";
import {
  completeEnrollmentPayment,
  completeEnrollmentRefund,
  EnrollmentError,
} from "./enrollment";

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

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
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

function readOrderNotes(order: { notes?: unknown }): Record<string, string> | undefined {
  if (!order.notes || typeof order.notes !== "object") {
    return undefined;
  }
  return order.notes as Record<string, string>;
}

/** Strip internal `rzp_` prefix to get Razorpay payment id (`pay_…`). */
export function toRazorpayPaymentId(storedPaymentId: string): string {
  if (storedPaymentId.startsWith("rzp_")) {
    return storedPaymentId.slice(4);
  }
  if (storedPaymentId.startsWith("pay_")) {
    return storedPaymentId;
  }
  throw new EnrollmentError(400, "invalid_payment_id", "Enrollment has no Razorpay payment id.");
}

function storedPaymentId(razorpayPaymentId: string): string {
  return razorpayPaymentId.startsWith("pay_") ? `rzp_${razorpayPaymentId}` : razorpayPaymentId;
}

async function fetchRazorpayOrder(orderId: string) {
  const client = getClient();
  return client.orders.fetch(orderId);
}

/** Resolve enrollment for a Razorpay order (current id on doc, or notes.enrollmentId for stale orders). */
async function resolveEnrollmentForRazorpayOrder(
  razorpayOrderId: string,
): Promise<{ enrollment: Enrollment; doc: EnrollmentDocument } | null> {
  const enrollments = await enrollmentsCollection();
  let doc = await enrollments.findOne({ razorpayOrderId });
  if (doc) {
    return { enrollment: mapEnrollment(doc), doc };
  }

  const order = await fetchRazorpayOrder(razorpayOrderId);
  const notes = readOrderNotes(order);
  const enrollmentId = notes?.enrollmentId;
  if (!enrollmentId) {
    return null;
  }

  doc = await enrollments.findOne({ _id: toDbId(enrollmentId) });
  if (!doc) {
    return null;
  }
  return { enrollment: mapEnrollment(doc), doc };
}

async function assertOrderMatchesEnrollment(
  razorpayOrderId: string,
  enrollment: Enrollment,
): Promise<void> {
  if (enrollment.razorpayOrderId === razorpayOrderId) {
    return;
  }
  const order = await fetchRazorpayOrder(razorpayOrderId);
  const notes = readOrderNotes(order);
  if (notes?.enrollmentId !== enrollment.id) {
    throw new EnrollmentError(400, "order_mismatch", "Payment order does not match this enrollment.");
  }
}

async function assertRazorpayPaymentCaptured(
  orderId: string,
  paymentId: string,
  expectedAmountInPaise: number, // Razorpay API uses paise
  expectedCurrency: string,
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
  if (payment.currency && payment.currency !== expectedCurrency) {
    throw new EnrollmentError(400, "currency_mismatch", "Payment currency does not match enrollment.");
  }
  if (order.status !== "paid") {
    throw new EnrollmentError(402, "payment_incomplete", "Order is not paid.");
  }
  if (Number(order.amount) !== expectedAmountInPaise) {
    throw new EnrollmentError(400, "amount_mismatch", "Order amount does not match enrollment.");
  }
  if (order.currency && order.currency !== expectedCurrency) {
    throw new EnrollmentError(400, "currency_mismatch", "Order currency does not match enrollment.");
  }

  const notes = readOrderNotes(order);
  if (notes?.enrollmentId && notes.enrollmentId !== enrollmentId) {
    throw new EnrollmentError(400, "order_mismatch", "Order does not match this enrollment.");
  }
}

async function getOrCreateRazorpayOrder(
  enrollment: Enrollment,
  userId: string,
): Promise<{ id: string; amount: number | string; currency: string }> {
  const client = getClient();

  if (enrollment.razorpayOrderId) {
    try {
      const existing = await client.orders.fetch(enrollment.razorpayOrderId);
      const notes = readOrderNotes(existing);
      const sameEnrollment = notes?.enrollmentId === enrollment.id;
      const sameAmount = Number(existing.amount) === rupeesToPaise(enrollment.amountInRupees);
      const sameCurrency =
        !existing.currency || existing.currency === enrollment.currency;
      if (sameEnrollment && sameAmount && sameCurrency && existing.status !== "paid") {
        return existing;
      }
    } catch {
      // Fall through to create a new order.
    }
  }

  return client.orders.create({
    amount: rupeesToPaise(enrollment.amountInRupees),
    currency: enrollment.currency,
    receipt: enrollment.id.slice(0, 40),
    notes: { enrollmentId: enrollment.id, userId },
  });
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
  if (enrollment.status === "REFUNDED") {
    throw new EnrollmentError(409, "refunded", "Enrollment was refunded. Create a new enrollment.");
  }

  const order = await getOrCreateRazorpayOrder(enrollment, userId);

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
  if (enrollment.status === "REFUNDED") {
    throw new EnrollmentError(409, "refunded", "Enrollment was refunded.");
  }

  await assertOrderMatchesEnrollment(razorpayOrderId, enrollment);

  await assertRazorpayPaymentCaptured(
    razorpayOrderId,
    razorpayPaymentId,
    rupeesToPaise(enrollment.amountInRupees),
    enrollment.currency,
    enrollment.id,
  );

  const result = await completeEnrollmentPayment(
    userId,
    enrollment.id,
    storedPaymentId(razorpayPaymentId),
  );

  await enrollments.updateOne(
    { _id: toDbId(enrollment.id) },
    { $set: { razorpayOrderId } },
  );

  revalidatePaymentPaths();
  return result;
}

type FulfillResult = { fulfilled: boolean; reason?: "not_found" | "already_paid" | "refunded" };

async function fulfillEnrollmentByRazorpayOrder(
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<FulfillResult> {
  const resolved = await resolveEnrollmentForRazorpayOrder(razorpayOrderId);
  if (!resolved) {
    return { fulfilled: false, reason: "not_found" };
  }

  const { enrollment } = resolved;
  if (enrollment.status === "PAID") {
    return { fulfilled: true, reason: "already_paid" };
  }
  if (enrollment.status === "REFUNDED") {
    return { fulfilled: false, reason: "refunded" };
  }

  await assertRazorpayPaymentCaptured(
    razorpayOrderId,
    razorpayPaymentId,
    rupeesToPaise(enrollment.amountInRupees),
    enrollment.currency,
    enrollment.id,
  );

  await completeEnrollmentPayment(
    enrollment.userId,
    enrollment.id,
    storedPaymentId(razorpayPaymentId),
  );

  const enrollments = await enrollmentsCollection();
  await enrollments.updateOne(
    { _id: toDbId(enrollment.id) },
    { $set: { razorpayOrderId } },
  );

  revalidatePaymentPaths();
  return { fulfilled: true };
}

function isWithinRefundWindow(paidAt: Date): boolean {
  const windowMs = serverConfig.referral.refundWindowDays * 24 * 60 * 60 * 1000;
  return Date.now() - paidAt.getTime() <= windowMs;
}

async function findEnrollmentByRazorpayPaymentId(
  razorpayPaymentId: string,
): Promise<Enrollment | null> {
  const enrollments = await enrollmentsCollection();
  const stored = storedPaymentId(razorpayPaymentId);
  const doc =
    (await enrollments.findOne({ paymentId: stored })) ??
    (await enrollments.findOne({ paymentId: razorpayPaymentId }));
  return doc ? mapEnrollment(doc) : null;
}

/**
 * Initiate a full refund via Razorpay. User must be within the refund window unless `skipWindowCheck`.
 */
export async function refundEnrollmentPayment(
  userId: string,
  enrollmentId: string,
  options?: { skipWindowCheck?: boolean },
): Promise<{ alreadyRefunded: boolean; refundId: string }> {
  const enrollments = await enrollmentsCollection();
  const doc = await enrollments.findOne({
    _id: toDbId(enrollmentId),
    userId: toDbId(userId),
  });
  if (!doc) {
    throw new EnrollmentError(404, "not_found", "Enrollment not found");
  }

  const enrollment = mapEnrollment(doc);
  if (enrollment.status === "REFUNDED") {
    return {
      alreadyRefunded: true,
      refundId: enrollment.razorpayRefundId ?? "",
    };
  }
  if (enrollment.status !== "PAID") {
    throw new EnrollmentError(400, "not_refundable", "Only paid enrollments can be refunded.");
  }
  if (!enrollment.paymentId) {
    throw new EnrollmentError(400, "not_refundable", "No payment recorded for this enrollment.");
  }
  if (!options?.skipWindowCheck) {
    if (!enrollment.paidAt || !isWithinRefundWindow(enrollment.paidAt)) {
      throw new EnrollmentError(
        400,
        "refund_window_closed",
        `Refunds are only available within ${serverConfig.referral.refundWindowDays} days of payment.`,
      );
    }
  }

  const razorpayPaymentId = toRazorpayPaymentId(enrollment.paymentId);
  const client = getClient();
  const refund = await client.payments.refund(razorpayPaymentId, {
    amount: rupeesToPaise(enrollment.amountInRupees),
    notes: { enrollmentId: enrollment.id, userId },
    speed: "normal",
  });

  const refundId = refund.id;
  if (refund.status === "processed") {
    await completeEnrollmentRefund(enrollment.id, refundId);
    revalidatePaymentPaths();
    return { alreadyRefunded: false, refundId };
  }

  await enrollments.updateOne(
    { _id: toDbId(enrollment.id) },
    { $set: { razorpayRefundId: refundId } },
  );

  return { alreadyRefunded: false, refundId };
}

/** Admin refund — no refund-window restriction. */
export async function adminRefundEnrollmentPayment(
  enrollmentId: string,
): Promise<{ alreadyRefunded: boolean; refundId: string }> {
  const enrollments = await enrollmentsCollection();
  const doc = await enrollments.findOne({ _id: toDbId(enrollmentId) });
  if (!doc) {
    throw new EnrollmentError(404, "not_found", "Enrollment not found");
  }
  const enrollment = mapEnrollment(doc);
  return refundEnrollmentPayment(enrollment.userId, enrollment.id, { skipWindowCheck: true });
}

async function fulfillRefundFromWebhook(
  razorpayPaymentId: string,
  razorpayRefundId: string,
  refundStatus: string | undefined,
): Promise<FulfillResult> {
  if (refundStatus !== "processed") {
    return { fulfilled: false };
  }

  const enrollment = await findEnrollmentByRazorpayPaymentId(razorpayPaymentId);
  if (!enrollment) {
    return { fulfilled: false, reason: "not_found" };
  }
  if (enrollment.status === "REFUNDED") {
    return { fulfilled: true, reason: "already_paid" };
  }

  await completeEnrollmentRefund(enrollment.id, razorpayRefundId);
  revalidatePaymentPaths();
  return { fulfilled: true };
}

interface RazorpayWebhookEvent {
  id?: string;
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
    refund?: {
      entity?: {
        id?: string;
        payment_id?: string;
        status?: string;
      };
    };
  };
}

async function claimWebhookEvent(eventId: string, eventType: string): Promise<boolean> {
  const events = await razorpayWebhookEventsCollection();
  try {
    await events.insertOne({
      _id: eventId,
      event: eventType,
      receivedAt: new Date(),
    });
    return true;
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 11000) {
      return false;
    }
    throw err;
  }
}

function revalidatePaymentPaths(): void {
  revalidatePath("/dashboard");
  revalidatePath("/enroll");
  revalidatePath("/");
}

export type WebhookProcessResult = {
  handled: boolean;
  duplicate?: boolean;
};

/**
 * Process Razorpay webhook events (authoritative server-side path).
 */
export async function processRazorpayWebhook(
  rawBody: string,
  signature: string,
): Promise<WebhookProcessResult> {
  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    throw new EnrollmentError(401, "invalid_webhook", "Invalid webhook signature.");
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    throw new EnrollmentError(400, "invalid_payload", "Invalid webhook payload.");
  }

  const eventId = event.id;
  if (!eventId) {
    throw new EnrollmentError(400, "invalid_payload", "Webhook event id is missing.");
  }

  const isNew = await claimWebhookEvent(eventId, event.event);
  if (!isNew) {
    return { handled: true, duplicate: true };
  }

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;
      if (!orderId || !paymentId || payment.status !== "captured") {
        return { handled: false };
      }
      const result = await fulfillEnrollmentByRazorpayOrder(orderId, paymentId);
      if (!result.fulfilled && result.reason === "not_found") {
        throw new EnrollmentError(
          422,
          "fulfillment_failed",
          "Captured payment could not be matched to an enrollment.",
        );
      }
      return { handled: result.fulfilled };
    }
    case "payment.failed": {
      console.warn("[razorpay webhook] payment.failed", {
        paymentId: event.payload?.payment?.entity?.id,
        orderId: event.payload?.payment?.entity?.order_id,
      });
      return { handled: true };
    }
    case "refund.created": {
      return { handled: true };
    }
    case "refund.processed": {
      const refund = event.payload?.refund?.entity;
      const paymentId = refund?.payment_id;
      const refundId = refund?.id;
      if (!paymentId || !refundId) {
        return { handled: false };
      }
      const result = await fulfillRefundFromWebhook(paymentId, refundId, refund.status);
      if (!result.fulfilled && result.reason === "not_found") {
        throw new EnrollmentError(
          422,
          "refund_fulfillment_failed",
          "Refund could not be matched to an enrollment.",
        );
      }
      return { handled: result.fulfilled };
    }
    default:
      return { handled: false };
  }
}

export type EnrollmentPaymentStatus = "PENDING" | "PAID" | "REFUNDED";

export async function getEnrollmentPaymentStatus(
  userId: string,
  enrollmentId: string,
): Promise<EnrollmentPaymentStatus> {
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
    return "PAID";
  }
  if (enrollment.status === "REFUNDED") {
    return "REFUNDED";
  }
  return "PENDING";
}

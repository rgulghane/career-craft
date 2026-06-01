import "server-only";

import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import { isValidReferralCodeFormat, normalizeReferralCode, PROGRAM } from "@career-craft/shared";
import "../db/load-env";
import { mapEnrollment, mapUser, toDbId } from "../db/helpers";
import {
  enrollmentsCollection,
  mongoClient,
  referralsCollection,
  usersCollection,
} from "../db/mongo-client";
import { serverConfig } from "@/lib/config";
import { generateReferralCode } from "../util/referral-code";
import { EnrollmentError } from "../errors";

export { EnrollmentError };

const REFERRAL_CODE_GENERATION_ATTEMPTS = 5;

export interface CreatedEnrollment {
  id: string;
  amountInRupees: number;
  currency: string;
  status: string;
}

export async function createEnrollment(
  userId: string,
  rawReferralCode: string | undefined,
): Promise<CreatedEnrollment> {
  const users = await usersCollection();
  const userDoc = await users.findOne({ _id: toDbId(userId) });
  if (!userDoc) {
    throw new EnrollmentError(401, "unauthorized", "Unauthorized");
  }
  const user = mapUser(userDoc);

  const normalizedCode = rawReferralCode ? normalizeReferralCode(rawReferralCode) || undefined : undefined;

  if (normalizedCode && !isValidReferralCodeFormat(normalizedCode)) {
    throw new EnrollmentError(400, "invalid_referral", "Referral code must be 6 characters");
  }

  let referrerId: string | undefined;
  let amountInRupees = serverConfig.pricing.standardInRupees;

  if (normalizedCode) {
    const referrerDoc = await users.findOne({ referralCode: normalizedCode });
    if (referrerDoc) {
      const referrer = mapUser(referrerDoc);
      if (referrer.id !== user.id) {
        referrerId = referrer.id;
        amountInRupees = serverConfig.pricing.withReferralInRupees;
      }
    }
  }

  const enrollments = await enrollmentsCollection();

  const paidDoc = await enrollments.findOne({
    userId: toDbId(user.id),
    status: "PAID",
  });
  if (paidDoc) {
    throw new EnrollmentError(409, "already_enrolled", "You are already enrolled.");
  }

  const pendingDoc = await enrollments.findOne(
    { userId: toDbId(user.id), status: "PENDING" },
    { sort: { createdAt: -1 } },
  );

  const now = new Date();
  const enrollmentFields = {
    amountInRupees,
    currency: PROGRAM.defaultCurrency,
    status: "PENDING" as const,
    referralCodeUsed: normalizedCode ?? null,
    referrerId: referrerId ? toDbId(referrerId) : null,
    createdAt: now,
  };

  let enrollment;

  if (pendingDoc) {
    const pendingId = pendingDoc._id;
    await enrollments.updateOne(
      { _id: pendingId },
      {
        $set: enrollmentFields,
        $unset: {
          razorpayOrderId: "",
          paymentId: "",
          paidAt: "",
          razorpayRefundId: "",
          refundedAt: "",
        },
      },
    );
    await enrollments.deleteMany({
      userId: toDbId(user.id),
      status: "PENDING",
      _id: { $ne: pendingId },
    });
    const updated = await enrollments.findOne({ _id: pendingId });
    if (!updated) {
      throw new EnrollmentError(500, "update_failed", "Could not update enrollment.");
    }
    enrollment = mapEnrollment(updated);
  } else {
    const doc = {
      _id: new ObjectId(),
      userId: toDbId(user.id),
      ...enrollmentFields,
    };
    await enrollments.insertOne(doc);
    enrollment = mapEnrollment(doc);
  }

  return {
    id: enrollment.id,
    amountInRupees: enrollment.amountInRupees,
    currency: enrollment.currency,
    status: enrollment.status,
  };
}

/**
 * Mark enrollment paid after PSP confirmation. Idempotent via paymentId uniqueness.
 */
export async function completeEnrollmentPayment(
  userId: string,
  enrollmentId: string,
  paymentId: string,
): Promise<{ alreadyPaid: boolean }> {
  const enrollments = await enrollmentsCollection();
  const enrollmentDoc = await enrollments.findOne({
    _id: toDbId(enrollmentId),
    userId: toDbId(userId),
  });
  if (!enrollmentDoc) {
    throw new EnrollmentError(404, "not_found", "Enrollment not found");
  }
  const enrollment = mapEnrollment(enrollmentDoc);
  if (enrollment.status === "PAID") {
    return { alreadyPaid: true };
  }

  const paidAt = new Date();
  const client = await mongoClient();
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await enrollments.updateOne(
        { _id: toDbId(enrollment.id) },
        { $set: { status: "PAID", paymentId, paidAt } },
        { session },
      );

      const users = await usersCollection();
      const studentDoc = await users.findOne({ _id: toDbId(enrollment.userId) }, { session });
      if (!studentDoc) {
        throw new EnrollmentError(500, "user_missing", "User missing");
      }
      const student = mapUser(studentDoc);

      if (!student.referralCode) {
        let code = generateReferralCode();
        for (let attempt = 0; attempt < REFERRAL_CODE_GENERATION_ATTEMPTS; attempt += 1) {
          const clash = await users.findOne({ referralCode: code }, { session });
          if (!clash) {
            break;
          }
          code = generateReferralCode();
        }
        await users.updateOne(
          { _id: toDbId(student.id) },
          { $set: { referralCode: code, updatedAt: new Date() } },
          { session },
        );
      }

      if (enrollment.referrerId && enrollment.referrerId !== enrollment.userId) {
        const referrals = await referralsCollection();
        const existing = await referrals.findOne(
          { enrollmentId: toDbId(enrollment.id) },
          { session },
        );
        if (!existing) {
          await referrals.insertOne(
            {
              _id: new ObjectId(),
              referrerId: toDbId(enrollment.referrerId),
              refereeId: toDbId(enrollment.userId),
              enrollmentId: toDbId(enrollment.id),
              status: "IN_REFUND_WINDOW",
              createdAt: new Date(),
            },
            { session },
          );
        }
      }
    });
  } finally {
    await session.endSession();
  }

  return { alreadyPaid: false };
}

/**
 * Mark enrollment refunded after Razorpay refund confirmation. Idempotent.
 * Voids referrals still in the refund window for this enrollment.
 */
export async function completeEnrollmentRefund(
  enrollmentId: string,
  razorpayRefundId: string,
): Promise<{ alreadyRefunded: boolean }> {
  const enrollments = await enrollmentsCollection();
  const enrollmentDoc = await enrollments.findOne({ _id: toDbId(enrollmentId) });
  if (!enrollmentDoc) {
    throw new EnrollmentError(404, "not_found", "Enrollment not found");
  }
  const enrollment = mapEnrollment(enrollmentDoc);
  if (enrollment.status === "REFUNDED") {
    return { alreadyRefunded: true };
  }
  if (enrollment.status !== "PAID") {
    throw new EnrollmentError(400, "not_refundable", "Only paid enrollments can be refunded.");
  }

  const refundedAt = new Date();
  const client = await mongoClient();
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await enrollments.updateOne(
        { _id: toDbId(enrollment.id) },
        { $set: { status: "REFUNDED", razorpayRefundId, refundedAt } },
        { session },
      );

      const referrals = await referralsCollection();
      await referrals.updateMany(
        { enrollmentId: toDbId(enrollment.id), status: "IN_REFUND_WINDOW" },
        {
          $set: {
            status: "VOIDED",
            voidReason: "Enrollment refunded",
            qualifiedAt: null,
          },
        },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return { alreadyRefunded: false };
}

/** Dev-only mock payment — use Razorpay in production. */
export async function mockPayEnrollment(userId: string, enrollmentId: string): Promise<{ alreadyPaid: boolean }> {
  if (process.env.NODE_ENV === "production") {
    throw new EnrollmentError(403, "forbidden", "Mock payments are disabled in production.");
  }
  return completeEnrollmentPayment(userId, enrollmentId, `mock_${randomUUID()}`);
}

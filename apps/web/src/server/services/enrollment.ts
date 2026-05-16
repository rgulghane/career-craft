import "server-only";

import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import { PROGRAM } from "@career-craft/shared";
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

export class EnrollmentError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "EnrollmentError";
  }
}

const REFERRAL_CODE_GENERATION_ATTEMPTS = 5;

export interface CreatedEnrollment {
  id: string;
  amountInPaise: number;
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

  const trimmed = rawReferralCode?.trim();
  const normalizedCode = trimmed && trimmed !== "" ? trimmed.toUpperCase() : undefined;

  let referrerId: string | undefined;
  let amountInPaise = serverConfig.pricing.standardInPaise;

  if (normalizedCode) {
    const referrerDoc = await users.findOne({ referralCode: normalizedCode });
    if (referrerDoc) {
      const referrer = mapUser(referrerDoc);
      if (referrer.id !== user.id) {
        referrerId = referrer.id;
        amountInPaise = serverConfig.pricing.withReferralInPaise;
      }
    }
  }

  const enrollments = await enrollmentsCollection();
  const doc = {
    _id: new ObjectId(),
    userId: toDbId(user.id),
    amountInPaise,
    currency: PROGRAM.defaultCurrency,
    status: "PENDING",
    referralCodeUsed: normalizedCode ?? null,
    referrerId: referrerId ? toDbId(referrerId) : null,
    createdAt: new Date(),
  };
  await enrollments.insertOne(doc);
  const enrollment = mapEnrollment(doc);

  return {
    id: enrollment.id,
    amountInPaise: enrollment.amountInPaise,
    currency: enrollment.currency,
    status: enrollment.status,
  };
}

/**
 * Mock payment completion — replace with your PSP webhook handler.
 * Idempotent via paymentId uniqueness on enrollment.
 */
export async function mockPayEnrollment(userId: string, enrollmentId: string): Promise<{ alreadyPaid: boolean }> {
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

  const paymentId = `mock_${randomUUID()}`;
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

import "server-only";

import { randomUUID } from "node:crypto";
import { type ClientSession, ObjectId } from "mongodb";
import { PORTAL_ADMIN_TYPES, PROGRAM } from "@career-craft/shared";
import "../../db/load-env";
import { toDbId, toIdString } from "../../db/helpers";
import { enrollmentsCollection, mongoClient, usersCollection } from "../../db/mongo-client";
import { generateReferralCode } from "../../util/referral-code";
import { AdminServiceError } from "./errors";

const REFERRAL_CODE_GENERATION_ATTEMPTS = 6;

export interface DirectEnrollmentResult {
  userId: string;
  enrollmentId: string;
  status: "PAID";
  referralCode: string;
  /** True when the student was already enrolled before this call. */
  alreadyEnrolled: boolean;
}

type Users = Awaited<ReturnType<typeof usersCollection>>;

/** Assign a unique referral code if the user doesn't already have one. */
async function ensureReferralCode(
  users: Users,
  userId: string,
  existing: string | null,
  session?: ClientSession,
): Promise<string> {
  if (existing) {
    return existing;
  }
  const opts = session ? { session } : undefined;
  let code = generateReferralCode();
  for (let attempt = 0; attempt < REFERRAL_CODE_GENERATION_ATTEMPTS; attempt += 1) {
    const clash = await users.findOne({ referralCode: code }, opts);
    if (!clash) {
      break;
    }
    code = generateReferralCode();
  }
  await users.updateOne(
    { _id: toDbId(userId) },
    { $set: { referralCode: code, updatedAt: new Date() } },
    opts,
  );
  return code;
}

/**
 * Enroll a student directly without collecting payment.
 *
 * Marks an enrollment as PAID (tagged as a direct/comped enrollment), records the
 * acting admin, and issues the student's referral code if they don't have one.
 * Idempotent: if the student is already enrolled it only ensures a referral code.
 */
export async function grantDirectEnrollment(
  userId: string,
  adminId: string,
  reason?: string,
): Promise<DirectEnrollmentResult> {
  const users = await usersCollection();
  const userDoc = await users.findOne({ _id: toDbId(userId) });
  if (!userDoc) {
    throw new AdminServiceError(404, "User not found");
  }

  const userType = userDoc.userType ?? "student";
  if ((PORTAL_ADMIN_TYPES as readonly string[]).includes(userType)) {
    throw new AdminServiceError(400, "Portal admin accounts cannot be enrolled.");
  }

  const enrollments = await enrollmentsCollection();

  const paid = await enrollments.findOne({ userId: toDbId(userId), status: "PAID" });
  if (paid) {
    const referralCode = await ensureReferralCode(users, userId, userDoc.referralCode ?? null);
    return {
      userId,
      enrollmentId: toIdString(paid._id),
      status: "PAID",
      referralCode,
      alreadyEnrolled: true,
    };
  }

  const pending = await enrollments.findOne(
    { userId: toDbId(userId), status: "PENDING" },
    { sort: { createdAt: -1 } },
  );
  const targetId = pending ? pending._id : new ObjectId();

  const now = new Date();
  const paymentId = `direct_${randomUUID()}`;
  const directFields = {
    status: "PAID" as const,
    amountInRupees: 0,
    paymentId,
    paidAt: now,
    directEnrollment: true,
    directEnrollmentReason: reason?.trim() ? reason.trim() : null,
    directEnrolledByAdminId: toDbId(adminId),
    directEnrolledAt: now,
  };

  const client = await mongoClient();
  const session = client.startSession();
  let referralCode = userDoc.referralCode ?? null;

  try {
    await session.withTransaction(async () => {
      if (pending) {
        await enrollments.updateOne(
          { _id: targetId },
          {
            $set: directFields,
            $unset: {
              razorpayOrderId: "",
              razorpayRefundId: "",
              refundedAt: "",
            },
          },
          { session },
        );
        await enrollments.deleteMany(
          { userId: toDbId(userId), status: "PENDING", _id: { $ne: targetId } },
          { session },
        );
      } else {
        await enrollments.insertOne(
          {
            _id: targetId,
            userId: toDbId(userId),
            currency: PROGRAM.defaultCurrency,
            referralCodeUsed: null,
            referrerId: null,
            createdAt: now,
            ...directFields,
          },
          { session },
        );
      }

      referralCode = await ensureReferralCode(users, userId, referralCode, session);
    });
  } finally {
    await session.endSession();
  }

  return {
    userId,
    enrollmentId: toIdString(targetId),
    status: "PAID",
    referralCode: referralCode ?? "",
    alreadyEnrolled: false,
  };
}

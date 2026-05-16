import "server-only";

import { randomUUID } from "node:crypto";
import { PROGRAM } from "@career-craft/shared";
import { prisma } from "../prisma";
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
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new EnrollmentError(401, "unauthorized", "Unauthorized");
  }

  const trimmed = rawReferralCode?.trim();
  const normalizedCode = trimmed && trimmed !== "" ? trimmed.toUpperCase() : undefined;

  let referrerId: string | undefined;
  let amountInPaise = serverConfig.pricing.standardInPaise;

  if (normalizedCode) {
    const referrer = await prisma.user.findFirst({
      where: { referralCode: normalizedCode },
    });
    if (referrer && referrer.id !== user.id) {
      referrerId = referrer.id;
      amountInPaise = serverConfig.pricing.withReferralInPaise;
    }
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: user.id,
      amountInPaise,
      currency: PROGRAM.defaultCurrency,
      status: "PENDING",
      referralCodeUsed: normalizedCode ?? null,
      referrerId: referrerId ?? null,
    },
  });

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
  const enrollment = await prisma.enrollment.findFirst({
    where: { id: enrollmentId, userId },
  });
  if (!enrollment) {
    throw new EnrollmentError(404, "not_found", "Enrollment not found");
  }
  if (enrollment.status === "PAID") {
    return { alreadyPaid: true };
  }

  const paymentId = `mock_${randomUUID()}`;

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "PAID", paidAt: new Date(), paymentId },
    });

    const student = await tx.user.findUnique({ where: { id: enrollment.userId } });
    if (!student) {
      throw new EnrollmentError(500, "user_missing", "User missing");
    }

    if (!student.referralCode) {
      let code = generateReferralCode();
      for (let attempt = 0; attempt < REFERRAL_CODE_GENERATION_ATTEMPTS; attempt += 1) {
        const clash = await tx.user.findUnique({ where: { referralCode: code } });
        if (!clash) {
          break;
        }
        code = generateReferralCode();
      }
      await tx.user.update({
        where: { id: student.id },
        data: { referralCode: code },
      });
    }

    if (enrollment.referrerId && enrollment.referrerId !== enrollment.userId) {
      const existing = await tx.referral.findUnique({
        where: { enrollmentId: enrollment.id },
      });
      if (!existing) {
        await tx.referral.create({
          data: {
            referrerId: enrollment.referrerId,
            refereeId: enrollment.userId,
            enrollmentId: enrollment.id,
            status: "IN_REFUND_WINDOW",
          },
        });
      }
    }
  });

  return { alreadyPaid: false };
}

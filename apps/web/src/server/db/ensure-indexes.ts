import type { CreateIndexesOptions, IndexSpecification } from "mongodb";
import { mongoClient } from "./mongo-client";
import { COLLECTIONS } from "./types";

async function safeCreateIndex(
  collectionName: string,
  keys: IndexSpecification,
  options: CreateIndexesOptions = {},
): Promise<void> {
  const db = (await mongoClient()).db();
  try {
    await db.collection(collectionName).createIndex(keys, options);
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 85 || code === 86 || code === 68) {
      return;
    }
    throw err;
  }
}

export async function ensureIndexes(): Promise<void> {
  await safeCreateIndex(COLLECTIONS.users, { email: 1 }, { unique: true, name: "User_email_key" });
  await safeCreateIndex(
    COLLECTIONS.users,
    { referralCode: 1 },
    { unique: true, sparse: true, name: "User_referralCode_key" },
  );

  await safeCreateIndex(
    COLLECTIONS.enrollments,
    { userId: 1, status: 1, paidAt: -1 },
    { name: "Enrollment_userId_status_paidAt" },
  );
  await safeCreateIndex(
    COLLECTIONS.enrollments,
    { paymentId: 1 },
    { unique: true, sparse: true, name: "Enrollment_paymentId_key" },
  );

  await safeCreateIndex(
    COLLECTIONS.referrals,
    { referrerId: 1, createdAt: -1 },
    { name: "Referral_referrerId_createdAt" },
  );
  await safeCreateIndex(
    COLLECTIONS.referrals,
    { enrollmentId: 1 },
    { unique: true, name: "Referral_enrollmentId_key" },
  );
  await safeCreateIndex(COLLECTIONS.referrals, { status: 1 }, { name: "Referral_status" });
}

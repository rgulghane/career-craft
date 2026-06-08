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

async function ensureReferralCodeIndex(): Promise<void> {
  const db = (await mongoClient()).db();
  const users = db.collection(COLLECTIONS.users);

  // Legacy unique index allowed only one document with referralCode: null — migrate to partial unique.
  await users.updateMany({ referralCode: null }, { $unset: { referralCode: "" } });

  const indexes = await users.indexes();
  const existing = indexes.find((i) => i.name === "User_referralCode_key");
  const hasPartial =
    existing?.partialFilterExpression !== undefined && existing.partialFilterExpression !== null;

  if (existing && !hasPartial) {
    await users.dropIndex("User_referralCode_key");
  }

  await safeCreateIndex(
    COLLECTIONS.users,
    { referralCode: 1 },
    {
      unique: true,
      name: "User_referralCode_key",
      partialFilterExpression: { referralCode: { $type: "string" } },
    },
  );
}

export async function ensureIndexes(): Promise<void> {
  await safeCreateIndex(COLLECTIONS.users, { email: 1 }, { unique: true, name: "User_email_key" });
  await ensureReferralCodeIndex();

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
    COLLECTIONS.enrollments,
    { razorpayOrderId: 1 },
    { unique: true, sparse: true, name: "Enrollment_razorpayOrderId_key" },
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

  await safeCreateIndex(
    COLLECTIONS.razorpayWebhookEvents,
    { receivedAt: 1 },
    { name: "RazorpayWebhookEvent_receivedAt" },
  );

  await safeCreateIndex(
    COLLECTIONS.mentors,
    { order: 1, createdAt: 1 },
    { name: "Mentor_order_createdAt" },
  );
  await safeCreateIndex(
    COLLECTIONS.mentors,
    { isPublished: 1, order: 1 },
    { name: "Mentor_isPublished_order" },
  );

  await safeCreateIndex(
    COLLECTIONS.companyLogos,
    { company: 1 },
    {
      unique: true,
      name: "CompanyLogo_company_key",
      collation: { locale: "en", strength: 2 },
    },
  );
}

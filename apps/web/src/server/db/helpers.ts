import { ObjectId } from "mongodb";
import type { DbId } from "./types";
import type {
  Enrollment,
  EnrollmentDocument,
  Referral,
  ReferralDocument,
  User,
  UserDocument,
} from "./types";

/** True for 24-char hex MongoDB ObjectId strings. */
export function isObjectIdHex(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

/** Coerce an app id string to the value stored in MongoDB (_id / FK). */
export function toDbId(id: string): DbId {
  if (isObjectIdHex(id)) {
    return new ObjectId(id);
  }
  return id;
}

export function toIdString(id: DbId): string {
  return typeof id === "string" ? id : id.toHexString();
}

export function mapUser(doc: UserDocument): User {
  return {
    id: toIdString(doc._id),
    email: doc.email,
    passwordHash: doc.passwordHash ?? "",
    fullName: doc.fullName,
    phone: doc.phone ?? null,
    collegeName: doc.collegeName ?? null,
    referralCode: doc.referralCode ?? null,
    userType: doc.userType ?? "student",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function resolveAmountInRupees(doc: EnrollmentDocument): number {
  if (doc.amountInRupees != null) {
    return doc.amountInRupees;
  }
  if (doc.amountInPaise != null) {
    return doc.amountInPaise / 100;
  }
  return 0;
}

export function mapEnrollment(doc: EnrollmentDocument): Enrollment {
  return {
    id: toIdString(doc._id),
    userId: toIdString(doc.userId),
    amountInRupees: resolveAmountInRupees(doc),
    currency: doc.currency,
    status: doc.status,
    referralCodeUsed: doc.referralCodeUsed ?? null,
    referrerId: doc.referrerId ? toIdString(doc.referrerId) : null,
    paymentId: doc.paymentId ?? null,
    razorpayOrderId: doc.razorpayOrderId ?? null,
    razorpayRefundId: doc.razorpayRefundId ?? null,
    paidAt: doc.paidAt ?? null,
    refundedAt: doc.refundedAt ?? null,
    createdAt: doc.createdAt,
  };
}

export function mapReferral(doc: ReferralDocument): Referral {
  return {
    id: toIdString(doc._id),
    referrerId: toIdString(doc.referrerId),
    refereeId: toIdString(doc.refereeId),
    enrollmentId: toIdString(doc.enrollmentId),
    status: doc.status,
    qualifiedAt: doc.qualifiedAt ?? null,
    voidReason: doc.voidReason ?? null,
    createdAt: doc.createdAt,
  };
}

import { ObjectId } from "mongodb";
import type { DbId } from "./types";
import type {
  CompanyLogo,
  CompanyLogoDocument,
  Enrollment,
  EnrollmentDocument,
  Mentor,
  MentorContent,
  MentorDocument,
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
    directEnrollment: doc.directEnrollment ?? false,
    directEnrollmentReason: doc.directEnrollmentReason ?? null,
    directEnrolledByAdminId: doc.directEnrolledByAdminId
      ? toIdString(doc.directEnrolledByAdminId)
      : null,
    directEnrolledAt: doc.directEnrolledAt ?? null,
    createdAt: doc.createdAt,
  };
}

/**
 * Coerce a stored "previously at" value into a clean string array. Legacy
 * documents stored a single comma-separated string; newer ones store an array.
 */
export function previouslyAtToArray(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const cleaned: string[] = [];
  for (const entry of raw) {
    const trimmed = String(entry).trim();
    if (trimmed && !cleaned.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      cleaned.push(trimmed);
    }
  }
  return cleaned;
}

/** Normalise raw mentor content (handles legacy field shapes). */
function normalizeMentorContent(content: MentorContent): MentorContent {
  return {
    ...content,
    previouslyAt: previouslyAtToArray((content as { previouslyAt?: unknown }).previouslyAt),
  };
}

function stringArraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function contentEquals(a: MentorContent | null, b: MentorContent | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return (
    a.name === b.name &&
    a.designation === b.designation &&
    a.company === b.company &&
    stringArraysEqual(a.previouslyAt, b.previouslyAt) &&
    a.linkedInUrl === b.linkedInUrl &&
    a.photo === b.photo
  );
}

export function mapMentor(doc: MentorDocument): Mentor {
  const draft = normalizeMentorContent(doc.draft);
  const live = doc.live ? normalizeMentorContent(doc.live) : null;
  return {
    id: toIdString(doc._id),
    order: doc.order ?? 0,
    draft,
    live,
    isPublished: doc.isPublished ?? false,
    hasUnpublishedChanges: !contentEquals(draft, live),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    publishedAt: doc.publishedAt ?? null,
  };
}

export function mapCompanyLogo(doc: CompanyLogoDocument): CompanyLogo {
  return {
    id: toIdString(doc._id),
    company: doc.company,
    logoUrl: doc.logoUrl,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
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

import type { ObjectId } from "mongodb";
import type { UserType } from "@career-craft/shared";

/** MongoDB _id / FK — ObjectId or legacy string id. */
export type DbId = ObjectId | string;

export type { UserType };

/** MongoDB collection names (PascalCase, matches existing Atlas data). */
export const COLLECTIONS = {
  users: "User",
  enrollments: "Enrollment",
  referrals: "Referral",
  razorpayWebhookEvents: "RazorpayWebhookEvent",
  mentors: "Mentor",
} as const;

export type EnrollmentStatus = "PENDING" | "PAID" | "REFUNDED";

export interface UserDocument {
  _id: DbId;
  email: string;
  /** Omitted for Google-only accounts. */
  passwordHash?: string;
  fullName: string;
  phone?: string | null;
  collegeName?: string | null;
  googleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  referralCode?: string | null;
  userType?: UserType | null;
}

export interface EnrollmentDocument {
  _id: DbId;
  userId: DbId;
  amountInRupees?: number;
  /** @deprecated Legacy documents stored amounts in paise. */
  amountInPaise?: number;
  currency: string;
  status: string;
  referralCodeUsed?: string | null;
  referrerId?: DbId | null;
  paymentId?: string | null;
  razorpayOrderId?: string | null;
  razorpayRefundId?: string | null;
  paidAt?: Date | null;
  refundedAt?: Date | null;
  /** Set when an admin enrolled the student without collecting payment. */
  directEnrollment?: boolean;
  directEnrollmentReason?: string | null;
  directEnrolledByAdminId?: DbId | null;
  directEnrolledAt?: Date | null;
  createdAt: Date;
}

export interface RazorpayWebhookEventDocument {
  _id: string;
  event: string;
  receivedAt: Date;
}

export interface ReferralDocument {
  _id: DbId;
  referrerId: DbId;
  refereeId: DbId;
  enrollmentId: DbId;
  status: string;
  qualifiedAt?: Date | null;
  voidReason?: string | null;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string | null;
  collegeName: string | null;
  referralCode: string | null;
  userType: UserType | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  amountInRupees: number;
  currency: string;
  status: string;
  referralCodeUsed: string | null;
  referrerId: string | null;
  paymentId: string | null;
  razorpayOrderId: string | null;
  razorpayRefundId: string | null;
  paidAt: Date | null;
  refundedAt: Date | null;
  directEnrollment: boolean;
  directEnrollmentReason: string | null;
  directEnrolledByAdminId: string | null;
  directEnrolledAt: Date | null;
  createdAt: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  enrollmentId: string;
  status: string;
  qualifiedAt: Date | null;
  voidReason: string | null;
  createdAt: Date;
}

export interface ReferralWithEnrollment extends Referral {
  enrollment: Enrollment;
}

export interface ReferralWithReferee extends Referral {
  referee: Pick<User, "email">;
}

/** Content fields rendered on a public mentor spotlight card. */
export interface MentorContent {
  name: string;
  designation: string;
  company: string;
  previouslyAt: string;
  linkedInUrl: string;
  photo: string;
}

/**
 * A mentor stored in its own collection. Editing updates `draft`; clicking
 * "Live the changes" copies `draft` into `live`. The public landing page only
 * ever reads `live` content for mentors where `isPublished` is true.
 */
export interface MentorDocument {
  _id: DbId;
  order: number;
  draft: MentorContent;
  live: MentorContent | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
}

export interface Mentor {
  id: string;
  order: number;
  draft: MentorContent;
  live: MentorContent | null;
  isPublished: boolean;
  /** True when the draft differs from what is currently live on the site. */
  hasUnpublishedChanges: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

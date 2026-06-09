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
  companyLogos: "CompanyLogo",
  settings: "Settings",
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
  /** Companies the mentor previously worked at (most recent first). */
  previouslyAt: string[];
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

/**
 * A reusable company brand icon. Stored in its own collection so mentors (and
 * other surfaces) can pick a company from a shared list rather than relying on
 * a hard-coded slug map. `company` is unique (case-insensitive via index).
 */
export interface CompanyLogoDocument {
  _id: DbId;
  company: string;
  logoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyLogo {
  id: string;
  company: string;
  logoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Fixed `_id` of the singleton pricing settings document. */
export const PRICING_SETTINGS_ID = "pricing" as const;

/**
 * Singleton document holding admin-managed course fees. When absent (or a field
 * is unset), the application falls back to the environment-driven defaults so
 * the site keeps working before an admin sets prices for the first time.
 */
export interface PricingSettingsDocument {
  _id: typeof PRICING_SETTINGS_ID;
  /** Standard course fee in rupees. */
  standardInRupees?: number;
  /** Course fee in rupees when a valid referral code is applied. */
  withReferralCodeInRupees?: number;
  updatedAt?: Date;
  /** Id of the admin who last changed the fees (audit trail). */
  updatedByAdminId?: DbId | null;
}

export interface PricingSettings {
  standardInRupees: number;
  withReferralCodeInRupees: number;
  /** True when the values come from saved admin settings (not env defaults). */
  isCustom: boolean;
  updatedAt: Date | null;
}

/** Fixed `_id` of the singleton seats settings document. */
export const SEATS_SETTINGS_ID = "seats" as const;

/** Singleton document for admin-managed cohort seat counts. */
export interface SeatsSettingsDocument {
  _id: typeof SEATS_SETTINGS_ID;
  total?: number;
  remaining?: number;
  updatedAt?: Date;
  updatedByAdminId?: DbId | null;
}

export interface SeatsSettings {
  total: number;
  remaining: number;
  isCustom: boolean;
  updatedAt: Date | null;
}

export type SettingsDocument = PricingSettingsDocument | SeatsSettingsDocument;

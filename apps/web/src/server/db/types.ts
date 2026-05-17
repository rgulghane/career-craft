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
} as const;

export interface UserDocument {
  _id: DbId;
  email: string;
  /** Omitted for Google-only accounts. */
  passwordHash?: string;
  fullName: string;
  googleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  referralCode?: string | null;
  userType?: UserType | null;
}

export interface EnrollmentDocument {
  _id: DbId;
  userId: DbId;
  amountInPaise: number;
  currency: string;
  status: string;
  referralCodeUsed?: string | null;
  referrerId?: DbId | null;
  paymentId?: string | null;
  razorpayOrderId?: string | null;
  paidAt?: Date | null;
  createdAt: Date;
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
  referralCode: string | null;
  userType: UserType | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  amountInPaise: number;
  currency: string;
  status: string;
  referralCodeUsed: string | null;
  referrerId: string | null;
  paymentId: string | null;
  razorpayOrderId: string | null;
  paidAt: Date | null;
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

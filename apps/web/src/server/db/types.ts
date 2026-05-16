import type { ObjectId } from "mongodb";

/** MongoDB _id / FK — ObjectId (new) or string (legacy Prisma cuid). */
export type DbId = ObjectId | string;

/** Prisma-compatible collection names (existing Atlas data). */
export const COLLECTIONS = {
  users: "User",
  enrollments: "Enrollment",
  referrals: "Referral",
} as const;

export interface UserDocument {
  _id: DbId;
  email: string;
  passwordHash: string;
  fullName: string;
  referralCode?: string | null;
  createdAt: Date;
  updatedAt: Date;
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

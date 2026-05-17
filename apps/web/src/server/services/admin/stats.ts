import "server-only";

import { REFERRAL_POLICY } from "@career-craft/shared";
import "../../db/load-env";
import { enrollmentsCollection, referralsCollection, usersCollection } from "../../db/mongo-client";

export interface AdminOverviewStats {
  totalUsers: number;
  paidEnrollments: number;
  pendingEnrollments: number;
  totalReferrals: number;
  qualifiedReferrals: number;
  inRefundWindowReferrals: number;
  voidedReferrals: number;
  cashPerReferralPaise: number;
  refundWindowDays: number;
}

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const users = await usersCollection();
  const enrollments = await enrollmentsCollection();
  const referrals = await referralsCollection();

  const [totalUsers, paidEnrollments, pendingEnrollments, totalReferrals, qualifiedReferrals, inRefundWindowReferrals, voidedReferrals] =
    await Promise.all([
      users.countDocuments({ userType: { $ne: "admin" } }),
      enrollments.countDocuments({ status: "PAID" }),
      enrollments.countDocuments({ status: "PENDING" }),
      referrals.countDocuments({}),
      referrals.countDocuments({ status: "QUALIFIED" }),
      referrals.countDocuments({ status: "IN_REFUND_WINDOW" }),
      referrals.countDocuments({ status: "VOIDED" }),
    ]);

  return {
    totalUsers,
    paidEnrollments,
    pendingEnrollments,
    totalReferrals,
    qualifiedReferrals,
    inRefundWindowReferrals,
    voidedReferrals,
    cashPerReferralPaise: REFERRAL_POLICY.cashPerReferralPaise,
    refundWindowDays: REFERRAL_POLICY.refundWindowDays,
  };
}

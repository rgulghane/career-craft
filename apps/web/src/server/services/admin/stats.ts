import "server-only";

import { serverConfig } from "@/lib/config";
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
  cashPerReferralRupees: number;
  refundWindowDays: number;
}

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const users = await usersCollection();
  const enrollments = await enrollmentsCollection();
  const referrals = await referralsCollection();

  const [totalUsers, paidEnrollments, pendingEnrollments, totalReferrals, qualifiedReferrals, inRefundWindowReferrals, voidedReferrals] =
    await Promise.all([
      users.countDocuments({ userType: { $nin: ["admin", "admin-readonly"] } }),
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
    cashPerReferralRupees: serverConfig.referral.cashPerReferralRupees,
    refundWindowDays: serverConfig.referral.refundWindowDays,
  };
}

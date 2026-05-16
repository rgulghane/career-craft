import "server-only";

import {
  PROGRAM,
  REFERRAL_POLICY,
  messages,
  type DashboardResponse,
  type ReferralRowStatus,
} from "@career-craft/shared";
import { prisma } from "../prisma";
import { maskEmail } from "../util/mask-email";

/**
 * Build the dashboard payload for a given authenticated user.
 * Returns null if the user can't be found.
 */
export async function buildDashboardForUser(userId: string): Promise<DashboardResponse | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return null;
  }

  const paidEnrollment = await prisma.enrollment.findFirst({
    where: { userId, status: "PAID" },
    orderBy: { paidAt: "desc" },
  });

  const pricingLabel = paidEnrollment
    ? messages.dashboard.pricingLabelEnrolled
    : messages.dashboard.pricingLabelPending;

  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: { referee: true },
    orderBy: { createdAt: "desc" },
  });

  const qualified = referrals.filter((r) => r.status === "QUALIFIED").length;
  const pending = referrals.filter((r) => r.status === "IN_REFUND_WINDOW").length;

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      referralCode: paidEnrollment ? user.referralCode : null,
    },
    pricing: {
      amountInPaise: paidEnrollment?.amountInPaise ?? 0,
      currency: PROGRAM.defaultCurrency,
      label: pricingLabel,
    },
    stats: {
      totalAttributed: referrals.length,
      qualified,
      pending,
      towardSilver: qualified,
      towardGold: qualified,
      towardDiamond: qualified,
    },
    milestones: {
      silverAt: REFERRAL_POLICY.milestones.silverReferrals,
      goldAt: REFERRAL_POLICY.milestones.goldReferrals,
      diamondAt: REFERRAL_POLICY.milestones.diamondReferrals,
    },
    referrals: referrals.map((r) => ({
      id: r.id,
      refereeEmailMasked: maskEmail(r.referee.email),
      status: r.status as ReferralRowStatus,
      createdAt: r.createdAt.toISOString(),
      qualifiedAt: r.qualifiedAt ? r.qualifiedAt.toISOString() : null,
    })),
  };
}

import "server-only";

import {
  PROGRAM,
  REFERRAL_POLICY,
  messages,
  type DashboardResponse,
  type ReferralRowStatus,
} from "@career-craft/shared";
import "../db/load-env";
import { mapEnrollment, mapReferral, mapUser, toDbId, toIdString } from "../db/helpers";
import {
  enrollmentsCollection,
  referralsCollection,
  usersCollection,
} from "../db/mongo-client";
import { maskEmail } from "../util/mask-email";

/**
 * Build the dashboard payload for a given authenticated user.
 * Returns null if the user can't be found.
 */
export async function buildDashboardForUser(userId: string): Promise<DashboardResponse | null> {
  const users = await usersCollection();
  const userDoc = await users.findOne({ _id: toDbId(userId) });
  if (!userDoc) {
    return null;
  }
  const user = mapUser(userDoc);

  const enrollments = await enrollmentsCollection();
  const paidDoc = await enrollments.findOne(
    { userId: toDbId(userId), status: "PAID" },
    { sort: { paidAt: -1 } },
  );
  const paidEnrollment = paidDoc ? mapEnrollment(paidDoc) : null;

  const pricingLabel = paidEnrollment
    ? messages.dashboard.pricingLabelEnrolled
    : messages.dashboard.pricingLabelPending;

  const referralsCol = await referralsCollection();
  const referralDocs = await referralsCol
    .find({ referrerId: toDbId(userId) })
    .sort({ createdAt: -1 })
    .toArray();

  const refereeIds = referralDocs.map((r) => r.refereeId);
  const refereeDocs =
    refereeIds.length > 0
      ? await users.find({ _id: { $in: refereeIds } }).toArray()
      : [];
  const refereeById = new Map(refereeDocs.map((u) => [toIdString(u._id), u]));

  const referrals = referralDocs.map((r) => {
    const referee = refereeById.get(toIdString(r.refereeId));
    if (!referee) {
      throw new Error(`Referee missing for referral ${toIdString(r._id)}`);
    }
    return { ...mapReferral(r), referee: { email: referee.email } };
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

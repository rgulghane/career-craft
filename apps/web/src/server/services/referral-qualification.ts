import "server-only";

import "../db/load-env";
import { mapEnrollment, mapReferral, toDbId, toIdString } from "../db/helpers";
import {
  enrollmentsCollection,
  referralsCollection,
} from "../db/mongo-client";
import { serverConfig } from "@/lib/config";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Move referrals from IN_REFUND_WINDOW → QUALIFIED after the refund window elapses.
 */
export async function qualifyDueReferrals(): Promise<{ updated: number }> {
  const now = new Date();
  const windowMs = serverConfig.referral.refundWindowDays * MS_PER_DAY;

  const referralsCol = await referralsCollection();
  const referralDocs = await referralsCol.find({ status: "IN_REFUND_WINDOW" }).toArray();

  if (referralDocs.length === 0) {
    return { updated: 0 };
  }

  const enrollments = await enrollmentsCollection();
  const enrollmentDocs = await enrollments
    .find({ _id: { $in: referralDocs.map((r) => r.enrollmentId) } })
    .toArray();
  const enrollmentById = new Map(enrollmentDocs.map((e) => [toIdString(e._id), e]));

  let updated = 0;
  for (const doc of referralDocs) {
    const r = mapReferral(doc);
    const enrollmentDoc = enrollmentById.get(r.enrollmentId);
    if (!enrollmentDoc) {
      continue;
    }
    const enrollment = mapEnrollment(enrollmentDoc);
    const paidAt = enrollment.paidAt;
    if (!paidAt || enrollment.status !== "PAID") {
      continue;
    }
    if (now.getTime() - paidAt.getTime() < windowMs) {
      continue;
    }
    await referralsCol.updateOne(
      { _id: toDbId(r.id) },
      { $set: { status: "QUALIFIED", qualifiedAt: now } },
    );
    updated += 1;
  }

  return { updated };
}

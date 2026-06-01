import "server-only";

import "../../db/load-env";
import { mapEnrollment, mapReferral, toDbId, toIdString } from "../../db/helpers";
import { enrollmentsCollection, referralsCollection, usersCollection } from "../../db/mongo-client";
import { qualifyDueReferrals } from "../referral-qualification";
import { AdminServiceError } from "./errors";

export interface AdminReferralListItem {
  id: string;
  status: string;
  referrerId: string;
  referrerEmail: string;
  refereeId: string;
  refereeEmail: string;
  enrollmentId: string;
  voidReason: string | null;
  qualifiedAt: string | null;
  createdAt: string;
}

export async function listAdminReferrals(params: {
  status?: string;
  referrerId?: string;
  page: number;
  limit: number;
}): Promise<{ items: AdminReferralListItem[]; total: number; page: number; limit: number }> {
  const referrals = await referralsCollection();
  const filter: Record<string, unknown> = {};
  if (params.status) {
    filter.status = params.status;
  }
  if (params.referrerId) {
    filter.referrerId = toDbId(params.referrerId);
  }

  const skip = (params.page - 1) * params.limit;
  const [docs, total] = await Promise.all([
    referrals.find(filter).sort({ createdAt: -1 }).skip(skip).limit(params.limit).toArray(),
    referrals.countDocuments(filter),
  ]);

  const userIds = [
    ...new Set([
      ...docs.map((d) => toIdString(d.referrerId)),
      ...docs.map((d) => toIdString(d.refereeId)),
    ]),
  ];
  const users = await usersCollection();
  const userDocs =
    userIds.length > 0 ? await users.find({ _id: { $in: userIds.map(toDbId) } }).toArray() : [];
  const emailById = new Map(userDocs.map((u) => [toIdString(u._id), u.email]));

  const items = docs.map((doc) => {
    const r = mapReferral(doc);
    return {
      id: r.id,
      status: r.status,
      referrerId: r.referrerId,
      referrerEmail: emailById.get(r.referrerId) ?? "—",
      refereeId: r.refereeId,
      refereeEmail: emailById.get(r.refereeId) ?? "—",
      enrollmentId: r.enrollmentId,
      voidReason: r.voidReason,
      qualifiedAt: r.qualifiedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    };
  });

  return { items, total, page: params.page, limit: params.limit };
}

export async function getAdminReferral(referralId: string) {
  const referrals = await referralsCollection();
  const doc = await referrals.findOne({ _id: toDbId(referralId) });
  if (!doc) {
    return null;
  }
  const r = mapReferral(doc);

  const users = await usersCollection();
  const [referrerDoc, refereeDoc] = await Promise.all([
    users.findOne({ _id: toDbId(r.referrerId) }),
    users.findOne({ _id: toDbId(r.refereeId) }),
  ]);

  const enrollments = await enrollmentsCollection();
  const enrollmentDoc = await enrollments.findOne({ _id: toDbId(r.enrollmentId) });
  const enrollment = enrollmentDoc ? mapEnrollment(enrollmentDoc) : null;

  return {
    referral: {
      ...r,
      qualifiedAt: r.qualifiedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    },
    referrer: referrerDoc ? { id: toIdString(referrerDoc._id), email: referrerDoc.email, fullName: referrerDoc.fullName } : null,
    referee: refereeDoc ? { id: toIdString(refereeDoc._id), email: refereeDoc.email, fullName: refereeDoc.fullName } : null,
    enrollment: enrollment
      ? {
          id: enrollment.id,
          status: enrollment.status,
          amountInRupees: enrollment.amountInRupees,
          paidAt: enrollment.paidAt?.toISOString() ?? null,
        }
      : null,
  };
}

export async function voidAdminReferral(referralId: string, voidReason: string): Promise<void> {
  const referrals = await referralsCollection();
  const doc = await referrals.findOne({ _id: toDbId(referralId) });
  if (!doc) {
    throw new AdminServiceError(404, "Referral not found");
  }
  if (doc.status === "VOIDED") {
    return;
  }
  await referrals.updateOne(
    { _id: toDbId(referralId) },
    { $set: { status: "VOIDED", voidReason, qualifiedAt: null } },
  );
}

export async function qualifyAdminReferral(referralId: string): Promise<void> {
  const referrals = await referralsCollection();
  const doc = await referrals.findOne({ _id: toDbId(referralId) });
  if (!doc) {
    throw new AdminServiceError(404, "Referral not found");
  }
  if (doc.status === "VOIDED") {
    throw new AdminServiceError(400, "Cannot qualify a voided referral");
  }

  const enrollments = await enrollmentsCollection();
  const enrollmentDoc = await enrollments.findOne({ _id: doc.enrollmentId });
  if (!enrollmentDoc || enrollmentDoc.status !== "PAID") {
    throw new AdminServiceError(400, "Enrollment must be paid before qualifying");
  }

  await referrals.updateOne(
    { _id: toDbId(referralId) },
    { $set: { status: "QUALIFIED", qualifiedAt: new Date(), voidReason: null } },
  );
}

export { qualifyDueReferrals as runAdminQualifyDueReferrals };

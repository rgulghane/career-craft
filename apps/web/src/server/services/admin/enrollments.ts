import "server-only";

import { randomUUID } from "node:crypto";
import type { AdminUpdateEnrollmentBody } from "@career-craft/shared";
import "../../db/load-env";
import { mapEnrollment, mapUser, toDbId, toIdString } from "../../db/helpers";
import { enrollmentsCollection, referralsCollection, usersCollection } from "../../db/mongo-client";
import { completeEnrollmentPayment } from "../enrollment";
import { AdminServiceError } from "./errors";

export interface AdminEnrollmentListItem {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  status: string;
  amountInPaise: number;
  referralCodeUsed: string | null;
  referrerId: string | null;
  referrerEmail: string | null;
  paymentId: string | null;
  paidAt: string | null;
  createdAt: string;
}

export async function listAdminEnrollments(params: {
  status?: "PENDING" | "PAID" | "REFUNDED";
  userId?: string;
  page: number;
  limit: number;
}): Promise<{ items: AdminEnrollmentListItem[]; total: number; page: number; limit: number }> {
  const enrollments = await enrollmentsCollection();
  const filter: Record<string, unknown> = {};
  if (params.status) {
    filter.status = params.status;
  }
  if (params.userId) {
    filter.userId = toDbId(params.userId);
  }

  const skip = (params.page - 1) * params.limit;
  const [docs, total] = await Promise.all([
    enrollments.find(filter).sort({ createdAt: -1 }).skip(skip).limit(params.limit).toArray(),
    enrollments.countDocuments(filter),
  ]);

  const userIds = [...new Set(docs.map((d) => toIdString(d.userId)))];
  const referrerIds = [
    ...new Set(docs.filter((d) => d.referrerId).map((d) => toIdString(d.referrerId!))),
  ];
  const allUserIds = [...new Set([...userIds, ...referrerIds])];

  const users = await usersCollection();
  const userDocs =
    allUserIds.length > 0 ? await users.find({ _id: { $in: allUserIds.map(toDbId) } }).toArray() : [];
  const userById = new Map(userDocs.map((u) => [toIdString(u._id), mapUser(u)]));

  const items = docs.map((doc) => {
    const e = mapEnrollment(doc);
    const student = userById.get(e.userId);
    const referrer = e.referrerId ? userById.get(e.referrerId) : null;
    return {
      id: e.id,
      userId: e.userId,
      userEmail: student?.email ?? "—",
      userFullName: student?.fullName ?? "—",
      status: e.status,
      amountInPaise: e.amountInPaise,
      referralCodeUsed: e.referralCodeUsed,
      referrerId: e.referrerId,
      referrerEmail: referrer?.email ?? null,
      paymentId: e.paymentId,
      paidAt: e.paidAt?.toISOString() ?? null,
      createdAt: e.createdAt.toISOString(),
    };
  });

  return { items, total, page: params.page, limit: params.limit };
}

export async function getAdminEnrollment(enrollmentId: string) {
  const enrollments = await enrollmentsCollection();
  const doc = await enrollments.findOne({ _id: toDbId(enrollmentId) });
  if (!doc) {
    return null;
  }
  const e = mapEnrollment(doc);

  const users = await usersCollection();
  const studentDoc = await users.findOne({ _id: toDbId(e.userId) });
  const referrerDoc = e.referrerId ? await users.findOne({ _id: toDbId(e.referrerId) }) : null;

  const referrals = await referralsCollection();
  const referralDoc = await referrals.findOne({ enrollmentId: toDbId(enrollmentId) });

  return {
    enrollment: {
      ...e,
      paidAt: e.paidAt?.toISOString() ?? null,
      createdAt: e.createdAt.toISOString(),
    },
    student: studentDoc ? mapUser(studentDoc) : null,
    referrer: referrerDoc ? mapUser(referrerDoc) : null,
    referral: referralDoc
      ? {
          id: toIdString(referralDoc._id),
          status: referralDoc.status,
          voidReason: referralDoc.voidReason ?? null,
          qualifiedAt: referralDoc.qualifiedAt?.toISOString() ?? null,
        }
      : null,
  };
}

export async function updateAdminEnrollment(
  enrollmentId: string,
  body: AdminUpdateEnrollmentBody,
): Promise<AdminEnrollmentListItem> {
  const enrollments = await enrollmentsCollection();
  const doc = await enrollments.findOne({ _id: toDbId(enrollmentId) });
  if (!doc) {
    throw new AdminServiceError(404, "Enrollment not found");
  }
  let enrollment = mapEnrollment(doc);

  if (body.markPaid && enrollment.status !== "PAID") {
    await completeEnrollmentPayment(
      enrollment.userId,
      enrollment.id,
      `admin_${randomUUID()}`,
    );
    const refreshed = await enrollments.findOne({ _id: toDbId(enrollmentId) });
    if (!refreshed) {
      throw new AdminServiceError(500, "Payment completion failed");
    }
    enrollment = mapEnrollment(refreshed);
  }

  const $set: Record<string, unknown> = {};
  if (body.amountInPaise !== undefined) {
    $set.amountInPaise = body.amountInPaise;
  }
  if (body.referralCodeUsed !== undefined) {
    $set.referralCodeUsed = body.referralCodeUsed;
  }
  if (body.referrerId !== undefined) {
    $set.referrerId = body.referrerId ? toDbId(body.referrerId) : null;
  }
  if (body.status !== undefined && body.status !== "PAID") {
    $set.status = body.status;
  }

  if (Object.keys($set).length > 0) {
    await enrollments.updateOne({ _id: toDbId(enrollmentId) }, { $set });
  }

  const updated = await enrollments.findOne({ _id: toDbId(enrollmentId) });
  if (!updated) {
    throw new AdminServiceError(404, "Enrollment not found");
  }
  const e = mapEnrollment(updated);
  const users = await usersCollection();
  const student = await users.findOne({ _id: toDbId(e.userId) });
  const referrer = e.referrerId ? await users.findOne({ _id: toDbId(e.referrerId) }) : null;
  return {
    id: e.id,
    userId: e.userId,
    userEmail: student ? mapUser(student).email : "—",
    userFullName: student ? mapUser(student).fullName : "—",
    status: e.status,
    amountInPaise: e.amountInPaise,
    referralCodeUsed: e.referralCodeUsed,
    referrerId: e.referrerId,
    referrerEmail: referrer ? mapUser(referrer).email : null,
    paymentId: e.paymentId,
    paidAt: e.paidAt?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
  };
}

import "server-only";

import type { AdminUpdateUserBody, UserType } from "@career-craft/shared";
import { PORTAL_ADMIN_TYPES } from "@career-craft/shared";
import "../../db/load-env";
import { mapEnrollment, mapReferral, mapUser, toDbId, toIdString } from "../../db/helpers";
import {
  enrollmentsCollection,
  referralsCollection,
  usersCollection,
} from "../../db/mongo-client";
import { generateReferralCode } from "../../util/referral-code";
import { AdminServiceError } from "./errors";

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string;
  userType: UserType | null;
  referralCode: string | null;
  hasPaidEnrollment: boolean;
  createdAt: string;
}

export interface AdminUserDetail {
  user: AdminUserListItem & { googleId: string | null; updatedAt: string };
  enrollments: Array<{
    id: string;
    status: string;
    amountInRupees: number;
    referralCodeUsed: string | null;
    paidAt: string | null;
    createdAt: string;
  }>;
  referralsAsReferrer: Array<{
    id: string;
    status: string;
    refereeEmail: string;
    createdAt: string;
  }>;
  referralsAsReferee: Array<{
    id: string;
    status: string;
    referrerEmail: string;
    createdAt: string;
  }>;
}

export async function listAdminUsers(params: {
  q?: string;
  userType?: UserType;
  enrolled?: boolean;
  page: number;
  limit: number;
}): Promise<{ items: AdminUserListItem[]; total: number; page: number; limit: number }> {
  const users = await usersCollection();
  const enrollments = await enrollmentsCollection();

  const filter: Record<string, unknown> = { userType: { $nin: [...PORTAL_ADMIN_TYPES] } };
  if (params.userType) {
    filter.userType = params.userType;
  }
  if (params.q?.trim()) {
    const q = params.q.trim();
    const regex = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = [{ email: regex }, { fullName: regex }, { referralCode: q.toUpperCase() }];
  }

  let userIdsEnrolled: Set<string> | null = null;
  if (params.enrolled !== undefined) {
    const paid = await enrollments.find({ status: "PAID" }).project({ userId: 1 }).toArray();
    userIdsEnrolled = new Set(paid.map((e) => toIdString(e.userId)));
    if (params.enrolled) {
      filter._id = { $in: [...userIdsEnrolled].map((id) => toDbId(id)) };
    }
  }

  const skip = (params.page - 1) * params.limit;
  const [docs, total] = await Promise.all([
    users.find(filter).sort({ createdAt: -1 }).skip(skip).limit(params.limit).toArray(),
    users.countDocuments(filter),
  ]);

  const ids = docs.map((d) => d._id);
  const paidByUser =
    ids.length > 0
      ? await enrollments
          .find({ userId: { $in: ids }, status: "PAID" })
          .project({ userId: 1 })
          .toArray()
      : [];
  const paidSet = new Set(paidByUser.map((e) => toIdString(e.userId)));

  if (params.enrolled === false && userIdsEnrolled) {
    // post-filter users without paid enrollment when not already in query
  }

  let items = docs.map((doc) => {
    const u = mapUser(doc);
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      userType: u.userType,
      referralCode: u.referralCode,
      hasPaidEnrollment: paidSet.has(u.id),
      createdAt: u.createdAt.toISOString(),
    };
  });

  if (params.enrolled === false) {
    items = items.filter((u) => !u.hasPaidEnrollment);
  }

  return { items, total: params.enrolled === false ? items.length : total, page: params.page, limit: params.limit };
}

export async function getAdminUser(userId: string): Promise<AdminUserDetail | null> {
  const users = await usersCollection();
  const doc = await users.findOne({ _id: toDbId(userId) });
  if (!doc) {
    return null;
  }
  const u = mapUser(doc);

  const enrollments = await enrollmentsCollection();
  const enrollmentDocs = await enrollments
    .find({ userId: toDbId(userId) })
    .sort({ createdAt: -1 })
    .toArray();

  const referralsCol = await referralsCollection();
  const asReferrer = await referralsCol.find({ referrerId: toDbId(userId) }).sort({ createdAt: -1 }).toArray();
  const asReferee = await referralsCol.find({ refereeId: toDbId(userId) }).sort({ createdAt: -1 }).toArray();

  const relatedIds = [
    ...asReferrer.map((r) => r.refereeId),
    ...asReferee.map((r) => r.referrerId),
  ];
  const relatedUsers =
    relatedIds.length > 0
      ? await users.find({ _id: { $in: relatedIds } }).toArray()
      : [];
  const emailById = new Map(relatedUsers.map((x) => [toIdString(x._id), x.email]));

  const paidDoc = enrollmentDocs.find((e) => e.status === "PAID");

  return {
    user: {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      userType: u.userType,
      referralCode: u.referralCode,
      hasPaidEnrollment: Boolean(paidDoc),
      googleId: doc.googleId ?? null,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    },
    enrollments: enrollmentDocs.map((e) => {
      const en = mapEnrollment(e);
      return {
        id: en.id,
        status: en.status,
        amountInRupees: en.amountInRupees,
        referralCodeUsed: en.referralCodeUsed,
        paidAt: en.paidAt?.toISOString() ?? null,
        createdAt: en.createdAt.toISOString(),
      };
    }),
    referralsAsReferrer: asReferrer.map((r) => {
      const ref = mapReferral(r);
      return {
        id: ref.id,
        status: ref.status,
        refereeEmail: emailById.get(ref.refereeId) ?? "—",
        createdAt: ref.createdAt.toISOString(),
      };
    }),
    referralsAsReferee: asReferee.map((r) => {
      const ref = mapReferral(r);
      return {
        id: ref.id,
        status: ref.status,
        referrerEmail: emailById.get(ref.referrerId) ?? "—",
        createdAt: ref.createdAt.toISOString(),
      };
    }),
  };
}

export async function updateAdminUser(
  userId: string,
  body: AdminUpdateUserBody,
): Promise<AdminUserListItem> {
  const users = await usersCollection();
  const doc = await users.findOne({ _id: toDbId(userId) });
  if (!doc) {
    throw new AdminServiceError(404, "User not found");
  }

  const $set: Record<string, unknown> = { updatedAt: new Date() };
  if (body.fullName !== undefined) {
    $set.fullName = body.fullName;
  }
  if (body.email !== undefined) {
    const clash = await users.findOne({ email: body.email, _id: { $ne: toDbId(userId) } });
    if (clash) {
      throw new AdminServiceError(409, "Email already in use");
    }
    $set.email = body.email;
  }
  if (body.userType !== undefined) {
    if ((PORTAL_ADMIN_TYPES as readonly string[]).includes(body.userType)) {
      throw new AdminServiceError(400, "Use Admin team to manage portal admins.");
    }
    $set.userType = body.userType;
  }
  const $unset: Record<string, ""> = {};
  if (body.referralCode !== undefined) {
    if (body.referralCode === null) {
      $unset.referralCode = "";
    } else {
      const clash = await users.findOne({
        referralCode: body.referralCode,
        _id: { $ne: toDbId(userId) },
      });
      if (clash) {
        throw new AdminServiceError(409, "Referral code already in use");
      }
      $set.referralCode = body.referralCode;
    }
  }

  await users.updateOne(
    { _id: toDbId(userId) },
    { $set, ...(Object.keys($unset).length > 0 ? { $unset } : {}) },
  );
  const updated = await users.findOne({ _id: toDbId(userId) });
  if (!updated) {
    throw new AdminServiceError(500, "Update failed");
  }
  const u = mapUser(updated);
  const enrollments = await enrollmentsCollection();
  const paid = await enrollments.findOne({ userId: toDbId(userId), status: "PAID" });
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    userType: u.userType,
    referralCode: u.referralCode,
    hasPaidEnrollment: Boolean(paid),
    createdAt: u.createdAt.toISOString(),
  };
}

export async function regenerateAdminUserReferralCode(userId: string): Promise<string> {
  const users = await usersCollection();
  const doc = await users.findOne({ _id: toDbId(userId) });
  if (!doc) {
    throw new AdminServiceError(404, "User not found");
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateReferralCode();
    const clash = await users.findOne({ referralCode: code, _id: { $ne: toDbId(userId) } });
    if (!clash) {
      await users.updateOne(
        { _id: toDbId(userId) },
        { $set: { referralCode: code, updatedAt: new Date() } },
      );
      return code;
    }
  }
  throw new AdminServiceError(500, "Could not generate unique referral code");
}

/** Permanently remove a student account and related enrollments/referrals. */
export async function deleteAdminUser(userId: string, actingAdminId: string): Promise<void> {
  if (userId === actingAdminId) {
    throw new AdminServiceError(400, "You cannot delete your own account.");
  }

  const users = await usersCollection();
  const doc = await users.findOne({ _id: toDbId(userId) });
  if (!doc) {
    throw new AdminServiceError(404, "User not found");
  }

  const userType = doc.userType ?? "student";
  if ((PORTAL_ADMIN_TYPES as readonly string[]).includes(userType)) {
    throw new AdminServiceError(400, "Portal admin accounts cannot be deleted here. Use Admin team.");
  }

  const uid = toDbId(userId);
  const enrollments = await enrollmentsCollection();
  const referralsCol = await referralsCollection();

  const enrollmentIds = (
    await enrollments.find({ userId: uid }).project({ _id: 1 }).toArray()
  ).map((e) => e._id);

  await referralsCol.deleteMany({
    $or: [
      { referrerId: uid },
      { refereeId: uid },
      ...(enrollmentIds.length > 0 ? [{ enrollmentId: { $in: enrollmentIds } }] : []),
    ],
  });

  await enrollments.deleteMany({ userId: uid });
  await enrollments.updateMany({ referrerId: uid }, { $unset: { referrerId: "" } });

  const result = await users.deleteOne({ _id: uid });
  if (result.deletedCount !== 1) {
    throw new AdminServiceError(500, "Delete failed");
  }
}

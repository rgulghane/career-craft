import "server-only";

import "../../db/load-env";
import { mapEnrollment, mapReferral, mapUser } from "../../db/helpers";
import {
  enrollmentsCollection,
  referralsCollection,
  usersCollection,
} from "../../db/mongo-client";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function row(values: string[]): string {
  return `${values.map(escapeCsv).join(",")}\n`;
}

export async function exportAdminCsv(type: "users" | "enrollments" | "referrals"): Promise<string> {
  if (type === "users") {
    const users = await usersCollection();
    const docs = await users.find({ userType: { $ne: "admin" } }).sort({ createdAt: -1 }).toArray();
    let csv = row(["id", "email", "fullName", "userType", "referralCode", "createdAt"]);
    for (const doc of docs) {
      const u = mapUser(doc);
      csv += row([
        u.id,
        u.email,
        u.fullName,
        u.userType ?? "student",
        u.referralCode ?? "",
        u.createdAt.toISOString(),
      ]);
    }
    return csv;
  }

  if (type === "enrollments") {
    const enrollments = await enrollmentsCollection();
    const docs = await enrollments.find({}).sort({ createdAt: -1 }).toArray();
    let csv = row([
      "id",
      "userId",
      "status",
      "amountInPaise",
      "referralCodeUsed",
      "referrerId",
      "paymentId",
      "paidAt",
      "createdAt",
    ]);
    for (const doc of docs) {
      const e = mapEnrollment(doc);
      csv += row([
        e.id,
        e.userId,
        e.status,
        String(e.amountInPaise),
        e.referralCodeUsed ?? "",
        e.referrerId ?? "",
        e.paymentId ?? "",
        e.paidAt?.toISOString() ?? "",
        e.createdAt.toISOString(),
      ]);
    }
    return csv;
  }

  const referrals = await referralsCollection();
  const docs = await referrals.find({}).sort({ createdAt: -1 }).toArray();
  let csv = row([
    "id",
    "referrerId",
    "refereeId",
    "enrollmentId",
    "status",
    "voidReason",
    "qualifiedAt",
    "createdAt",
  ]);
  for (const doc of docs) {
    const r = mapReferral(doc);
    csv += row([
      r.id,
      r.referrerId,
      r.refereeId,
      r.enrollmentId,
      r.status,
      r.voidReason ?? "",
      r.qualifiedAt?.toISOString() ?? "",
      r.createdAt.toISOString(),
    ]);
  }
  return csv;
}

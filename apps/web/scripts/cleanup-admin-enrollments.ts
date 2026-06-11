/**
 * Remove enrollments (and linked referrals) for portal admin users.
 *
 * Targets users with userType `admin` or `admin-readonly`.
 *
 * SAFETY: dry run by default. To delete, pass CONFIRM_DELETE=YES.
 *
 *   npm run db:cleanup-admin-enrollments
 *   CONFIRM_DELETE=YES npm run db:cleanup-admin-enrollments
 */
import { ObjectId } from "mongodb";
import { PORTAL_ADMIN_TYPES } from "@career-craft/shared";
import { toDbId } from "../src/server/db/helpers";
import { establishDatabaseConnection } from "../src/server/db/startup";
import { mongoClient } from "../src/server/db/mongo-client";
import { COLLECTIONS, type DbId } from "../src/server/db/types";

function comparableId(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof ObjectId) {
    return value.toHexString();
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return String(value);
}

function toObjectIds(ids: DbId[]): ObjectId[] {
  return ids.map((id) => (id instanceof ObjectId ? id : (toDbId(id) as ObjectId)));
}

async function main(): Promise<void> {
  const confirmed = process.env.CONFIRM_DELETE === "YES";

  await establishDatabaseConnection();
  const db = (await mongoClient()).db();
  const usersCol = db.collection(COLLECTIONS.users);
  const enrollmentsCol = db.collection(COLLECTIONS.enrollments);
  const referralsCol = db.collection(COLLECTIONS.referrals);

  console.log("=== cleanup-admin-enrollments ===");
  console.log(confirmed ? "MODE: LIVE DELETE" : "MODE: DRY RUN (no changes)");

  const adminUsers = await usersCol
    .find(
      { userType: { $in: [...PORTAL_ADMIN_TYPES] } },
      { projection: { _id: 1, email: 1, userType: 1 } },
    )
    .toArray();

  const adminUserIds = new Set<string>();
  for (const user of adminUsers) {
    const id = comparableId(user._id);
    if (id) {
      adminUserIds.add(id);
    }
  }

  console.log(`\nPortal admin users (${adminUsers.length}):`);
  for (const user of adminUsers) {
    console.log(`  - ${user.email} (${user.userType})`);
  }

  const enrollmentIdsToDelete = new Set<string>();
  const enrollmentDbIds: DbId[] = [];

  for await (const enrollment of enrollmentsCol.find(
    {},
    { projection: { _id: 1, userId: 1, status: 1 } },
  )) {
    const userId = comparableId(enrollment.userId);
    if (userId && adminUserIds.has(userId)) {
      enrollmentDbIds.push(enrollment._id as DbId);
      const enrollmentId = comparableId(enrollment._id);
      if (enrollmentId) {
        enrollmentIdsToDelete.add(enrollmentId);
      }
    }
  }

  const referralDbIds: DbId[] = [];
  for await (const referral of referralsCol.find(
    {},
    { projection: { _id: 1, enrollmentId: 1 } },
  )) {
    const enrollmentId = comparableId(referral.enrollmentId);
    if (enrollmentId && enrollmentIdsToDelete.has(enrollmentId)) {
      referralDbIds.push(referral._id as DbId);
    }
  }

  console.log(`\nAdmin enrollments to delete: ${enrollmentDbIds.length}`);
  console.log(`Linked referrals to delete:   ${referralDbIds.length}`);

  if (!confirmed) {
    console.log("\nDRY RUN complete. No data was changed.");
    console.log("Re-run with CONFIRM_DELETE=YES to perform the deletion.");
    await (await mongoClient()).close();
    return;
  }

  console.log("\nDeleting…");
  const referrals = await referralsCol.deleteMany({ _id: { $in: toObjectIds(referralDbIds) } });
  const enrollments = await enrollmentsCol.deleteMany({ _id: { $in: toObjectIds(enrollmentDbIds) } });

  console.log("\nDeleted:");
  console.log(`  Referral:    ${referrals.deletedCount}`);
  console.log(`  Enrollment:  ${enrollments.deletedCount}`);
  console.log(`\nRemaining enrollments: ${await enrollmentsCol.countDocuments({})}`);
  console.log(`Remaining referrals:   ${await referralsCol.countDocuments({})}`);

  await (await mongoClient()).close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

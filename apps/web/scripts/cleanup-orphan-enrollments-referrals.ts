/**
 * Remove enrollments and referrals that are not tied to real users.
 *
 * Deletes:
 *   - Enrollments whose `userId` is missing or does not match any User.
 *   - Referrals whose `referrerId` or `refereeId` is missing or does not match
 *     any User, or whose `enrollmentId` does not match any Enrollment.
 *
 * SAFETY: dry run by default. To delete, pass CONFIRM_DELETE=YES.
 *
 *   npm run db:cleanup-orphans
 *   CONFIRM_DELETE=YES npm run db:cleanup-orphans
 */
import { ObjectId } from "mongodb";
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

  console.log("=== cleanup-orphan-enrollments-referrals ===");
  console.log(confirmed ? "MODE: LIVE DELETE" : "MODE: DRY RUN (no changes)");

  const userIds = new Set<string>();
  for await (const user of usersCol.find({}, { projection: { _id: 1 } })) {
    const id = comparableId(user._id);
    if (id) {
      userIds.add(id);
    }
  }

  const validEnrollmentIds = new Set<string>();
  const orphanEnrollmentIds: DbId[] = [];

  for await (const enrollment of enrollmentsCol.find({}, { projection: { _id: 1, userId: 1 } })) {
    const enrollmentId = comparableId(enrollment._id);
    const userId = comparableId(enrollment.userId);
    if (userId && userIds.has(userId) && enrollmentId) {
      validEnrollmentIds.add(enrollmentId);
    } else {
      orphanEnrollmentIds.push(enrollment._id as DbId);
    }
  }

  const orphanReferralIds: DbId[] = [];
  for await (const referral of referralsCol.find(
    {},
    { projection: { _id: 1, referrerId: 1, refereeId: 1, enrollmentId: 1 } },
  )) {
    const referrerId = comparableId(referral.referrerId);
    const refereeId = comparableId(referral.refereeId);
    const enrollmentId = comparableId(referral.enrollmentId);
    const missingUser =
      !referrerId ||
      !refereeId ||
      !userIds.has(referrerId) ||
      !userIds.has(refereeId);
    const missingEnrollment = !enrollmentId || !validEnrollmentIds.has(enrollmentId);
    if (missingUser || missingEnrollment) {
      orphanReferralIds.push(referral._id as DbId);
    }
  }

  console.log(`\nUsers in database:        ${userIds.size}`);
  console.log(`Valid enrollments:        ${validEnrollmentIds.size}`);
  console.log(`Enrollments in database:  ${validEnrollmentIds.size + orphanEnrollmentIds.length}`);
  console.log(`Orphan enrollments:       ${orphanEnrollmentIds.length}`);
  console.log(`Orphan referrals:         ${orphanReferralIds.length}`);

  if (!confirmed) {
    console.log("\nDRY RUN complete. No data was changed.");
    console.log("Re-run with CONFIRM_DELETE=YES to perform the deletion.");
    await (await mongoClient()).close();
    return;
  }

  console.log("\nDeleting…");
  const referrals = await referralsCol.deleteMany({ _id: { $in: toObjectIds(orphanReferralIds) } });
  const enrollments = await enrollmentsCol.deleteMany({ _id: { $in: toObjectIds(orphanEnrollmentIds) } });

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

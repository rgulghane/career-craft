/**
 * Danger zone: wipe all data EXCEPT two whitelisted admin users.
 *
 * Keeps only these User documents (matched case-insensitively):
 *   - riteshgulghane@gmail.com   (admin)
 *   - testaccount@uniconnect.com (read-only admin)
 *
 * Deletes ALL documents from: Enrollment, Referral, RazorpayWebhookEvent,
 * and every User whose email is not in the keep-list.
 *
 * The Mentor collection (site content) is preserved by default; set
 * WIPE_MENTORS=1 to also clear it.
 *
 * SAFETY: this is a DRY RUN by default and deletes nothing. To actually
 * erase data you must pass CONFIRM_WIPE=ERASE.
 *
 *   Dry run (safe, just reports counts):
 *     npm run db:reset-keep-admins
 *
 *   Real deletion:
 *     CONFIRM_WIPE=ERASE npm run db:reset-keep-admins
 */
import { establishDatabaseConnection } from "../src/server/db/startup";
import { mongoClient } from "../src/server/db/mongo-client";
import { COLLECTIONS } from "../src/server/db/types";

const KEEP_EMAILS = ["riteshgulghane@gmail.com", "testaccount@uniconnect.com"];

// Case-insensitive comparison so e.g. Ritesh...@Gmail.com is never deleted.
const CASE_INSENSITIVE = { collation: { locale: "en", strength: 2 } } as const;

async function main(): Promise<void> {
  const confirmed = process.env.CONFIRM_WIPE === "ERASE";
  const wipeMentors = process.env.WIPE_MENTORS === "1";

  await establishDatabaseConnection();
  const db = (await mongoClient()).db();

  const userCol = db.collection(COLLECTIONS.users);
  const keepFilter = { email: { $in: KEEP_EMAILS } };
  const deleteUsersFilter = { email: { $nin: KEEP_EMAILS } };

  console.log("=== reset-data-keep-admins ===");
  console.log(confirmed ? "MODE: LIVE DELETE" : "MODE: DRY RUN (no changes)");
  console.log("Keeping users:", KEEP_EMAILS.join(", "));

  const keptUsers = await userCol
    .find(keepFilter, { projection: { email: 1, fullName: 1, userType: 1 } })
    .collation(CASE_INSENSITIVE.collation)
    .toArray();

  console.log(`\nMatched ${keptUsers.length}/${KEEP_EMAILS.length} keep-list users:`);
  for (const u of keptUsers) {
    console.log(`  - ${u.email} (${u.userType ?? "no type"})`);
  }
  if (keptUsers.length < KEEP_EMAILS.length) {
    console.warn(
      "\nWARNING: not all keep-list users were found. Aborting to avoid an unsafe wipe.",
    );
    if (confirmed) {
      process.exitCode = 1;
      await closeConnection();
      return;
    }
  }

  const counts = {
    usersToDelete: await userCol.countDocuments(deleteUsersFilter, CASE_INSENSITIVE),
    enrollments: await db.collection(COLLECTIONS.enrollments).countDocuments({}),
    referrals: await db.collection(COLLECTIONS.referrals).countDocuments({}),
    webhookEvents: await db.collection(COLLECTIONS.razorpayWebhookEvents).countDocuments({}),
    mentors: await db.collection(COLLECTIONS.mentors).countDocuments({}),
  };

  console.log("\nDocuments that will be deleted:");
  console.log(`  User (non keep-list): ${counts.usersToDelete}`);
  console.log(`  Enrollment:           ${counts.enrollments}`);
  console.log(`  Referral:             ${counts.referrals}`);
  console.log(`  RazorpayWebhookEvent: ${counts.webhookEvents}`);
  console.log(`  Mentor:               ${wipeMentors ? counts.mentors : "0 (preserved)"}`);

  if (!confirmed) {
    console.log("\nDRY RUN complete. No data was changed.");
    console.log("Re-run with CONFIRM_WIPE=ERASE to perform the deletion.");
    await closeConnection();
    return;
  }

  console.log("\nDeleting…");
  const users = await userCol.deleteMany(deleteUsersFilter, CASE_INSENSITIVE);
  const enrollments = await db.collection(COLLECTIONS.enrollments).deleteMany({});
  const referrals = await db.collection(COLLECTIONS.referrals).deleteMany({});
  const webhookEvents = await db.collection(COLLECTIONS.razorpayWebhookEvents).deleteMany({});
  const mentors = wipeMentors
    ? await db.collection(COLLECTIONS.mentors).deleteMany({})
    : { deletedCount: 0 };

  console.log("\nDeleted:");
  console.log(`  User:                 ${users.deletedCount}`);
  console.log(`  Enrollment:           ${enrollments.deletedCount}`);
  console.log(`  Referral:             ${referrals.deletedCount}`);
  console.log(`  RazorpayWebhookEvent: ${webhookEvents.deletedCount}`);
  console.log(`  Mentor:               ${mentors.deletedCount}`);
  console.log(`\nUsers remaining: ${await userCol.countDocuments({})}`);

  await closeConnection();
}

async function closeConnection(): Promise<void> {
  await (await mongoClient()).close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Create or update an admin user.
 *
 * Usage (from apps/web):
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='secret' npm run db:create-admin
 */
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { establishDatabaseConnection } from "../src/server/db/startup";

/** Keep in sync with `AUTH.bcryptCostFactor` in `@career-craft/shared`. */
const BCRYPT_COST_FACTOR = 12;
import { mongoClient } from "../src/server/db/mongo-client";
import { COLLECTIONS } from "../src/server/db/types";

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
    process.exit(1);
  }

  await establishDatabaseConnection();
  const client = await mongoClient();
  const users = client.db().collection(COLLECTIONS.users);
  const now = new Date();
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

  const existing = await users.findOne({ email });
  if (existing) {
    await users.updateOne(
      { _id: existing._id },
      {
        $set: {
          userType: "admin",
          passwordHash,
          fullName,
          updatedAt: now,
        },
      },
    );
    console.log(`Updated admin user: ${email}`);
  } else {
    await users.insertOne({
      _id: new ObjectId(),
      email,
      passwordHash,
      fullName,
      userType: "admin",
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Created admin user: ${email}`);
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

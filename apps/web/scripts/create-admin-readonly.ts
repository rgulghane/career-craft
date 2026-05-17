/**
 * Create or update a read-only admin user.
 *
 *   ADMIN_EMAIL=viewer@example.com ADMIN_PASSWORD='secret' npm run db:create-admin-readonly
 */
import { upsertPortalAdminWithConnection, closeDb } from "./upsert-portal-admin";

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME?.trim() || "Read-only Admin";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
    process.exit(1);
  }

  const result = await upsertPortalAdminWithConnection({
    email,
    password,
    fullName,
    userType: "admin-readonly",
  });
  console.log(`${result === "created" ? "Created" : "Updated"} read-only admin: ${email}`);
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

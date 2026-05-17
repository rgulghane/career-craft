/**
 * Create multiple read-only admins from a CSV file.
 *
 * File format (one per line, no header):
 *   email,fullName,password
 *
 *   ADMIN_USERS_FILE=./readonly-admins.csv npm run db:create-readonly-admins-batch
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { upsertPortalAdminWithConnection, closeDb } from "./upsert-portal-admin";

function parseLine(line: string, lineNo: number): { email: string; fullName: string; password: string } {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    throw new Error("skip");
  }
  const parts = trimmed.split(",").map((p) => p.trim());
  if (parts.length < 3) {
    throw new Error(`Line ${lineNo}: expected email,fullName,password`);
  }
  const [email, fullName, password] = parts;
  if (!email || !fullName || !password) {
    throw new Error(`Line ${lineNo}: missing field`);
  }
  return { email: email.toLowerCase(), fullName, password };
}

async function main(): Promise<void> {
  const file = process.env.ADMIN_USERS_FILE;
  if (!file) {
    console.error("Set ADMIN_USERS_FILE to a CSV path (email,fullName,password per line).");
    process.exit(1);
  }

  const path = resolve(process.cwd(), file);
  const content = readFileSync(path, "utf8");
  const lines = content.split(/\r?\n/);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const lineNo = i + 1;
    try {
      const row = parseLine(lines[i] ?? "", lineNo);
      const result = await upsertPortalAdminWithConnection({
        ...row,
        userType: "admin-readonly",
      });
      if (result === "created") {
        created += 1;
        console.log(`Created: ${row.email}`);
      } else {
        updated += 1;
        console.log(`Updated: ${row.email}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "skip") {
        skipped += 1;
        continue;
      }
      console.error(err instanceof Error ? err.message : err);
      process.exitCode = 1;
    }
  }

  console.log(`Done. created=${created} updated=${updated} skipped=${skipped}`);
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

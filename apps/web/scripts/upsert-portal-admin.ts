import { establishDatabaseConnection } from "../src/server/db/startup";
import { mongoClient } from "../src/server/db/mongo-client";
import {
  upsertPortalAdmin,
  type UpsertPortalAdminInput,
} from "../src/server/db/upsert-portal-admin";

export type { UpsertPortalAdminInput };

export async function upsertPortalAdminWithConnection(
  input: UpsertPortalAdminInput,
): Promise<"created" | "updated"> {
  await establishDatabaseConnection();
  return upsertPortalAdmin(input);
}

export async function closeDb(): Promise<void> {
  await (await mongoClient()).close();
}

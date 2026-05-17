import "server-only";

import type { AdminCreateReadonlyAdminBody } from "@career-craft/shared";
import { PORTAL_ADMIN_TYPES } from "@career-craft/shared";
import "../../db/load-env";
import { mapUser, toDbId } from "../../db/helpers";
import { usersCollection } from "../../db/mongo-client";
import { AdminServiceError } from "./errors";
import { upsertPortalAdmin } from "../../db/upsert-portal-admin";

export interface PortalAdminListItem {
  id: string;
  email: string;
  fullName: string;
  userType: "admin" | "admin-readonly";
  createdAt: string;
}

export async function listPortalAdmins(): Promise<PortalAdminListItem[]> {
  const users = await usersCollection();
  const docs = await users
    .find({ userType: { $in: [...PORTAL_ADMIN_TYPES] } })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((doc) => {
    const u = mapUser(doc);
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      userType: u.userType as "admin" | "admin-readonly",
      createdAt: u.createdAt.toISOString(),
    };
  });
}

export async function createReadonlyPortalAdmin(
  body: AdminCreateReadonlyAdminBody,
): Promise<PortalAdminListItem> {
  const email = body.email.trim().toLowerCase();
  const users = await usersCollection();
  const existing = await users.findOne({ email });
  if (existing && existing.userType === "admin") {
    throw new AdminServiceError(409, "This email belongs to an administrator account.");
  }

  const result = await upsertPortalAdmin({
    email,
    password: body.password,
    fullName: body.fullName,
    userType: "admin-readonly",
  });

  const doc = await users.findOne({ email });
  if (!doc) {
    throw new AdminServiceError(500, `Failed to load admin after ${result}`);
  }
  const u = mapUser(doc);
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    userType: "admin-readonly",
    createdAt: u.createdAt.toISOString(),
  };
}

/** Demote a read-only admin back to student (they keep password for /login). */
export async function revokeReadonlyPortalAdmin(userId: string): Promise<void> {
  const users = await usersCollection();
  const doc = await users.findOne({ _id: toDbId(userId) });
  if (!doc) {
    throw new AdminServiceError(404, "Admin not found");
  }
  if (doc.userType !== "admin-readonly") {
    throw new AdminServiceError(400, "Only viewer accounts can be removed.");
  }
  await users.updateOne(
    { _id: toDbId(userId) },
    { $set: { userType: "student", updatedAt: new Date() } },
  );
}

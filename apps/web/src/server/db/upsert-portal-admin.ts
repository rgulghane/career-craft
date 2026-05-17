/**
 * Shared portal-admin upsert (no server-only — safe for CLI scripts via tsx).
 */
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import type { PortalAdminType } from "@career-craft/shared";
import { usersCollection } from "./mongo-client";

const BCRYPT_COST_FACTOR = 12;

export interface UpsertPortalAdminInput {
  email: string;
  password: string;
  fullName: string;
  userType: PortalAdminType;
}

export async function upsertPortalAdmin(input: UpsertPortalAdminInput): Promise<"created" | "updated"> {
  const email = input.email.trim().toLowerCase();
  const users = await usersCollection();
  const now = new Date();
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST_FACTOR);

  const existing = await users.findOne({ email });
  if (existing) {
    await users.updateOne(
      { _id: existing._id },
      {
        $set: {
          userType: input.userType,
          passwordHash,
          fullName: input.fullName,
          updatedAt: now,
        },
      },
    );
    return "updated";
  }

  await users.insertOne({
    _id: new ObjectId(),
    email,
    passwordHash,
    fullName: input.fullName,
    userType: input.userType,
    createdAt: now,
    updatedAt: now,
  });
  return "created";
}

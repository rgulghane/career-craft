import "server-only";

import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { AUTH, type LoginBody, type RegisterBody } from "@career-craft/shared";
import "../db/load-env";
import { mapUser } from "../db/helpers";
import { usersCollection } from "../db/mongo-client";
import { signToken } from "../auth-tokens";

export interface AuthResult {
  token: string;
  user: { id: string; email: string; fullName: string };
}

export class AuthError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function registerUser(body: RegisterBody): Promise<AuthResult> {
  const users = await usersCollection();
  const existing = await users.findOne({ email: body.email });
  if (existing) {
    throw new AuthError(409, "email_taken", "Email already registered");
  }

  const now = new Date();
  const doc = {
    _id: new ObjectId(),
    email: body.email,
    passwordHash: await bcrypt.hash(body.password, AUTH.bcryptCostFactor),
    fullName: body.fullName,
    referralCode: null,
    createdAt: now,
    updatedAt: now,
  };
  await users.insertOne(doc);
  const user = mapUser(doc);

  return {
    token: signToken(user.id, user.email),
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}

export async function loginUser(body: LoginBody): Promise<AuthResult> {
  const users = await usersCollection();
  const doc = await users.findOne({ email: body.email });
  if (!doc) {
    throw new AuthError(401, "invalid_credentials", "Invalid credentials");
  }
  const user = mapUser(doc);
  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) {
    throw new AuthError(401, "invalid_credentials", "Invalid credentials");
  }
  return {
    token: signToken(user.id, user.email),
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}

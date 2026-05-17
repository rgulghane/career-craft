import "server-only";

import bcrypt from "bcryptjs";
import { isAdminUserType, messages, type AdminLoginBody } from "@career-craft/shared";
import { signToken } from "../auth-tokens";
import { mapUser } from "../db/helpers";
import { usersCollection } from "../db/mongo-client";
import { AuthError } from "./auth";

export interface AdminAuthResult {
  token: string;
  user: { id: string; email: string; fullName: string };
}

export async function loginAdminUser(body: AdminLoginBody): Promise<AdminAuthResult> {
  const users = await usersCollection();
  const doc = await users.findOne({ email: body.email });
  if (!doc) {
    throw new AuthError(401, "invalid_credentials", messages.auth.invalidCredentials);
  }
  const user = mapUser(doc);
  if (!isAdminUserType(user.userType)) {
    throw new AuthError(403, "not_admin", messages.admin.forbidden);
  }
  if (!doc.passwordHash) {
    throw new AuthError(401, "invalid_credentials", messages.auth.invalidCredentials);
  }
  const ok = await bcrypt.compare(body.password, doc.passwordHash);
  if (!ok) {
    throw new AuthError(401, "invalid_credentials", messages.auth.invalidCredentials);
  }
  return {
    token: signToken(user.id, user.email, "admin"),
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}

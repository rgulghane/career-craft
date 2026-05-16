import "server-only";

import bcrypt from "bcryptjs";
import { AUTH, type LoginBody, type RegisterBody } from "@career-craft/shared";
import { prisma } from "../prisma";
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
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    throw new AuthError(409, "email_taken", "Email already registered");
  }
  const passwordHash = await bcrypt.hash(body.password, AUTH.bcryptCostFactor);
  const user = await prisma.user.create({
    data: { email: body.email, passwordHash, fullName: body.fullName },
  });
  return {
    token: signToken(user.id, user.email),
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}

export async function loginUser(body: LoginBody): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    throw new AuthError(401, "invalid_credentials", "Invalid credentials");
  }
  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) {
    throw new AuthError(401, "invalid_credentials", "Invalid credentials");
  }
  return {
    token: signToken(user.id, user.email),
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}

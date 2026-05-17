import "server-only";

import jwt from "jsonwebtoken";
import { AUTH, type UserType } from "@career-craft/shared";
import { serverConfig } from "@/lib/config";

export interface AuthPayload {
  sub: string;
  email: string;
  userType: UserType;
}

export function signToken(userId: string, email: string, userType: UserType): string {
  const payload: AuthPayload = { sub: userId, email, userType };
  return jwt.sign(payload, serverConfig.jwtSecret, { expiresIn: AUTH.jwtExpiresIn });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const payload = jwt.verify(token, serverConfig.jwtSecret) as AuthPayload;
    if (!payload.sub || !payload.email) {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      userType: payload.userType ?? "student",
    };
  } catch {
    return null;
  }
}

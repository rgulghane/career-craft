import "server-only";

import jwt from "jsonwebtoken";
import { AUTH } from "@career-craft/shared";
import { serverConfig } from "@/lib/config";

export interface AuthPayload {
  sub: string;
  email: string;
}

export function signToken(userId: string, email: string): string {
  const payload: AuthPayload = { sub: userId, email };
  return jwt.sign(payload, serverConfig.jwtSecret, { expiresIn: AUTH.jwtExpiresIn });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, serverConfig.jwtSecret) as AuthPayload;
  } catch {
    return null;
  }
}

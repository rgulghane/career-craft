import "server-only";

import { cookies } from "next/headers";
import { COOKIE_NAMES, type UserType } from "@career-craft/shared";
import "./db/load-env";
import { mapUser, toDbId } from "./db/helpers";
import { usersCollection } from "./db/mongo-client";
import { verifyToken } from "./auth-tokens";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  referralCode: string | null;
  userType: UserType;
}

/**
 * Resolve the current authenticated user from the auth cookie.
 * Returns null if the cookie is missing, the token is invalid, or the user is gone.
 */
export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAMES.authToken)?.value;
  if (!token) {
    return null;
  }
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const users = await usersCollection();
  const doc = await users.findOne({ _id: toDbId(payload.sub) });
  if (!doc) {
    return null;
  }
  const user = mapUser(doc);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    referralCode: user.referralCode,
    userType: user.userType ?? "student",
  };
}

/**
 * Read the auth token from headers (Bearer) or cookie.
 * For route handlers that may be called by external clients with a header.
 */
export function readAuthToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  return null;
}

async function sessionUserFromToken(token: string): Promise<SessionUser | null> {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }
  const users = await usersCollection();
  const doc = await users.findOne({ _id: toDbId(payload.sub) });
  if (!doc) {
    return null;
  }
  const user = mapUser(doc);
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    referralCode: user.referralCode,
    userType: user.userType ?? "student",
  };
}

/**
 * Session from Bearer token or auth cookie — for payment API route handlers.
 */
export async function getSessionFromRequest(request: Request): Promise<SessionUser | null> {
  const bearer = readAuthToken(request);
  if (bearer) {
    const fromBearer = await sessionUserFromToken(bearer);
    if (fromBearer) {
      return fromBearer;
    }
  }
  return getSession();
}

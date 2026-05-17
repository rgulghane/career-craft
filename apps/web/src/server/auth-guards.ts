import "server-only";

import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { messages } from "@career-craft/shared";
import { cookies } from "next/headers";
import { COOKIE_NAMES, isAdminUserType } from "@career-craft/shared";
import { verifyToken } from "./auth-tokens";
import { getSession, type SessionUser } from "./auth-session";

export class AdminAuthError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

export type AdminSessionUser = SessionUser & { userType: "admin" };

/** Resolve session and ensure the account is an admin (JWT + DB check). */
export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAMES.authToken)?.value;
  if (token) {
    const payload = verifyToken(token);
    if (!payload || !isAdminUserType(payload.userType)) {
      return null;
    }
  }

  const session = await getSession();
  if (!session || !isAdminUserType(session.userType)) {
    return null;
  }
  return session as AdminSessionUser;
}

/** Server Component / server action guard — redirects to admin login. */
export async function requireAdminPage(nextPath?: string): Promise<AdminSessionUser> {
  const admin = await getAdminSession();
  if (!admin) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/admin/login${next}`);
  }
  return admin;
}

/** API route guard — returns admin session or throws AdminAuthError. */
export async function requireAdminApi(): Promise<AdminSessionUser> {
  const admin = await getAdminSession();
  if (!admin) {
    throw new AdminAuthError(401, messages.errors.unauthorized);
  }
  return admin;
}

export function adminAuthErrorResponse(err: unknown): NextResponse {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return NextResponse.json({ error: messages.errors.generic }, { status: 500 });
}

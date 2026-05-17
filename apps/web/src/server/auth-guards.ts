import "server-only";

import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  COOKIE_NAMES,
  isPortalAdminUserType,
  isReadOnlyAdminUserType,
  messages,
  type PortalAdminType,
} from "@career-craft/shared";
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

export type AdminSessionUser = SessionUser & {
  userType: PortalAdminType;
  readOnly: boolean;
};

function toAdminSession(session: SessionUser): AdminSessionUser | null {
  if (!isPortalAdminUserType(session.userType)) {
    return null;
  }
  return {
    ...session,
    userType: session.userType,
    readOnly: isReadOnlyAdminUserType(session.userType),
  };
}

/** Resolve session for any portal admin (full or read-only). */
export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAMES.authToken)?.value;
  if (token) {
    const payload = verifyToken(token);
    if (!payload || !isPortalAdminUserType(payload.userType)) {
      return null;
    }
  }

  const session = await getSession();
  if (!session) {
    return null;
  }
  return toAdminSession(session);
}

/** Server Component guard — any portal admin. */
export async function requireAdminPage(nextPath?: string): Promise<AdminSessionUser> {
  const admin = await getAdminSession();
  if (!admin) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/admin/login${next}`);
  }
  return admin;
}

/** Full admin only — redirects read-only users to overview. */
export async function requireFullAdminPage(): Promise<AdminSessionUser> {
  const admin = await requireAdminPage();
  if (admin.readOnly) {
    redirect("/admin?error=read_only");
  }
  return admin;
}

/** API — any portal admin (read). */
export async function requireAdminApi(): Promise<AdminSessionUser> {
  const admin = await getAdminSession();
  if (!admin) {
    throw new AdminAuthError(401, messages.errors.unauthorized);
  }
  return admin;
}

/** API — full admin only (write). */
export async function requireFullAdminApi(): Promise<AdminSessionUser> {
  const admin = await requireAdminApi();
  if (admin.readOnly) {
    throw new AdminAuthError(403, messages.admin.editForbidden);
  }
  return admin;
}

export function adminAuthErrorResponse(err: unknown): NextResponse {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return NextResponse.json({ error: messages.errors.generic }, { status: 500 });
}

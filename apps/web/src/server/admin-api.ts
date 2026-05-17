import "server-only";

import { NextResponse } from "next/server";
import { messages } from "@career-craft/shared";
import { adminAuthErrorResponse, requireAdminApi, requireFullAdminApi } from "./auth-guards";
import { AdminServiceError } from "./services/admin/errors";

/** Read-only admin API routes (GET, exports). */
export async function withAdminApi(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    await requireAdminApi();
    return await handler();
  } catch (err) {
    if (err instanceof AdminServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return adminAuthErrorResponse(err);
  }
}

/** Mutating admin API routes — full admin only. */
export async function withFullAdminApi(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    await requireFullAdminApi();
    return await handler();
  } catch (err) {
    if (err instanceof AdminServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return adminAuthErrorResponse(err);
  }
}

export function adminServiceErrorResponse(err: unknown): NextResponse {
  if (err instanceof AdminServiceError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return NextResponse.json({ error: messages.errors.generic }, { status: 500 });
}

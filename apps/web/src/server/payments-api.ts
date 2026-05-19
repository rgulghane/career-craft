import "server-only";

import { NextResponse } from "next/server";
import { messages } from "@career-craft/shared";
import { getSessionFromRequest } from "./auth-session";
import { EnrollmentError } from "./errors";

export async function requirePaymentSession(request: Request) {
  const user = await getSessionFromRequest(request);
  if (!user) {
    throw new EnrollmentError(401, "unauthorized", messages.errors.unauthorized);
  }
  return user;
}

export function enrollmentErrorResponse(err: EnrollmentError): NextResponse {
  return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
}

export function paymentRouteErrorResponse(err: unknown): NextResponse {
  if (err instanceof EnrollmentError) {
    return enrollmentErrorResponse(err);
  }
  console.error("[payments api]", err);
  return NextResponse.json({ error: messages.errors.generic }, { status: 500 });
}

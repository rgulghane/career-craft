import { NextResponse } from "next/server";
import { messages, registerBodySchema } from "@career-craft/shared";
import { AuthError, registerUser } from "@/server/services/auth";
import { setSessionCookie } from "@/server/session-cookie";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: messages.errors.validation }, { status: 400 });
  }
  const parsed = registerBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: messages.errors.validation, details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const result = await registerUser(parsed.data);
    const res = NextResponse.json({ ok: true, user: result.user }, { status: 201 });
    setSessionCookie(res, result.token);
    return res;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: messages.errors.generic }, { status: 500 });
  }
}

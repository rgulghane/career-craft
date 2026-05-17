import { NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongo-client";

export const dynamic = "force-dynamic";

/** Render / Docker health checks — bounded retries so the probe finishes in ~10s. */
const HEALTH_CONNECT = { maxAttempts: 5, delayMs: 1000 } as const;

export async function GET() {
  try {
    await connectMongo(HEALTH_CONNECT);
    return NextResponse.json({ ok: true, db: "connected" });
  } catch (err) {
    console.error("[health] MongoDB unreachable:", err);
    return NextResponse.json({ ok: false, db: "disconnected" }, { status: 503 });
  }
}

import { NextResponse } from "next/server";
import { isDatabaseConnected } from "@/server/db/mongo-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbOk = await isDatabaseConnected();
  if (!dbOk) {
    return NextResponse.json({ ok: false, db: "disconnected" }, { status: 503 });
  }
  return NextResponse.json({ ok: true, db: "connected" });
}

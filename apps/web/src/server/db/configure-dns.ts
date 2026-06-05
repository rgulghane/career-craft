import dns from "node:dns";

const DEFAULT_PUBLIC_DNS = ["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"];

/**
 * Some routers / ISP resolvers refuse SRV queries, which breaks `mongodb+srv://`
 * in Node on Windows (`querySrv ECONNREFUSED`). Public DNS servers resolve Atlas SRV records.
 *
 * Idempotent — safe to call before every connection (Next.js can evaluate db modules
 * before env is ready, or in duplicate webpack chunks with separate module state).
 */
export function configureMongoDns(): void {
  if (process.env.MONGODB_DNS_OVERRIDE === "0") return;

  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url.startsWith("mongodb+srv://")) return;

  const force = process.env.MONGODB_USE_PUBLIC_DNS === "1";
  const onWindows = process.platform === "win32";
  if (!force && !onWindows) return;

  const fromEnv = process.env.MONGODB_DNS_SERVERS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  dns.setServers(fromEnv?.length ? fromEnv : DEFAULT_PUBLIC_DNS);
}

configureMongoDns();

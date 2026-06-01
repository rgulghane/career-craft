import dns from "node:dns";

let configured = false;

const DEFAULT_PUBLIC_DNS = ["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"];

/**
 * Some routers / ISP resolvers refuse SRV queries, which breaks `mongodb+srv://`
 * in Node on Windows (`querySrv ECONNREFUSED`). Public DNS servers resolve Atlas SRV records.
 */
export function configureMongoDns(): void {
  if (configured) return;
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
  configured = true;
}

configureMongoDns();

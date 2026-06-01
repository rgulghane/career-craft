import "server-only";

import "./configure-dns";
import { serverConfig } from "@/lib/config";

if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = serverConfig.databaseUrl;
}

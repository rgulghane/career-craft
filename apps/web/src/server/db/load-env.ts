import "server-only";

import { configureMongoDns } from "./configure-dns";
import { serverConfig } from "@/lib/config";

if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = serverConfig.databaseUrl;
}

configureMongoDns();

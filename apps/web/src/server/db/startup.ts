import { connectMongo } from "./mongo-client";

let startupPromise: Promise<void> | null = null;

/**
 * Connect to MongoDB and ensure indexes (used by db:setup script and optional warm-up).
 */
export async function establishDatabaseConnection(): Promise<void> {
  if (!startupPromise) {
    startupPromise = (async () => {
      console.info("[db] Connecting to MongoDB…");
      await connectMongo();
      console.info("[db] Ready.");
    })().catch((err) => {
      startupPromise = null;
      throw err;
    });
  }
  return startupPromise;
}

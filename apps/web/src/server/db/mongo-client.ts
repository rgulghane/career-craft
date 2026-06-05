import { configureMongoDns } from "./configure-dns";
import { MongoClient, type Collection, type MongoClientOptions } from "mongodb";
import {
  COLLECTIONS,
  type EnrollmentDocument,
  type MentorDocument,
  type RazorpayWebhookEventDocument,
  type ReferralDocument,
  type UserDocument,
} from "./types";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoReady?: Promise<MongoClient>;
  indexesEnsured?: boolean;
};

function connectionString(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    return url;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is not set");
  }
  return "mongodb://127.0.0.1:27017/career_craft";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mongoClientOptions(): MongoClientOptions {
  const options: MongoClientOptions = {
    serverSelectionTimeoutMS: 10_000,
  };
  // Some cloud hosts resolve Atlas to IPv6 first; set MONGODB_FORCE_IPV4=1 if needed.
  if (process.env.MONGODB_FORCE_IPV4 === "1") {
    options.family = 4;
  }
  return options;
}

async function ping(client: MongoClient): Promise<void> {
  await client.db().command({ ping: 1 });
}

/**
 * Connect to MongoDB with retries. Resolves only when the database is reachable.
 */
export async function connectMongo(options?: {
  maxAttempts?: number;
  delayMs?: number;
}): Promise<MongoClient> {
  if (globalForMongo.mongoClient) {
    return globalForMongo.mongoClient;
  }

  if (globalForMongo.mongoReady) {
    return globalForMongo.mongoReady;
  }

  const maxAttempts = options?.maxAttempts ?? Number(process.env.DB_CONNECT_MAX_ATTEMPTS ?? 30);
  const delayMs = options?.delayMs ?? Number(process.env.DB_CONNECT_DELAY_MS ?? 2000);

  globalForMongo.mongoReady = (async () => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      configureMongoDns();
      const client = new MongoClient(connectionString(), mongoClientOptions());
      try {
        await client.connect();
        await ping(client);
        globalForMongo.mongoClient = client;
        if (!globalForMongo.indexesEnsured) {
          globalForMongo.indexesEnsured = true;
          const { ensureIndexes } = await import("./ensure-indexes");
          await ensureIndexes();
        }
        return client;
      } catch (err) {
        lastError = err;
        await client.close().catch(() => undefined);
        if (attempt < maxAttempts) {
          console.warn(
            `[db] Connection attempt ${attempt}/${maxAttempts} failed; retrying in ${delayMs}ms…`,
          );
          await sleep(delayMs);
        }
      }
    }
    globalForMongo.mongoReady = undefined;
    throw lastError instanceof Error
      ? lastError
      : new Error("Failed to connect to MongoDB after multiple attempts.");
  })();

  return globalForMongo.mongoReady;
}

/** Shared MongoClient — connects on first use if needed. */
export async function mongoClient(): Promise<MongoClient> {
  return connectMongo();
}

export async function isDatabaseConnected(options?: {
  maxAttempts?: number;
  delayMs?: number;
}): Promise<boolean> {
  try {
    const client = await connectMongo({
      maxAttempts: options?.maxAttempts ?? 3,
      delayMs: options?.delayMs ?? 1000,
    });
    await ping(client);
    return true;
  } catch {
    return false;
  }
}

export async function usersCollection(): Promise<Collection<UserDocument>> {
  return (await mongoClient()).db().collection<UserDocument>(COLLECTIONS.users);
}

export async function enrollmentsCollection(): Promise<Collection<EnrollmentDocument>> {
  return (await mongoClient()).db().collection<EnrollmentDocument>(COLLECTIONS.enrollments);
}

export async function referralsCollection(): Promise<Collection<ReferralDocument>> {
  return (await mongoClient()).db().collection<ReferralDocument>(COLLECTIONS.referrals);
}

export async function razorpayWebhookEventsCollection(): Promise<
  Collection<RazorpayWebhookEventDocument>
> {
  return (await mongoClient())
    .db()
    .collection<RazorpayWebhookEventDocument>(COLLECTIONS.razorpayWebhookEvents);
}

export async function mentorsCollection(): Promise<Collection<MentorDocument>> {
  return (await mongoClient()).db().collection<MentorDocument>(COLLECTIONS.mentors);
}

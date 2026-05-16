import { MongoClient, type Collection } from "mongodb";
import {
  COLLECTIONS,
  type EnrollmentDocument,
  type ReferralDocument,
  type UserDocument,
} from "./types";

const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };

function connectionString(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

/** Shared MongoClient instance (connects once per process). */
export async function mongoClient(): Promise<MongoClient> {
  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(connectionString());
    await globalForMongo.mongoClient.connect();
  }
  return globalForMongo.mongoClient;
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

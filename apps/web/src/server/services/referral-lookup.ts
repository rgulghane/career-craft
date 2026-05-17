import "server-only";

import "../db/load-env";
import { mapUser } from "../db/helpers";
import { usersCollection } from "../db/mongo-client";

export interface ReferralLookupResult {
  valid: true;
  referrerName: string;
  referrerFirstName: string;
}

export async function lookupReferrerByCode(
  rawCode: string,
  currentUserId?: string | null,
): Promise<ReferralLookupResult | null> {
  const code = rawCode.trim().toUpperCase();
  if (code.length < 4) {
    return null;
  }

  const users = await usersCollection();
  const doc = await users.findOne({ referralCode: code });
  if (!doc) {
    return null;
  }

  const referrer = mapUser(doc);
  if (currentUserId && referrer.id === currentUserId) {
    return null;
  }

  const referrerFirstName = referrer.fullName.split(/\s+/)[0] ?? referrer.fullName;

  return {
    valid: true,
    referrerName: referrer.fullName,
    referrerFirstName,
  };
}

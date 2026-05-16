import "server-only";

import { randomBytes } from "node:crypto";
import { REFERRAL_POLICY } from "@career-craft/shared";

const alphabet = REFERRAL_POLICY.referralCodeAlphabet;

export function generateReferralCode(): string {
  const bytes = randomBytes(REFERRAL_POLICY.referralCodeLength);
  let out = "";
  for (let i = 0; i < REFERRAL_POLICY.referralCodeLength; i += 1) {
    const idx = bytes[i] ?? 0;
    out += alphabet[idx % alphabet.length] ?? "X";
  }
  return out;
}

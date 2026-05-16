/** Business rules aligned with the referral product spec (tune via env). */

export const PROGRAM = {
  name: "CareerCraft AI",
  defaultCurrency: "INR",
} as const;

export const PRICING = {
  standardInPaise: 500_000, // ₹5,000
  withReferralCodeInPaise: 250_000, // ₹2,500
} as const;

export const REFERRAL_POLICY = {
  /** Cash reward per qualified referral (paise). */
  cashPerReferralPaise: 50_000, // ₹500
  /** Days after payment before a referral qualifies (refund window). */
  refundWindowDays: 7,
  referralCodeLength: 10,
  /** Character set used to generate referral codes (omits visually ambiguous chars). */
  referralCodeAlphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  milestones: {
    silverReferrals: 50,
    goldReferrals: 100,
    diamondReferrals: 500,
  },
} as const;

export const SITE_DEFAULTS = {
  /** Used as a last-resort origin for share links when no env is set. */
  fallbackOrigin: "http://localhost:3000",
} as const;

export const COOKIE_NAMES = {
  authToken: "cc_auth_token",
} as const;

export const AUTH = {
  /** Lifetime of the JWT signed for newly authenticated users. */
  jwtExpiresIn: "30d",
  /** httpOnly cookie max-age in seconds (kept in sync with jwtExpiresIn). */
  sessionCookieMaxAgeSeconds: 60 * 60 * 24 * 30,
  /** bcrypt cost factor used when hashing passwords. */
  bcryptCostFactor: 12,
} as const;

export const INTERNAL = {
  /** Header that protects internal cron endpoints. */
  cronSecretHeader: "x-cron-secret",
} as const;

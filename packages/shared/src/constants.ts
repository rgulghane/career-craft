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
  referralCodeLength: 6,
  /** Character set used to generate referral codes (omits visually ambiguous chars). */
  referralCodeAlphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  milestones: {
    silverReferrals: 50,
    goldReferrals: 100,
    diamondReferrals: 500,
  },
} as const;

/** Trim and uppercase; strips non-alphanumeric characters. */
export function normalizeReferralCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function referralCodeUsesAlphabet(code: string): boolean {
  for (const char of code) {
    if (!REFERRAL_POLICY.referralCodeAlphabet.includes(char)) {
      return false;
    }
  }
  return true;
}

/** Validates referral codes (exactly `referralCodeLength` chars from the allowed alphabet). */
export function isValidReferralCodeFormat(code: string): boolean {
  return code.length === REFERRAL_POLICY.referralCodeLength && referralCodeUsesAlphabet(code);
}

const APP_ORIGIN_ENV_KEYS = ["APP_ORIGIN", "NEXT_PUBLIC_APP_ORIGIN"] as const;

/**
 * Canonical site origin from env (no trailing slash).
 * Set `APP_ORIGIN` in apps/web — see `.env.example`.
 */
export function getSiteOrigin(): string {
  for (const key of APP_ORIGIN_ENV_KEYS) {
    const raw = process.env[key]?.trim();
    if (raw) {
      return raw.replace(/\/$/, "");
    }
  }
  return "";
}

/** WhatsApp support chat copy. */
export const SUPPORT_WHATSAPP = {
  defaultMessage: "Hi! I'd like to know more about CareerCraft AI.",
} as const;

const WHATSAPP_ENV_KEYS = ["NEXT_PUBLIC_WHATSAPP_NUMBER", "WHATSAPP_NUMBER"] as const;

/**
 * WhatsApp number from env (country code + number, digits only).
 * Set `NEXT_PUBLIC_WHATSAPP_NUMBER` or `WHATSAPP_NUMBER` in apps/web.
 */
export function getSupportWhatsAppNumber(): string {
  for (const key of WHATSAPP_ENV_KEYS) {
    const raw = process.env[key]?.trim();
    if (raw) {
      return raw.replace(/\D/g, "");
    }
  }
  return "";
}

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

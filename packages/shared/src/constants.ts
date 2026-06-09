/** Business rules aligned with the referral product spec (tune via env). */

export const PROGRAM = {
  name: "AI Career Launchpad",
  defaultCurrency: "INR",
} as const;

/** Default course fees (INR rupees). Used as enrollment fallback when admin has not set custom prices. */
export const DEFAULT_PRICING = {
  standardInRupees: 5_000,
  withReferralCodeInRupees: 2_500,
} as const;

/** Same default standard fee used by enrollment when no admin override is saved. */
export const ENROLLMENT_STANDARD_PRICE_IN_RUPEES = DEFAULT_PRICING.standardInRupees;

/** Server + build-time; use for payments and SSR. */
const REFERRAL_PRICE_ENV_KEYS = ["REFERRAL_PRICE", "NEXT_PUBLIC_REFERRAL_PRICE"] as const;

const CASH_PER_REFERRAL_ENV_KEYS = ["CASH_PER_REFERRAL", "NEXT_PUBLIC_CASH_PER_REFERRAL"] as const;

function readMoneyRupees(
  keys: readonly string[],
  fallback: number,
): number {
  for (const key of keys) {
    const raw = process.env[key]?.trim();
    if (!raw) {
      continue;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid number for env var ${key}: ${raw}`);
    }
    return parsed;
  }
  return fallback;
}

/** Standard enrollment price (rupees). Matches the enrollment fallback in `getPricingSettings()`. */
export function getStandardPriceInRupees(): number {
  return ENROLLMENT_STANDARD_PRICE_IN_RUPEES;
}

/** Price when a valid referral code is applied (rupees). Override via `REFERRAL_PRICE`. */
export function getReferralPriceInRupees(): number {
  return readMoneyRupees(
    REFERRAL_PRICE_ENV_KEYS,
    DEFAULT_PRICING.withReferralCodeInRupees,
  );
}

/** Cash reward per qualified referral (rupees). Override via `CASH_PER_REFERRAL`. */
export function getCashPerReferralInRupees(): number {
  return readMoneyRupees(CASH_PER_REFERRAL_ENV_KEYS, 500);
}

/** Env-driven pricing (server + client). Amounts in rupees. */
export const PRICING = {
  get standardInRupees(): number {
    return getStandardPriceInRupees();
  },
  get withReferralCodeInRupees(): number {
    return getReferralPriceInRupees();
  },
};

export const REFERRAL_POLICY = {
  /** Days after payment before a referral qualifies (refund window). */
  refundWindowDays: 30,
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

/** Validates auto-generated referral codes (exactly 6 chars from the allowed alphabet). */
export function isValidReferralCodeFormat(code: string): boolean {
  return code.length === REFERRAL_POLICY.referralCodeLength && referralCodeUsesAlphabet(code);
}

/** Accepted lengths for admin-assigned and user-entered referral codes. */
export const REFERRAL_CODE_INPUT = {
  minLength: 6,
  maxLength: 12,
} as const;

/** Validates referral codes at enrollment / lookup (custom admin codes or auto-generated). */
export function isValidReferralCodeInput(code: string): boolean {
  const normalized = normalizeReferralCode(code);
  if (!normalized) {
    return false;
  }
  if (
    normalized.length < REFERRAL_CODE_INPUT.minLength ||
    normalized.length > REFERRAL_CODE_INPUT.maxLength
  ) {
    return false;
  }
  return /^[A-Z0-9]+$/.test(normalized);
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
  defaultMessage: "Hi! I'd like to know more about AI Career Launchpad.",
} as const;

const WHATSAPP_ENV_KEYS = ["WHATSAPP_NUMBER"] as const;

/**
 * WhatsApp number from env (country code + number, digits only).
 * Set `WHATSAPP_NUMBER` in apps/web.
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

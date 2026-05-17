import "server-only";

/**
 * Single source of truth for server-side runtime configuration.
 *
 * Values are resolved lazily via getters so that Next's build-time module
 * evaluation never fails when a runtime-only env var (e.g. DATABASE_URL) is
 * absent. Required env vars are validated the first time they're accessed in
 * production.
 */

const PRODUCTION_BUILD_PHASE = "phase-production-build";

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === PRODUCTION_BUILD_PHASE;
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return fallback;
  }
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number for env var ${name}: ${raw}`);
  }
  return parsed;
}

function readString(name: string, fallback: string): string {
  const v = process.env[name];
  if (v === undefined || v === "") {
    return fallback;
  }
  return v;
}

function readRequired(name: string, devFallback: string): string {
  const v = process.env[name];
  if (v && v !== "") {
    return v;
  }
  if (process.env.NODE_ENV === "production" && !isBuildPhase()) {
    throw new Error(`Missing required env var in production: ${name}`);
  }
  return devFallback;
}

export const serverConfig = {
  get databaseUrl() {
    return readRequired(
      "DATABASE_URL",
      "mongodb://127.0.0.1:27017/career_craft",
    );
  },
  get jwtSecret() {
    return readRequired("JWT_SECRET", "dev-only-change-me-please-32chars-min");
  },
  get cronSecret() {
    return readRequired("CRON_SECRET", "dev-cron-secret");
  },
  get appOrigin() {
    return readString("APP_ORIGIN", "http://localhost:3000");
  },
  google: {
    get clientId() {
      return readString("GOOGLE_CLIENT_ID", "");
    },
    get clientSecret() {
      return readString("GOOGLE_CLIENT_SECRET", "");
    },
    get configured() {
      return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    },
  },
  pricing: {
    get standardInPaise() {
      return readNumber("STANDARD_PRICE_PAISE", 500_000);
    },
    get withReferralInPaise() {
      return readNumber("REFERRAL_PRICE_PAISE", 250_000);
    },
  },
  referral: {
    get cashPerReferralPaise() {
      return readNumber("CASH_PER_REFERRAL_PAISE", 50_000);
    },
    get refundWindowDays() {
      return readNumber("REFUND_WINDOW_DAYS", 7);
    },
  },
  razorpay: {
    get keyId() {
      return readRequired("RAZORPAY_KEY_ID", "");
    },
    get keySecret() {
      return readRequired("RAZORPAY_KEY_SECRET", "");
    },
    get webhookSecret() {
      return readRequired("RAZORPAY_WEBHOOK_SECRET", "");
    },
    get configured() {
      return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    },
    get webhookConfigured() {
      return Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
    },
  },
} as const;

export type ServerConfig = typeof serverConfig;

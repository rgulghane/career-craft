import { isValidReferralCodeInput, normalizeReferralCode } from "@career-craft/shared";

const CODE_KEY = "cc_referral_code";
const REFERRER_NAME_KEY = "cc_referrer_first_name";

export type StoredReferral = {
  code: string;
  referrerFirstName: string | null;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function readStoredReferral(): StoredReferral | null {
  if (!canUseStorage()) {
    return null;
  }
  const code = normalizeReferralCode(window.localStorage.getItem(CODE_KEY) ?? "");
  if (!isValidReferralCodeInput(code)) {
    return null;
  }
  const referrerFirstName = window.localStorage.getItem(REFERRER_NAME_KEY)?.trim() || null;
  return { code, referrerFirstName };
}

export function writeStoredReferral(code: string, referrerFirstName?: string | null): void {
  if (!canUseStorage()) {
    return;
  }
  const normalized = normalizeReferralCode(code);
  if (!isValidReferralCodeInput(normalized)) {
    return;
  }
  window.localStorage.setItem(CODE_KEY, normalized);
  if (referrerFirstName?.trim()) {
    window.localStorage.setItem(REFERRER_NAME_KEY, referrerFirstName.trim());
  }
}

export function clearStoredReferral(): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(CODE_KEY);
  window.localStorage.removeItem(REFERRER_NAME_KEY);
}

/** Prefer URL referral code; otherwise fall back to localStorage. */
export function resolveReferralCode(urlCode: string): string {
  const fromUrl = normalizeReferralCode(urlCode);
  if (isValidReferralCodeInput(fromUrl)) {
    return fromUrl;
  }
  return readStoredReferral()?.code ?? "";
}

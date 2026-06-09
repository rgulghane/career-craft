import { z } from "zod";
import {
  REFERRAL_CODE_INPUT,
  isValidReferralCodeInput,
  normalizeReferralCode,
} from "./constants.js";
import { authSignupProfileSchema, fullNameTwoWordsSchema, phoneTenDigitsSchema } from "./auth-profile.js";

export const emailSchema = z.string().trim().email();

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export const registerBodySchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .merge(authSignupProfileSchema);

export { fullNameTwoWordsSchema, phoneTenDigitsSchema };

export const loginBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const referralCodeMessage = `Referral code must be ${REFERRAL_CODE_INPUT.minLength}–${REFERRAL_CODE_INPUT.maxLength} letters or numbers`;

/** Required referral code (custom or auto-generated format). */
export const referralCodeSchema = z
  .string()
  .trim()
  .transform(normalizeReferralCode)
  .refine(isValidReferralCodeInput, { message: referralCodeMessage });

/** Empty string or a valid referral code. */
export const optionalReferralCodeSchema = z
  .string()
  .trim()
  .transform(normalizeReferralCode)
  .refine((code) => code === "" || isValidReferralCodeInput(code), { message: referralCodeMessage });

export const enrollBodySchema = z.object({
  referralCode: optionalReferralCodeSchema.optional().or(z.literal("")),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type EnrollBody = z.infer<typeof enrollBodySchema>;

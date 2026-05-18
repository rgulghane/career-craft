import { z } from "zod";
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

export const enrollBodySchema = z.object({
  referralCode: z
    .string()
    .trim()
    .min(4, "Referral code is too short")
    .max(32)
    .optional()
    .or(z.literal("")),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type EnrollBody = z.infer<typeof enrollBodySchema>;

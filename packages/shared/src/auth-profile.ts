import { z } from "zod";

export function normalizeIndianPhone(input: string): string {
  return input.replace(/\D/g, "");
}

export function isValidFullNameTwoWords(fullName: string): boolean {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2 && parts.every((p) => p.length >= 1);
}

export function isValidIndianPhone(phone: string): boolean {
  return normalizeIndianPhone(phone).length === 10;
}

export function isValidAuthProfile(fullName: string, phone: string): boolean {
  return isValidFullNameTwoWords(fullName) && isValidIndianPhone(phone);
}

export const fullNameTwoWordsSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .refine(isValidFullNameTwoWords, {
    message: "Enter your first and last name (at least two words)",
  });

export const phoneTenDigitsSchema = z
  .string()
  .trim()
  .transform(normalizeIndianPhone)
  .refine((digits) => digits.length === 10, {
    message: "Enter a valid 10-digit mobile number",
  });

export const collegeNameSchema = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.string().trim().max(200).optional(),
);

export const authSignupProfileSchema = z.object({
  fullName: fullNameTwoWordsSchema,
  phone: phoneTenDigitsSchema,
  collegeName: collegeNameSchema,
});

export type AuthSignupProfile = z.infer<typeof authSignupProfileSchema>;

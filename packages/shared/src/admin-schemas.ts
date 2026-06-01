import { z } from "zod";
import { USER_TYPES } from "./user-types.js";
import { emailSchema, optionalReferralCodeSchema, passwordSchema } from "./schemas.js";

export const adminLoginBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const adminUserListQuerySchema = z.object({
  q: z.string().optional(),
  userType: z.enum(USER_TYPES).optional(),
  enrolled: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const adminUpdateUserBodySchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  email: emailSchema.optional(),
  userType: z.enum(USER_TYPES).optional(),
  referralCode: optionalReferralCodeSchema.nullable().optional(),
});

export const adminEnrollmentListQuerySchema = z.object({
  status: z.enum(["PENDING", "PAID", "REFUNDED"]).optional(),
  userId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const adminUpdateEnrollmentBodySchema = z.object({
  status: z.enum(["PENDING", "PAID", "REFUNDED"]).optional(),
  amountInRupees: z.number().int().positive().optional(),
  referralCodeUsed: optionalReferralCodeSchema.nullable().optional(),
  referrerId: z.string().nullable().optional(),
  markPaid: z.boolean().optional(),
});

export const adminReferralListQuerySchema = z.object({
  status: z.string().optional(),
  referrerId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const adminVoidReferralBodySchema = z.object({
  voidReason: z.string().trim().min(1).max(500),
});

export const adminExportQuerySchema = z.object({
  type: z.enum(["users", "enrollments", "referrals"]),
});

export const adminCreateReadonlyAdminBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(1).max(120),
});

export type AdminLoginBody = z.infer<typeof adminLoginBodySchema>;
export type AdminCreateReadonlyAdminBody = z.infer<typeof adminCreateReadonlyAdminBodySchema>;
export type AdminUpdateUserBody = z.infer<typeof adminUpdateUserBodySchema>;
export type AdminUpdateEnrollmentBody = z.infer<typeof adminUpdateEnrollmentBodySchema>;

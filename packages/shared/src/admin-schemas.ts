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

export const adminGrantDirectEnrollmentBodySchema = z.object({
  /** Optional note explaining why payment is waived (audit trail). */
  reason: z.string().trim().max(500).optional(),
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

const optionalUrlSchema = z
  .union([z.string().trim().url().max(1000), z.literal("")])
  .default("");

/** Editable content fields shown on a mentor spotlight card. */
export const mentorContentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  designation: z.string().trim().min(1).max(160),
  company: z.string().trim().min(1).max(120),
  previouslyAt: z.string().trim().max(120).optional().default(""),
  linkedInUrl: optionalUrlSchema,
  photo: z.string().trim().url().max(1000),
});

export const adminCreateMentorBodySchema = mentorContentSchema.extend({
  order: z.number().int().min(0).optional(),
});

export const adminUpdateMentorBodySchema = mentorContentSchema.extend({
  order: z.number().int().min(0).optional(),
});

export const adminMentorVisibilityBodySchema = z.object({
  isPublished: z.boolean(),
});

export type MentorContentInput = z.infer<typeof mentorContentSchema>;
export type AdminCreateMentorBody = z.infer<typeof adminCreateMentorBodySchema>;
export type AdminUpdateMentorBody = z.infer<typeof adminUpdateMentorBodySchema>;
export type AdminMentorVisibilityBody = z.infer<typeof adminMentorVisibilityBodySchema>;

export type AdminLoginBody = z.infer<typeof adminLoginBodySchema>;
export type AdminCreateReadonlyAdminBody = z.infer<typeof adminCreateReadonlyAdminBodySchema>;
export type AdminUpdateUserBody = z.infer<typeof adminUpdateUserBodySchema>;
export type AdminUpdateEnrollmentBody = z.infer<typeof adminUpdateEnrollmentBodySchema>;
export type AdminGrantDirectEnrollmentBody = z.infer<typeof adminGrantDirectEnrollmentBodySchema>;

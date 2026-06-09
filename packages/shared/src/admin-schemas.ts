import { z } from "zod";
import { DIRECT_ENROLLMENT_CATEGORIES, USER_TYPES } from "./user-types.js";
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

/** Set or clear a student's referral code — full and read-only portal admins. */
export const adminSetReferralCodeBodySchema = z.object({
  referralCode: optionalReferralCodeSchema.nullable(),
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
  /** Category/role the admin assigns to the enrolled user (required). */
  category: z.enum(DIRECT_ENROLLMENT_CATEGORIES),
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

/** Mentor photo upload constraints, shared by the client picker and the API. */
export const MENTOR_PHOTO_UPLOAD = {
  maxBytes: 1024 * 1024, // 1 MB
  /** Accepted MIME types. */
  allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"] as const,
  /** File extensions matching the accepted MIME types. */
  allowedExtensions: ["png", "jpg", "jpeg", "webp", "gif"] as const,
  /** Value for an <input type="file" accept="…"> attribute. */
  accept: "image/png,image/jpeg,image/webp,image/gif",
} as const;

export type MentorPhotoMimeType = (typeof MENTOR_PHOTO_UPLOAD.allowedMimeTypes)[number];

export function isAllowedMentorPhotoMime(value: string): value is MentorPhotoMimeType {
  return (MENTOR_PHOTO_UPLOAD.allowedMimeTypes as readonly string[]).includes(value);
}

const optionalUrlSchema = z
  .union([z.string().trim().url().max(1000), z.literal("")])
  .default("");

/**
 * "Previously at" companies. Accepts an array (preferred) or a legacy
 * comma-separated string, and normalises to a clean, de-duplicated list.
 */
const previouslyAtSchema = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => {
    const raw = value === undefined ? [] : Array.isArray(value) ? value : value.split(",");
    const cleaned: string[] = [];
    for (const entry of raw) {
      const trimmed = entry.trim().slice(0, 120);
      if (trimmed && !cleaned.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        cleaned.push(trimmed);
      }
    }
    return cleaned.slice(0, 12);
  });

/** Editable content fields shown on a mentor spotlight card. */
export const mentorContentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  designation: z.string().trim().min(1).max(160),
  company: z.string().trim().min(1).max(120),
  previouslyAt: previouslyAtSchema,
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

/** Company logo upload constraints (allows SVG in addition to raster formats). */
export const COMPANY_LOGO_UPLOAD = {
  maxBytes: 512 * 1024, // 512 KB — logos are small
  allowedMimeTypes: [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ] as const,
  allowedExtensions: ["png", "jpg", "jpeg", "webp", "gif", "svg"] as const,
  accept: "image/png,image/jpeg,image/webp,image/gif,image/svg+xml",
} as const;

export type CompanyLogoMimeType = (typeof COMPANY_LOGO_UPLOAD.allowedMimeTypes)[number];

export function isAllowedCompanyLogoMime(value: string): value is CompanyLogoMimeType {
  return (COMPANY_LOGO_UPLOAD.allowedMimeTypes as readonly string[]).includes(value);
}

/** Create / upsert a company logo (the brand name + a public icon URL). */
export const adminCompanyLogoBodySchema = z.object({
  company: z.string().trim().min(1).max(120),
  logoUrl: z.string().trim().url().max(1000),
});

/** Upper bound for a single course fee (₹) — guards against typos. */
export const MAX_COURSE_FEE_IN_RUPEES = 10_000_000;

/** Admin-managed course fees (rupees). Referral price must not exceed standard. */
export const adminUpdatePricingBodySchema = z
  .object({
    standardInRupees: z.number().int().min(0).max(MAX_COURSE_FEE_IN_RUPEES),
    withReferralCodeInRupees: z.number().int().min(0).max(MAX_COURSE_FEE_IN_RUPEES),
  })
  .refine((data) => data.withReferralCodeInRupees <= data.standardInRupees, {
    message: "Referral price cannot be higher than the standard price",
    path: ["withReferralCodeInRupees"],
  });

export type MentorContentInput = z.infer<typeof mentorContentSchema>;
export type AdminCreateMentorBody = z.infer<typeof adminCreateMentorBodySchema>;
export type AdminUpdateMentorBody = z.infer<typeof adminUpdateMentorBodySchema>;
export type AdminMentorVisibilityBody = z.infer<typeof adminMentorVisibilityBodySchema>;
export type AdminCompanyLogoBody = z.infer<typeof adminCompanyLogoBodySchema>;
export type AdminUpdatePricingBody = z.infer<typeof adminUpdatePricingBodySchema>;

/** Admin-managed cohort seat counts for the enrollment widget. */
export const adminUpdateSeatsBodySchema = z
  .object({
    total: z.number().int().min(1).max(100_000),
    remaining: z.number().int().min(0).max(100_000),
  })
  .refine((data) => data.remaining <= data.total, {
    message: "Remaining seats cannot exceed total capacity",
    path: ["remaining"],
  });

export type AdminUpdateSeatsBody = z.infer<typeof adminUpdateSeatsBodySchema>;

export type AdminLoginBody = z.infer<typeof adminLoginBodySchema>;
export type AdminCreateReadonlyAdminBody = z.infer<typeof adminCreateReadonlyAdminBodySchema>;
export type AdminUpdateUserBody = z.infer<typeof adminUpdateUserBodySchema>;
export type AdminSetReferralCodeBody = z.infer<typeof adminSetReferralCodeBodySchema>;
export type AdminUpdateEnrollmentBody = z.infer<typeof adminUpdateEnrollmentBodySchema>;
export type AdminGrantDirectEnrollmentBody = z.infer<typeof adminGrantDirectEnrollmentBodySchema>;

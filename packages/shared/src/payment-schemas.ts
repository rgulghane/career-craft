import { z } from "zod";

export const razorpayCreateOrderBodySchema = z.object({
  enrollmentId: z.string().min(1),
});

export const razorpayConfirmBodySchema = z.object({
  enrollmentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const razorpayRefundBodySchema = z.object({
  enrollmentId: z.string().min(1),
});

export const adminRefundEnrollmentBodySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type RazorpayCreateOrderBody = z.infer<typeof razorpayCreateOrderBodySchema>;
export type RazorpayConfirmBody = z.infer<typeof razorpayConfirmBodySchema>;
export type RazorpayRefundBody = z.infer<typeof razorpayRefundBodySchema>;

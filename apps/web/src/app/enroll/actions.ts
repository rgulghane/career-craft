"use server";

import { revalidatePath } from "next/cache";
import { enrollBodySchema, messages } from "@career-craft/shared";
import { getSession } from "@/server/auth-session";
import { createEnrollment, EnrollmentError, mockPayEnrollment } from "@/server/services/enrollment";

export type EnrollState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "created";
      enrollmentId: string;
      amountInRupees: number;
      currency: string;
    };

export async function createEnrollmentAction(_prev: EnrollState, formData: FormData): Promise<EnrollState> {
  const user = await getSession();
  if (!user) {
    return { status: "error", message: messages.errors.unauthorized };
  }
  const referralCode = formData.get("referralCode")?.toString() ?? "";
  const parsed = enrollBodySchema.safeParse({ referralCode });
  if (!parsed.success) {
    return { status: "error", message: messages.errors.validation };
  }
  try {
    const enrollment = await createEnrollment(user.id, parsed.data.referralCode);
    revalidatePath("/dashboard");
    revalidatePath("/");
    return {
      status: "created",
      enrollmentId: enrollment.id,
      amountInRupees: enrollment.amountInRupees,
      currency: enrollment.currency,
    };
  } catch (err) {
    if (err instanceof EnrollmentError) {
      return { status: "error", message: err.message };
    }
    console.error("[createEnrollmentAction]", err);
    return { status: "error", message: messages.errors.generic };
  }
}

export type PayState = { status: "idle" } | { status: "error"; message: string } | { status: "paid" };

export async function mockPayEnrollmentAction(_prev: PayState, formData: FormData): Promise<PayState> {
  const user = await getSession();
  if (!user) {
    return { status: "error", message: messages.errors.unauthorized };
  }
  const enrollmentId = formData.get("enrollmentId")?.toString();
  if (!enrollmentId) {
    return { status: "error", message: "Missing enrollment." };
  }
  try {
    await mockPayEnrollment(user.id, enrollmentId);
    revalidatePath("/dashboard");
    revalidatePath("/enroll");
    revalidatePath("/");
    return { status: "paid" };
  } catch (err) {
    if (err instanceof EnrollmentError) {
      return { status: "error", message: err.message };
    }
    return { status: "error", message: messages.errors.generic };
  }
}

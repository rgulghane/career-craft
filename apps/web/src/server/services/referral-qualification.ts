import "server-only";

import { prisma } from "../prisma";
import { serverConfig } from "@/lib/config";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Move referrals from IN_REFUND_WINDOW → QUALIFIED after the refund window elapses.
 */
export async function qualifyDueReferrals(): Promise<{ updated: number }> {
  const now = new Date();
  const windowMs = serverConfig.referral.refundWindowDays * MS_PER_DAY;

  const due = await prisma.referral.findMany({
    where: { status: "IN_REFUND_WINDOW" },
    include: { enrollment: true },
  });

  let updated = 0;
  for (const r of due) {
    const paidAt = r.enrollment.paidAt;
    if (!paidAt) {
      continue;
    }
    if (r.enrollment.status !== "PAID") {
      continue;
    }
    if (now.getTime() - paidAt.getTime() < windowMs) {
      continue;
    }
    await prisma.referral.update({
      where: { id: r.id },
      data: { status: "QUALIFIED", qualifiedAt: now },
    });
    updated += 1;
  }

  return { updated };
}

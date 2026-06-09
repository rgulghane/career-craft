import "server-only";

import { DEFAULT_SEATS, type AdminUpdateSeatsBody } from "@career-craft/shared";
import "../../db/load-env";
import { toDbId } from "../../db/helpers";
import { settingsCollection } from "../../db/mongo-client";
import { SEATS_SETTINGS_ID, type SeatsSettings } from "../../db/types";

function defaults(): Pick<SeatsSettings, "total" | "remaining"> {
  return {
    total: DEFAULT_SEATS.total,
    remaining: DEFAULT_SEATS.remaining,
  };
}

/** Active cohort seat counts for the enrollment widget (admin-managed with built-in fallback). */
export async function getSeatsSettings(): Promise<SeatsSettings> {
  const fallback = defaults();
  try {
    const collection = await settingsCollection();
    const doc = await collection.findOne({ _id: SEATS_SETTINGS_ID });

    const hasTotal = typeof doc?.total === "number";
    const hasRemaining = typeof doc?.remaining === "number";

    return {
      total: hasTotal ? doc!.total! : fallback.total,
      remaining: hasRemaining ? doc!.remaining! : fallback.remaining,
      isCustom: hasTotal || hasRemaining,
      updatedAt: doc?.updatedAt ?? null,
    };
  } catch (err) {
    console.warn("[seats] Falling back to defaults; settings read failed:", err);
    return {
      ...fallback,
      isCustom: false,
      updatedAt: null,
    };
  }
}

export async function updateSeatsSettings(
  body: AdminUpdateSeatsBody,
  adminId?: string,
): Promise<SeatsSettings> {
  const collection = await settingsCollection();
  const now = new Date();

  await collection.updateOne(
    { _id: SEATS_SETTINGS_ID },
    {
      $set: {
        total: body.total,
        remaining: body.remaining,
        updatedAt: now,
        updatedByAdminId: adminId ? toDbId(adminId) : null,
      },
    },
    { upsert: true },
  );

  return {
    total: body.total,
    remaining: body.remaining,
    isCustom: true,
    updatedAt: now,
  };
}

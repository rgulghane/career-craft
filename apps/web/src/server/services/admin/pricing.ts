import "server-only";

import {
  DEFAULT_PRICING,
  getReferralPriceInRupees,
  type AdminUpdatePricingBody,
} from "@career-craft/shared";
import "../../db/load-env";
import { toDbId } from "../../db/helpers";
import { settingsCollection } from "../../db/mongo-client";
import { PRICING_SETTINGS_ID, type PricingSettings, type PricingSettingsDocument } from "../../db/types";

/** Built-in default fees when an admin has not saved custom prices. */
function envDefaults(): { standardInRupees: number; withReferralCodeInRupees: number } {
  return {
    standardInRupees: DEFAULT_PRICING.standardInRupees,
    withReferralCodeInRupees: getReferralPriceInRupees(),
  };
}

/**
 * Resolve the active course fees. Reads the admin-managed singleton from
 * MongoDB and falls back to the environment defaults for any value that has not
 * been set (or when the database is unreachable), so the public site and
 * payment flow always have a price to use.
 */
export async function getPricingSettings(): Promise<PricingSettings> {
  const defaults = envDefaults();
  try {
    const collection = await settingsCollection();
    const doc = (await collection.findOne({ _id: PRICING_SETTINGS_ID })) as PricingSettingsDocument | null;

    const hasStandard = typeof doc?.standardInRupees === "number";
    const hasReferral = typeof doc?.withReferralCodeInRupees === "number";

    return {
      standardInRupees: hasStandard ? doc.standardInRupees! : defaults.standardInRupees,
      withReferralCodeInRupees: hasReferral
        ? doc.withReferralCodeInRupees!
        : defaults.withReferralCodeInRupees,
      isCustom: hasStandard || hasReferral,
      updatedAt: doc?.updatedAt ?? null,
    };
  } catch (err) {
    console.warn("[pricing] Falling back to env defaults; settings read failed:", err);
    return {
      ...defaults,
      isCustom: false,
      updatedAt: null,
    };
  }
}

/** Persist admin-managed course fees (upserts the singleton document). */
export async function updatePricingSettings(
  body: AdminUpdatePricingBody,
  adminId?: string,
): Promise<PricingSettings> {
  const collection = await settingsCollection();
  const now = new Date();

  await collection.updateOne(
    { _id: PRICING_SETTINGS_ID },
    {
      $set: {
        standardInRupees: body.standardInRupees,
        withReferralCodeInRupees: body.withReferralCodeInRupees,
        updatedAt: now,
        updatedByAdminId: adminId ? toDbId(adminId) : null,
      },
    },
    { upsert: true },
  );

  return {
    standardInRupees: body.standardInRupees,
    withReferralCodeInRupees: body.withReferralCodeInRupees,
    isCustom: true,
    updatedAt: now,
  };
}

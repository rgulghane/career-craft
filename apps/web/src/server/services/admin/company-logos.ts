import "server-only";

import { ObjectId } from "mongodb";
import type { AdminCompanyLogoBody } from "@career-craft/shared";
import "../../db/load-env";
import { mapCompanyLogo, toDbId } from "../../db/helpers";
import { companyLogosCollection } from "../../db/mongo-client";
import type { CompanyLogo } from "../../db/types";
import {
  COMPANY_LOGO_SLUGS,
  simpleIconsJsdelivrUrl,
} from "@/components/landing/company-logo-slugs";
import { AdminServiceError } from "./errors";

/** Default brand icons used to bootstrap an empty CompanyLogo collection. */
function seedEntries(): { company: string; logoUrl: string }[] {
  return Object.entries(COMPANY_LOGO_SLUGS).map(([company, slug]) => ({
    company,
    logoUrl: simpleIconsJsdelivrUrl(slug),
  }));
}

/** Insert the default brand icons once, ignoring any that already exist. */
async function seedIfEmpty(): Promise<void> {
  const collection = await companyLogosCollection();
  const existing = await collection.estimatedDocumentCount();
  if (existing > 0) {
    return;
  }
  const now = new Date();
  const docs = seedEntries().map((entry) => ({
    _id: new ObjectId(),
    company: entry.company,
    logoUrl: entry.logoUrl,
    createdAt: now,
    updatedAt: now,
  }));
  if (docs.length === 0) {
    return;
  }
  try {
    await collection.insertMany(docs, { ordered: false });
  } catch {
    // Ignore duplicate-key races — another request may have seeded first.
  }
}

/** All company logos, alphabetised. Auto-seeds the defaults on first use. */
export async function listCompanyLogos(): Promise<CompanyLogo[]> {
  await seedIfEmpty();
  const collection = await companyLogosCollection();
  const docs = await collection
    .find({})
    .collation({ locale: "en", strength: 2 })
    .sort({ company: 1 })
    .toArray();
  return docs.map(mapCompanyLogo);
}

/**
 * Create or update a company logo (matched case-insensitively by name).
 * Returns the stored record.
 */
export async function upsertCompanyLogo(body: AdminCompanyLogoBody): Promise<CompanyLogo> {
  const collection = await companyLogosCollection();
  const company = body.company.trim();
  const logoUrl = body.logoUrl.trim();
  const now = new Date();

  await collection.updateOne(
    { company },
    {
      $set: { logoUrl, updatedAt: now },
      $setOnInsert: { _id: new ObjectId(), company, createdAt: now },
    },
    { upsert: true, collation: { locale: "en", strength: 2 } },
  );

  const doc = await collection.findOne(
    { company },
    { collation: { locale: "en", strength: 2 } },
  );
  if (!doc) {
    throw new Error("Failed to load company logo after upsert");
  }
  return mapCompanyLogo(doc);
}

export async function getCompanyLogo(id: string): Promise<CompanyLogo | null> {
  const collection = await companyLogosCollection();
  const doc = await collection.findOne({ _id: toDbId(id) });
  return doc ? mapCompanyLogo(doc) : null;
}

export async function deleteCompanyLogo(id: string): Promise<void> {
  const collection = await companyLogosCollection();
  const result = await collection.deleteOne({ _id: toDbId(id) });
  if (result.deletedCount !== 1) {
    throw new AdminServiceError(404, "Company logo not found");
  }
}

/**
 * Lookup map of `company name (lowercased)` → `logo URL`, used when rendering
 * mentor cards so the public site reflects admin-managed icons.
 */
export async function getCompanyLogoUrlMap(): Promise<Record<string, string>> {
  const logos = await listCompanyLogos();
  const map: Record<string, string> = {};
  for (const logo of logos) {
    map[logo.company.toLowerCase()] = logo.logoUrl;
  }
  return map;
}

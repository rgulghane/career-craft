/**
 * Move the static landing mentors into the Mentor collection.
 *
 *   npm run db:seed-mentors
 *
 * Idempotent: mentors already present (matched by name) are skipped, so this
 * is safe to run multiple times. Seeded mentors are published immediately so
 * the landing page looks unchanged.
 */
import { ObjectId } from "mongodb";
import { LANDING } from "@career-craft/shared";
import { establishDatabaseConnection } from "../src/server/db/startup";
import { mongoClient, mentorsCollection } from "../src/server/db/mongo-client";
import type { MentorContent } from "../src/server/db/types";

async function main(): Promise<void> {
  await establishDatabaseConnection();
  const mentors = await mentorsCollection();

  const existing = await mentors.find({}).project({ "draft.name": 1 }).toArray();
  const existingNames = new Set(existing.map((m) => m.draft?.name).filter(Boolean));

  const lastOrderDoc = await mentors.find({}).sort({ order: -1 }).limit(1).next();
  let order = lastOrderDoc ? (lastOrderDoc.order ?? 0) + 1 : 0;

  const now = new Date();
  let inserted = 0;
  let skipped = 0;

  for (const m of LANDING.mentors) {
    if (existingNames.has(m.name)) {
      skipped += 1;
      continue;
    }
    const content: MentorContent = {
      name: m.name,
      designation: m.designation,
      company: m.company,
      previouslyAt: m.previouslyAt ?? "",
      linkedInUrl: m.linkedInUrl ?? "",
      photo: m.photo,
    };
    await mentors.insertOne({
      _id: new ObjectId(),
      order: order++,
      draft: content,
      live: content,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    });
    inserted += 1;
  }

  console.log(
    `Mentors seeded — inserted ${inserted}, skipped ${skipped} (already present). Total in DB: ${
      inserted + existing.length
    }.`,
  );
  await (await mongoClient()).close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
